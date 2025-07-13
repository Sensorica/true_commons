<script lang="ts">
	import { onMount } from 'svelte';
	import type { ProcessCreateParams } from '$lib/graphql/types';
	import processesStore from '$lib/stores/processes.store.svelte';
	import processSpecificationsStore from '$lib/stores/process-specifications.store.svelte';
	import agentsStore from '$lib/stores/agents.store.svelte';
	import foundationService from '$lib/services/foundation.service.svelte';

	let { onProcessCreated = () => {} } = $props<{
		onProcessCreated?: (process: any) => void;
	}>();

	// Form state
	let formData: ProcessCreateParams = $state({
		name: '',
		note: '',
		basedOn: '',
		inScopeOf: '',
		hasBeginning: '',
		hasEnd: '',
		isFinished: false,
		plannedWithin: ''
	});

	// UI state
	let loading = $state(false);
	let error = $state<string | null>(null);
	let validationErrors = $state<string[]>([]);
	let foundationReady = $state(false);
	let isInitializing = $state(false);

	// Check foundation status
	onMount(async () => {
		await checkFoundationStatus();
		await loadProcessSpecifications();
		await loadAgents();
	});

	async function checkFoundationStatus() {
		try {
			if (!foundationService.isInitialized) {
				await foundationService.initialize();
			}

			const status = await foundationService.checkFoundationRequirements();
			foundationReady = status.allReady;

			if (!foundationReady) {
				error = 'Foundation components not ready. Please initialize foundation components first.';
			}
		} catch (err) {
			error = 'Failed to check foundation status';
			console.error(err);
		}
	}

	async function loadProcessSpecifications() {
		try {
			await processSpecificationsStore.fetchAllProcessSpecifications();
		} catch (err) {
			console.error('Failed to load process specifications:', err);
		}
	}

	async function loadAgents() {
		try {
			await agentsStore.fetchAllAgents();
		} catch (err) {
			console.error('Failed to load agents:', err);
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

	async function validateForm(): Promise<boolean> {
		if (!foundationReady) {
			validationErrors = ['Foundation components not ready'];
			return false;
		}

		validationErrors = await processesStore.validateProcessData(formData);
		return validationErrors.length === 0;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (loading) return;

		const isValid = await validateForm();
		if (!isValid) return;

		loading = true;
		error = null;

		try {
			const createdProcess = await processesStore.createProcess(formData);
			onProcessCreated(createdProcess);

			// Reset form
			formData = {
				name: '',
				note: '',
				basedOn: '',
				inScopeOf: '',
				hasBeginning: '',
				hasEnd: '',
				isFinished: false,
				plannedWithin: ''
			};
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create process';
		} finally {
			loading = false;
		}
	}

	// Helper function to format datetime for input
	function formatDateTimeForInput(dateString: string): string {
		if (!dateString) return '';
		return new Date(dateString).toISOString().slice(0, 16);
	}

	// Update datetime when changed
	function handleDateTimeChange(event: Event, field: 'hasBeginning' | 'hasEnd') {
		const target = event.target as HTMLInputElement;
		if (target.value) {
			formData[field] = new Date(target.value).toISOString();
		} else {
			formData[field] = '';
		}
	}
</script>

<div class="process-form">
	<div class="form-header">
		<h2>Create Process</h2>
		<p class="description">
			Processes represent activities that transform inputs into outputs. They can group related
			economic events together as part of workflows.
		</p>
	</div>

	{#if !foundationReady}
		<div class="foundation-warning">
			<h3>⚠️ Foundation Components Required</h3>
			<p>Processes require foundation components to be initialized first.</p>
			<button
				type="button"
				class="btn btn-primary"
				onclick={initializeFoundation}
				disabled={isInitializing}
			>
				{isInitializing ? 'Initializing...' : 'Initialize Foundation Components'}
			</button>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="process-form">
			<div class="form-section">
				<h3>Basic Information</h3>

				<div class="form-group">
					<label for="name">Process Name *</label>
					<input
						type="text"
						id="name"
						bind:value={formData.name}
						placeholder="Enter process name..."
						required
					/>
				</div>

				<div class="form-group">
					<label for="note">Description</label>
					<textarea
						id="note"
						bind:value={formData.note}
						placeholder="Describe what this process does..."
						rows="3"
					></textarea>
				</div>

				<div class="form-group">
					<label for="basedOn">Based On (Process Specification)</label>
					<select id="basedOn" bind:value={formData.basedOn}>
						<option value="">Select a process specification...</option>
						{#each processSpecificationsStore.processSpecifications as spec}
							<option value={spec.id}>{spec.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="form-section">
				<h3>Timing</h3>

				<div class="form-group">
					<label for="hasBeginning">Start Time</label>
					<input
						type="datetime-local"
						id="hasBeginning"
						value={formatDateTimeForInput(formData.hasBeginning || '')}
						onchange={(e) => handleDateTimeChange(e, 'hasBeginning')}
					/>
				</div>

				<div class="form-group">
					<label for="hasEnd">End Time</label>
					<input
						type="datetime-local"
						id="hasEnd"
						value={formatDateTimeForInput(formData.hasEnd || '')}
						onchange={(e) => handleDateTimeChange(e, 'hasEnd')}
					/>
				</div>

				<div class="form-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={formData.isFinished} />
						Process is finished
					</label>
				</div>
			</div>

			<div class="form-section">
				<h3>Scoping</h3>

				<div class="form-group">
					<label for="inScopeOf">In Scope Of (Agent)</label>
					<select id="inScopeOf" bind:value={formData.inScopeOf}>
						<option value="">Select an agent...</option>
						{#each agentsStore.agents as agent}
							<option value={agent.id}>{agent.name}</option>
						{/each}
					</select>
				</div>
			</div>

			{#if validationErrors.length > 0}
				<div class="error-section">
					<h3>Validation Errors</h3>
					<ul>
						{#each validationErrors as error}
							<li>{error}</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if error}
				<div class="error-section">
					<h3>Error</h3>
					<p>{error}</p>
				</div>
			{/if}

			<div class="form-actions">
				<button type="submit" class="btn btn-primary" disabled={loading}>
					{loading ? 'Creating...' : 'Create Process'}
				</button>
			</div>
		</form>
	{/if}
</div>

<style>
	.process-form {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem;
	}

	.form-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.form-header h2 {
		margin: 0 0 1rem 0;
		color: var(--primary-color);
	}

	.description {
		color: #666;
		margin: 0;
		line-height: 1.5;
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

	.form-section {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: #f8f9fa;
		border-radius: 8px;
	}

	.form-section h3 {
		margin: 0 0 1rem 0;
		color: var(--primary-color);
		border-bottom: 2px solid #e9ecef;
		padding-bottom: 0.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #333;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		color: #333;
	}

	.checkbox-label input[type='checkbox'] {
		margin: 0;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		transition: border-color 0.3s ease;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
	}

	.error-section {
		background: #f8d7da;
		border: 1px solid #f5c6cb;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.error-section h3 {
		margin: 0 0 0.5rem 0;
		color: #721c24;
	}

	.error-section p {
		margin: 0;
		color: #721c24;
	}

	.error-section ul {
		margin: 0;
		padding-left: 1.5rem;
		color: #721c24;
	}

	.form-actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-top: 2rem;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-primary {
		background: var(--primary-color);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--primary-dark);
		transform: translateY(-2px);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	@media (max-width: 768px) {
		.process-form {
			padding: 1rem;
		}

		.form-section {
			padding: 1rem;
		}
	}
</style>
