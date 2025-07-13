<script lang="ts">
	import { onMount } from 'svelte';
	import type { Process, ProcessSpecification, EconomicEvent } from '$lib/graphql/types';
	import processesStore from '$lib/stores/processes.store.svelte';
	import processSpecificationsStore from '$lib/stores/process-specifications.store.svelte';
	import foundationService from '$lib/services/foundation.service.svelte';
	import ProcessCreateForm from '$lib/components/ProcessCreateForm.svelte';
	import ProcessSpecificationCreateForm from '$lib/components/ProcessSpecificationCreateForm.svelte';

	// UI state
	let loading = $state(false);
	let error = $state<string | null>(null);
	let activeTab = $state<'processes' | 'specifications' | 'create-process' | 'create-spec'>(
		'processes'
	);
	let selectedProcess = $state<Process | null>(null);
	let processInputs = $state<EconomicEvent[]>([]);
	let processOutputs = $state<EconomicEvent[]>([]);
	let showProcessModal = $state(false);
	let showDeleteConfirm = $state(false);
	let processToDelete = $state<Process | null>(null);

	// Foundation status
	let foundationReady = $state(false);
	let isInitializing = $state(false);

	onMount(async () => {
		await checkFoundationStatus();
		await loadData();
	});

	async function checkFoundationStatus() {
		try {
			if (!foundationService.isInitialized) {
				await foundationService.initialize();
			}

			const status = await foundationService.checkFoundationRequirements();
			foundationReady = status.allReady;
		} catch (err) {
			error = 'Failed to check foundation status';
			console.error(err);
		}
	}

	async function loadData() {
		loading = true;
		error = null;

		try {
			await Promise.all([
				processesStore.fetchAllProcesses(),
				processSpecificationsStore.fetchAllProcessSpecifications()
			]);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load data';
		} finally {
			loading = false;
		}
	}

	async function initializeFoundation() {
		isInitializing = true;
		error = null;

		try {
			await foundationService.ensureFoundationData();
			await checkFoundationStatus();
		} catch (err) {
			error = 'Failed to initialize foundation components';
			console.error(err);
		} finally {
			isInitializing = false;
		}
	}

	async function handleProcessCreated(process: Process) {
		activeTab = 'processes';
		await loadData();
	}

	async function handleProcessSpecCreated(processSpec: ProcessSpecification) {
		activeTab = 'specifications';
		await loadData();
	}

	async function viewProcessDetails(process: Process) {
		selectedProcess = process;
		loading = true;
		error = null;

		try {
			const processWithEvents = await processesStore.getProcessWithEvents(process.id);
			processInputs = processWithEvents.inputs || [];
			processOutputs = processWithEvents.outputs || [];
			showProcessModal = true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load process details';
		} finally {
			loading = false;
		}
	}

	function closeProcessModal() {
		showProcessModal = false;
		selectedProcess = null;
		processInputs = [];
		processOutputs = [];
	}

	function confirmDeleteProcess(process: Process) {
		processToDelete = process;
		showDeleteConfirm = true;
	}

	async function deleteProcess() {
		if (!processToDelete) return;

		loading = true;
		error = null;

		try {
			await processesStore.deleteProcess(processToDelete.id);
			showDeleteConfirm = false;
			processToDelete = null;
			await loadData();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete process';
		} finally {
			loading = false;
		}
	}

	function cancelDelete() {
		showDeleteConfirm = false;
		processToDelete = null;
	}

	function formatDateTime(dateString: string): string {
		if (!dateString) return '';
		return new Date(dateString).toLocaleString();
	}

	function formatQuantity(quantity: any): string {
		if (!quantity) return '';
		const unit = quantity.hasUnit?.symbol || quantity.hasUnit?.label || '';
		return `${quantity.hasNumericalValue} ${unit}`.trim();
	}
</script>

<div class="processes-page">
	<div class="page-header">
		<h1>Processes</h1>
		<p>Manage processes and process specifications that group related economic events.</p>
	</div>

	{#if !foundationReady}
		<div class="foundation-warning">
			<h3>⚠️ Foundation Components Required</h3>
			<p>Processes require foundation components to be initialized first.</p>
			<button
				type="button"
				class="cursor-pointer rounded-lg bg-blue-400 p-4 text-black hover:underline"
				onclick={initializeFoundation}
				disabled={isInitializing}
			>
				{isInitializing ? 'Initializing...' : 'Initialize Foundation Components'}
			</button>
		</div>
	{:else}
		<div class="tabs">
			<button
				class="tab {activeTab === 'processes' ? 'active' : ''}"
				onclick={() => (activeTab = 'processes')}
			>
				Processes ({processesStore.processes.length})
			</button>
			<button
				class="tab {activeTab === 'specifications' ? 'active' : ''}"
				onclick={() => (activeTab = 'specifications')}
			>
				Process Specifications ({processSpecificationsStore.processSpecifications.length})
			</button>
			<button
				class="tab {activeTab === 'create-process' ? 'active' : ''}"
				onclick={() => (activeTab = 'create-process')}
			>
				Create Process
			</button>
			<button
				class="tab {activeTab === 'create-spec' ? 'active' : ''}"
				onclick={() => (activeTab = 'create-spec')}
			>
				Create Specification
			</button>
		</div>

		<div class="tab-content">
			{#if activeTab === 'processes'}
				<div class="processes-list">
					{#if loading}
						<div class="loading">Loading processes...</div>
					{:else if processesStore.processes.length === 0}
						<div class="empty-state">
							<h3>No processes found</h3>
							<p>Create your first process to get started.</p>
							<button class="btn btn-primary" onclick={() => (activeTab = 'create-process')}>
								Create Process
							</button>
						</div>
					{:else}
						<div class="process-grid">
							{#each processesStore.processes as process}
								<div class="process-card">
									<div class="process-header">
										<h3>{process.name}</h3>
										<div class="process-status">
											{#if process.isFinished}
												<span class="status finished">✓ Finished</span>
											{:else}
												<span class="status in-progress">⏳ In Progress</span>
											{/if}
										</div>
									</div>

									{#if process.note}
										<p class="process-description">{process.note}</p>
									{/if}

									{#if process.basedOn}
										<div class="process-spec">
											<strong>Based on:</strong>
											{process.basedOn.name}
										</div>
									{/if}

									{#if process.hasBeginning || process.hasEnd}
										<div class="process-timing">
											{#if process.hasBeginning}
												<div><strong>Start:</strong> {formatDateTime(process.hasBeginning)}</div>
											{/if}
											{#if process.hasEnd}
												<div><strong>End:</strong> {formatDateTime(process.hasEnd)}</div>
											{/if}
										</div>
									{/if}

									{#if process.inScopeOf}
										<div class="process-scope">
											<strong>Scope:</strong>
											{process.inScopeOf.name}
										</div>
									{/if}

									<div class="process-actions">
										<button class="btn btn-secondary" onclick={() => viewProcessDetails(process)}>
											View Details
										</button>
										<button class="btn btn-danger" onclick={() => confirmDeleteProcess(process)}>
											Delete
										</button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{:else if activeTab === 'specifications'}
				<div class="specs-list">
					{#if loading}
						<div class="loading">Loading process specifications...</div>
					{:else if processSpecificationsStore.processSpecifications.length === 0}
						<div class="empty-state">
							<h3>No process specifications found</h3>
							<p>Create your first process specification to get started.</p>
							<button class="btn btn-primary" onclick={() => (activeTab = 'create-spec')}>
								Create Specification
							</button>
						</div>
					{:else}
						<div class="spec-grid">
							{#each processSpecificationsStore.processSpecifications as spec}
								<div class="spec-card">
									<div class="spec-header">
										<h3>{spec.name}</h3>
									</div>

									{#if spec.note}
										<p class="spec-description">{spec.note}</p>
									{/if}

									{#if spec.classifiedAs && spec.classifiedAs.length > 0}
										<div class="spec-classifications">
											<strong>Classifications:</strong>
											<div class="classification-tags">
												{#each spec.classifiedAs as classification}
													<span class="classification-tag">{classification}</span>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{:else if activeTab === 'create-process'}
				<ProcessCreateForm onProcessCreated={handleProcessCreated} />
			{:else if activeTab === 'create-spec'}
				<ProcessSpecificationCreateForm onProcessSpecCreated={handleProcessSpecCreated} />
			{/if}
		</div>
	{/if}

	{#if error}
		<div class="error-message">
			<h3>Error</h3>
			<p>{error}</p>
		</div>
	{/if}
</div>

<!-- Process Details Modal -->
{#if showProcessModal && selectedProcess}
	<div
		role="button"
		tabindex="0"
		onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && closeProcessModal()}
		class="modal-overlay"
		onclick={closeProcessModal}
	>
		<div class="modal-content" onpointerdown={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>{selectedProcess.name}</h2>
				<button aria-label="Close" class="close-btn" onclick={closeProcessModal}>×</button>
			</div>

			<div class="modal-body">
				{#if selectedProcess.note}
					<div class="process-detail">
						<h3>Description</h3>
						<p>{selectedProcess.note}</p>
					</div>
				{/if}

				{#if selectedProcess.basedOn}
					<div class="process-detail">
						<h3>Based On</h3>
						<p>{selectedProcess.basedOn.name}</p>
					</div>
				{/if}

				{#if selectedProcess.hasBeginning || selectedProcess.hasEnd}
					<div class="process-detail">
						<h3>Timing</h3>
						{#if selectedProcess.hasBeginning}
							<p><strong>Start:</strong> {formatDateTime(selectedProcess.hasBeginning)}</p>
						{/if}
						{#if selectedProcess.hasEnd}
							<p><strong>End:</strong> {formatDateTime(selectedProcess.hasEnd)}</p>
						{/if}
					</div>
				{/if}

				{#if selectedProcess.inScopeOf}
					<div class="process-detail">
						<h3>Scope</h3>
						<p>{selectedProcess.inScopeOf.name}</p>
					</div>
				{/if}

				<div class="process-detail">
					<h3>Status</h3>
					<p>{selectedProcess.isFinished ? 'Finished' : 'In Progress'}</p>
				</div>

				{#if processInputs.length > 0}
					<div class="process-detail">
						<h3>Input Events ({processInputs.length})</h3>
						<div class="event-list">
							{#each processInputs as event}
								<div class="event-item">
									<div class="event-header">
										<span class="event-action">{event.action.label}</span>
										<span class="event-time">{formatDateTime(event.hasPointInTime || '')}</span>
									</div>
									{#if event.provider}
										<div class="event-detail">Provider: {event.provider.name}</div>
									{/if}
									{#if event.resourceInventoriedAs}
										<div class="event-detail">Resource: {event.resourceInventoriedAs.name}</div>
									{/if}
									{#if event.resourceQuantity}
										<div class="event-detail">
											Quantity: {formatQuantity(event.resourceQuantity)}
										</div>
									{/if}
									{#if event.note}
										<div class="event-detail">Note: {event.note}</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if processOutputs.length > 0}
					<div class="process-detail">
						<h3>Output Events ({processOutputs.length})</h3>
						<div class="event-list">
							{#each processOutputs as event}
								<div class="event-item">
									<div class="event-header">
										<span class="event-action">{event.action.label}</span>
										<span class="event-time">{formatDateTime(event.hasPointInTime || '')}</span>
									</div>
									{#if event.provider}
										<div class="event-detail">Provider: {event.provider.name}</div>
									{/if}
									{#if event.resourceInventoriedAs}
										<div class="event-detail">Resource: {event.resourceInventoriedAs.name}</div>
									{/if}
									{#if event.resourceQuantity}
										<div class="event-detail">
											Quantity: {formatQuantity(event.resourceQuantity)}
										</div>
									{/if}
									{#if event.note}
										<div class="event-detail">Note: {event.note}</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm && processToDelete}
	<div
		role="button"
		tabindex="0"
		onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && cancelDelete()}
		class="modal-overlay"
		onclick={cancelDelete}
	>
		<div class="modal-content" onpointerdown={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>Confirm Delete</h2>
				<button aria-label="Close" class="close-btn" onclick={cancelDelete}>×</button>
			</div>

			<div class="modal-body">
				<p>Are you sure you want to delete the process "{processToDelete.name}"?</p>
				<p>This action cannot be undone.</p>
			</div>

			<div class="modal-actions">
				<button class="btn btn-secondary" onclick={cancelDelete}>Cancel</button>
				<button class="btn btn-danger" onclick={deleteProcess}>Delete</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.processes-page {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.page-header h1 {
		margin: 0 0 1rem 0;
		color: var(--primary-color);
	}

	.page-header p {
		color: #666;
		margin: 0;
	}

	.foundation-warning {
		background: #fff3cd;
		border: 1px solid #ffeaa7;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 2rem;
		text-align: center;
	}

	.foundation-warning h3 {
		margin: 0 0 1rem 0;
		color: #856404;
	}

	.foundation-warning p {
		margin: 0 0 1rem 0;
		color: #856404;
	}

	.tabs {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
		border-bottom: 2px solid #e9ecef;
		padding-bottom: 1rem;
	}

	.tab {
		padding: 0.75rem 1.5rem;
		border: none;
		background: #f8f9fa;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.3s ease;
		color: #333;
		font-weight: 500;
	}

	.tab.active {
		background: var(--primary-color);
		color: white;
	}

	.tab:hover:not(.active) {
		background: #e9ecef;
	}

	.tab-content {
		min-height: 400px;
	}

	.loading {
		text-align: center;
		padding: 2rem;
		color: #666;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #666;
	}

	.empty-state h3 {
		margin: 0 0 1rem 0;
		color: #333;
	}

	.empty-state p {
		margin: 0 0 2rem 0;
	}

	.process-grid,
	.spec-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.process-card,
	.spec-card {
		background: white;
		border: 1px solid #e9ecef;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s ease;
	}

	.process-card:hover,
	.spec-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.process-header,
	.spec-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.process-header h3,
	.spec-header h3 {
		margin: 0;
		color: var(--primary-color);
		font-size: 1.2rem;
	}

	.process-status {
		flex-shrink: 0;
		margin-left: 1rem;
	}

	.status {
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.status.finished {
		background: #d4edda;
		color: #155724;
	}

	.status.in-progress {
		background: #fff3cd;
		color: #856404;
	}

	.process-description,
	.spec-description {
		color: #666;
		margin-bottom: 1rem;
		line-height: 1.5;
	}

	.process-spec,
	.process-timing,
	.process-scope,
	.spec-classifications {
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.process-timing div {
		margin-bottom: 0.25rem;
	}

	.classification-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.classification-tag {
		background: var(--primary-color);
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
	}

	.process-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-primary {
		background: var(--primary-color);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--primary-dark);
	}

	.btn-secondary {
		background: #6c757d;
		color: white;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #5a6268;
	}

	.btn-danger {
		background: #dc3545;
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		background: #c82333;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error-message {
		background: #f8d7da;
		border: 1px solid #f5c6cb;
		border-radius: 8px;
		padding: 1rem;
		margin-top: 1rem;
		color: #721c24;
	}

	.error-message h3 {
		margin: 0 0 0.5rem 0;
	}

	.error-message p {
		margin: 0;
	}

	/* Modal Styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		border-radius: 8px;
		max-width: 800px;
		max-height: 80vh;
		overflow-y: auto;
		margin: 2rem;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e9ecef;
	}

	.modal-header h2 {
		margin: 0;
		color: var(--primary-color);
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 2rem;
		cursor: pointer;
		color: #666;
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn:hover {
		color: #333;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.modal-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		padding: 1.5rem;
		border-top: 1px solid #e9ecef;
	}

	.process-detail {
		margin-bottom: 1.5rem;
	}

	.process-detail h3 {
		margin: 0 0 0.5rem 0;
		color: var(--primary-color);
		font-size: 1.1rem;
	}

	.process-detail p {
		margin: 0;
		color: #333;
	}

	.event-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.event-item {
		background: #f8f9fa;
		padding: 1rem;
		border-radius: 4px;
		border-left: 4px solid var(--primary-color);
	}

	.event-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.event-action {
		font-weight: 600;
		color: var(--primary-color);
	}

	.event-time {
		font-size: 0.9rem;
		color: #666;
	}

	.event-detail {
		font-size: 0.9rem;
		color: #666;
		margin-bottom: 0.25rem;
	}

	@media (max-width: 768px) {
		.processes-page {
			padding: 1rem;
		}

		.tabs {
			flex-direction: column;
			gap: 0.5rem;
		}

		.process-grid,
		.spec-grid {
			grid-template-columns: 1fr;
		}

		.process-header,
		.spec-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.process-status {
			margin-left: 0;
			margin-top: 0.5rem;
		}

		.process-actions {
			flex-direction: column;
		}

		.modal-content {
			margin: 1rem;
			max-height: 90vh;
		}
	}
</style>
