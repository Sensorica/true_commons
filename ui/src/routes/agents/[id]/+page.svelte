<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Agent, EconomicResource, Process, EconomicEvent } from '$lib/graphql/types';
	import agentsStore from '$lib/stores/agents.store.svelte';
	import resourcesStore from '$lib/stores/resources.store.svelte';
	import processesStore from '$lib/stores/processes.store.svelte';
	import economicEventsStore from '$lib/stores/economic-events.store.svelte';
	import AgentProfileDisplay from '$lib/components/AgentProfileDisplay.svelte';

	// Get agent ID from URL params
	const agentId = $page.params.id;

	// State
	let agent = $state<Agent | null>(null);
	let agentResources = $state<EconomicResource[]>([]);
	let agentProcesses = $state<Process[]>([]);
	let agentEvents = $state<EconomicEvent[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let activeTab = $state<'overview' | 'resources' | 'processes' | 'events'>('overview');

	// Statistics
	let stats = $derived({
		resources: resourcesStore.getResourceStatsByAgent(agentId),
		processes: processesStore.getProcessStatsByAgent(agentId),
		events: economicEventsStore.getEventStatsByAgent(agentId)
	});

	onMount(async () => {
		await loadAgentProfile();
	});

	async function loadAgentProfile() {
		loading = true;
		error = null;

		try {
			// Load all data in parallel
			await Promise.all([
				agentsStore.fetchAllAgents(),
				resourcesStore.fetchAllResources(),
				processesStore.fetchAllProcesses(),
				economicEventsStore.fetchAllEvents()
			]);

			// Find the agent
			agent = agentsStore.getAgentById(agentId);
			if (!agent) {
				error = 'Agent not found';
				return;
			}

			// Get agent-specific data
			agentResources = resourcesStore.getResourcesByAgent(agentId);
			agentProcesses = processesStore.getProcessesByAgent(agentId);
			agentEvents = economicEventsStore.getEventsByAgent(agentId);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load agent profile';
		} finally {
			loading = false;
		}
	}

	function goBack() {
		goto('/agents');
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

	function getActionLabel(actionId: string): string {
		// This would normally come from the actions store
		return actionId.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
	}
</script>

<svelte:head>
	<title>{agent ? `${agent.name} - Agent Profile` : 'Agent Profile'} | True Commons</title>
</svelte:head>

<div class="agent-profile-page">
	<div class="page-header">
		<button class="back-button" onclick={goBack}> ← Back to Agents </button>
		<h1>Agent Profile</h1>
	</div>

	{#if loading}
		<div class="loading">Loading agent profile...</div>
	{:else if error}
		<div class="error-message">
			<h3>Error</h3>
			<p>{error}</p>
		</div>
	{:else if agent}
		<div class="profile-container">
			<!-- Agent Information -->
			<div class="agent-info-section">
				<AgentProfileDisplay {agent} showFullProfile={true} />

				{#if agentsStore.myAgent?.id === agent.id}
					<div class="my-agent-badge">
						<span>🏠 This is your agent profile</span>
					</div>
				{/if}
			</div>

			<!-- Statistics Cards -->
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-header">
						<h3>Resources</h3>
						<span class="stat-icon">📦</span>
					</div>
					<div class="stat-number">{stats.resources.total}</div>
					<div class="stat-details">
						<div class="stat-detail">
							<span>Provided: {stats.resources.provided}</span>
						</div>
						<div class="stat-detail">
							<span>Custodian: {stats.resources.custodian}</span>
						</div>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-header">
						<h3>Processes</h3>
						<span class="stat-icon">🔄</span>
					</div>
					<div class="stat-number">{stats.processes.total}</div>
					<div class="stat-details">
						<div class="stat-detail">
							<span>Finished: {stats.processes.finished}</span>
						</div>
						<div class="stat-detail">
							<span>In Progress: {stats.processes.inProgress}</span>
						</div>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-header">
						<h3>Events</h3>
						<span class="stat-icon">⚡</span>
					</div>
					<div class="stat-number">{stats.events.total}</div>
					<div class="stat-details">
						<div class="stat-detail">
							<span>Provided: {stats.events.provided}</span>
						</div>
						<div class="stat-detail">
							<span>Received: {stats.events.received}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Tabs -->
			<div class="tabs">
				<button
					class="tab {activeTab === 'overview' ? 'active' : ''}"
					onclick={() => (activeTab = 'overview')}
				>
					Overview
				</button>
				<button
					class="tab {activeTab === 'resources' ? 'active' : ''}"
					onclick={() => (activeTab = 'resources')}
				>
					Resources ({agentResources.length})
				</button>
				<button
					class="tab {activeTab === 'processes' ? 'active' : ''}"
					onclick={() => (activeTab = 'processes')}
				>
					Processes ({agentProcesses.length})
				</button>
				<button
					class="tab {activeTab === 'events' ? 'active' : ''}"
					onclick={() => (activeTab = 'events')}
				>
					Events ({agentEvents.length})
				</button>
			</div>

			<!-- Tab Content -->
			<div class="tab-content">
				{#if activeTab === 'overview'}
					<div class="overview-content">
						<div class="overview-grid">
							<!-- Recent Resources -->
							<div class="overview-section">
								<h3>Recent Resources</h3>
								{#if agentResources.length === 0}
									<p class="empty-message">No resources found</p>
								{:else}
									<div class="resource-list">
										{#each agentResources.slice(0, 3) as resource}
											<div class="resource-item">
												<div class="resource-header">
													<span class="resource-name">{resource.name}</span>
													<span class="resource-role">
														{resource.providedBy?.id === agentId ? 'Provider' : 'Custodian'}
													</span>
												</div>
												{#if resource.note}
													<div class="resource-note">{resource.note}</div>
												{/if}
												{#if resource.conformsTo}
													<div class="resource-spec">Type: {resource.conformsTo.name}</div>
												{/if}
											</div>
										{/each}
									</div>
									{#if agentResources.length > 3}
										<button class="view-all-btn" onclick={() => (activeTab = 'resources')}>
											View all {agentResources.length} resources →
										</button>
									{/if}
								{/if}
							</div>

							<!-- Recent Processes -->
							<div class="overview-section">
								<h3>Recent Processes</h3>
								{#if agentProcesses.length === 0}
									<p class="empty-message">No processes found</p>
								{:else}
									<div class="process-list">
										{#each agentProcesses.slice(0, 3) as process}
											<div class="process-item">
												<div class="process-header">
													<span class="process-name">{process.name}</span>
													<span
														class="process-status {process.isFinished ? 'finished' : 'in-progress'}"
													>
														{process.isFinished ? '✓' : '⏳'}
													</span>
												</div>
												{#if process.note}
													<div class="process-note">{process.note}</div>
												{/if}
												{#if process.basedOn}
													<div class="process-spec">Based on: {process.basedOn.name}</div>
												{/if}
											</div>
										{/each}
									</div>
									{#if agentProcesses.length > 3}
										<button class="view-all-btn" onclick={() => (activeTab = 'processes')}>
											View all {agentProcesses.length} processes →
										</button>
									{/if}
								{/if}
							</div>

							<!-- Recent Events -->
							<div class="overview-section">
								<h3>Recent Events</h3>
								{#if agentEvents.length === 0}
									<p class="empty-message">No events found</p>
								{:else}
									<div class="event-list">
										{#each agentEvents.slice(0, 3) as event}
											<div class="event-item">
												<div class="event-header">
													<span class="event-action">{getActionLabel(event.action.id)}</span>
													<span class="event-time"
														>{formatDateTime(event.hasPointInTime || '')}</span
													>
												</div>
												<div class="event-role">
													{event.provider?.id === agentId ? 'Provider' : 'Receiver'}
												</div>
												{#if event.resourceInventoriedAs}
													<div class="event-resource">
														Resource: {event.resourceInventoriedAs.name}
													</div>
												{/if}
												{#if event.resourceQuantity}
													<div class="event-quantity">
														Quantity: {formatQuantity(event.resourceQuantity)}
													</div>
												{/if}
											</div>
										{/each}
									</div>
									{#if agentEvents.length > 3}
										<button class="view-all-btn" onclick={() => (activeTab = 'events')}>
											View all {agentEvents.length} events →
										</button>
									{/if}
								{/if}
							</div>
						</div>
					</div>
				{:else if activeTab === 'resources'}
					<div class="resources-content">
						{#if agentResources.length === 0}
							<div class="empty-state">
								<h3>No resources found</h3>
								<p>This agent has no resources associated with them.</p>
							</div>
						{:else}
							<div class="resource-grid">
								{#each agentResources as resource}
									<div class="resource-card">
										<div class="resource-header">
											<h4>{resource.name}</h4>
											<span class="resource-role-badge">
												{resource.providedBy?.id === agentId ? 'Provider' : 'Custodian'}
											</span>
										</div>
										{#if resource.note}
											<p class="resource-description">{resource.note}</p>
										{/if}
										{#if resource.conformsTo}
											<div class="resource-spec">
												<strong>Type:</strong>
												{resource.conformsTo.name}
											</div>
										{/if}
										{#if resource.currentQuantity}
											<div class="resource-quantity">
												<strong>Quantity:</strong>
												{formatQuantity(resource.currentQuantity)}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{:else if activeTab === 'processes'}
					<div class="processes-content">
						{#if agentProcesses.length === 0}
							<div class="empty-state">
								<h3>No processes found</h3>
								<p>This agent has no processes associated with them.</p>
							</div>
						{:else}
							<div class="process-grid">
								{#each agentProcesses as process}
									<div class="process-card">
										<div class="process-header">
											<h4>{process.name}</h4>
											<span
												class="process-status-badge {process.isFinished
													? 'finished'
													: 'in-progress'}"
											>
												{process.isFinished ? '✓ Finished' : '⏳ In Progress'}
											</span>
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
										{#if process.hasBeginning}
											<div class="process-timing">
												<strong>Started:</strong>
												{formatDateTime(process.hasBeginning)}
											</div>
										{/if}
										{#if process.hasEnd}
											<div class="process-timing">
												<strong>Ended:</strong>
												{formatDateTime(process.hasEnd)}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{:else if activeTab === 'events'}
					<div class="events-content">
						{#if agentEvents.length === 0}
							<div class="empty-state">
								<h3>No events found</h3>
								<p>This agent has no economic events associated with them.</p>
							</div>
						{:else}
							<div class="event-grid">
								{#each agentEvents as event}
									<div class="event-card">
										<div class="event-header">
											<h4>{getActionLabel(event.action.id)}</h4>
											<span class="event-time">{formatDateTime(event.hasPointInTime || '')}</span>
										</div>
										<div class="event-role-badge">
											{event.provider?.id === agentId ? 'Provider' : 'Receiver'}
										</div>
										{#if event.resourceInventoriedAs}
											<div class="event-resource">
												<strong>Resource:</strong>
												{event.resourceInventoriedAs.name}
											</div>
										{/if}
										{#if event.resourceQuantity}
											<div class="event-quantity">
												<strong>Quantity:</strong>
												{formatQuantity(event.resourceQuantity)}
											</div>
										{/if}
										{#if event.note}
											<div class="event-note">{event.note}</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="error-message">
			<h3>Agent Not Found</h3>
			<p>The requested agent could not be found.</p>
		</div>
	{/if}
</div>

<style>
	.agent-profile-page {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.back-button {
		background: none;
		border: none;
		color: var(--primary-color);
		cursor: pointer;
		font-size: 1rem;
		padding: 0.5rem;
		border-radius: 4px;
		transition: background-color 0.2s ease;
	}

	.back-button:hover {
		background-color: rgba(0, 123, 255, 0.1);
	}

	.page-header h1 {
		margin: 0;
		color: var(--primary-color);
	}

	.loading {
		text-align: center;
		padding: 3rem;
		color: #666;
	}

	.error-message {
		background: #f8d7da;
		border: 1px solid #f5c6cb;
		border-radius: 8px;
		padding: 2rem;
		text-align: center;
		color: #721c24;
	}

	.error-message h3 {
		margin: 0 0 1rem 0;
	}

	.error-message p {
		margin: 0;
	}

	.profile-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.agent-info-section {
		background: white;
		border: 1px solid #e9ecef;
		border-radius: 8px;
		padding: 2rem;
		position: relative;
	}

	.my-agent-badge {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: #d4edda;
		color: #155724;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.stat-card {
		background: white;
		border: 1px solid #e9ecef;
		border-radius: 8px;
		padding: 1.5rem;
		text-align: center;
	}

	.stat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.stat-header h3 {
		margin: 0;
		color: #333;
		font-size: 1.1rem;
	}

	.stat-icon {
		font-size: 1.5rem;
	}

	.stat-number {
		font-size: 2.5rem;
		font-weight: bold;
		color: var(--primary-color);
		margin-bottom: 0.5rem;
	}

	.stat-details {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.stat-detail {
		font-size: 0.9rem;
		color: #666;
	}

	.tabs {
		display: flex;
		gap: 1rem;
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
		background: white;
		border: 1px solid #e9ecef;
		border-radius: 8px;
		padding: 2rem;
		min-height: 400px;
	}

	.overview-content {
		width: 100%;
	}

	.overview-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
	}

	.overview-section {
		background: #f8f9fa;
		border-radius: 8px;
		padding: 1.5rem;
	}

	.overview-section h3 {
		margin: 0 0 1rem 0;
		color: var(--primary-color);
		border-bottom: 2px solid #e9ecef;
		padding-bottom: 0.5rem;
	}

	.empty-message {
		color: #666;
		font-style: italic;
		text-align: center;
		padding: 2rem;
	}

	.resource-list,
	.process-list,
	.event-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.resource-item,
	.process-item,
	.event-item {
		background: white;
		padding: 1rem;
		border-radius: 6px;
		border: 1px solid #e9ecef;
	}

	.resource-header,
	.process-header,
	.event-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.resource-name,
	.process-name,
	.event-action {
		font-weight: 600;
		color: #333;
	}

	.resource-role,
	.process-status,
	.event-time {
		font-size: 0.9rem;
		color: #666;
	}

	.resource-note,
	.process-note,
	.event-role,
	.resource-spec,
	.process-spec,
	.event-resource,
	.event-quantity {
		font-size: 0.9rem;
		color: #666;
		margin-bottom: 0.25rem;
	}

	.process-status.finished {
		color: #155724;
	}

	.process-status.in-progress {
		color: #856404;
	}

	.view-all-btn {
		background: none;
		border: none;
		color: var(--primary-color);
		cursor: pointer;
		font-size: 0.9rem;
		margin-top: 1rem;
		padding: 0.5rem;
		border-radius: 4px;
		transition: background-color 0.2s ease;
	}

	.view-all-btn:hover {
		background-color: rgba(0, 123, 255, 0.1);
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
		margin: 0;
	}

	.resource-grid,
	.process-grid,
	.event-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.resource-card,
	.process-card,
	.event-card {
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 8px;
		padding: 1.5rem;
		transition: transform 0.2s ease;
	}

	.resource-card:hover,
	.process-card:hover,
	.event-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.resource-card h4,
	.process-card h4,
	.event-card h4 {
		margin: 0;
		color: var(--primary-color);
		font-size: 1.1rem;
	}

	.resource-role-badge,
	.process-status-badge,
	.event-role-badge {
		font-size: 0.8rem;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-weight: 500;
	}

	.resource-role-badge {
		background: #e3f2fd;
		color: #1976d2;
	}

	.process-status-badge.finished {
		background: #d4edda;
		color: #155724;
	}

	.process-status-badge.in-progress {
		background: #fff3cd;
		color: #856404;
	}

	.event-role-badge {
		background: #f3e5f5;
		color: #7b1fa2;
	}

	.resource-description,
	.process-description {
		color: #666;
		margin: 1rem 0;
		line-height: 1.4;
	}

	.resource-spec,
	.process-spec,
	.process-timing,
	.event-resource,
	.event-quantity,
	.event-note {
		font-size: 0.9rem;
		color: #666;
		margin-bottom: 0.5rem;
	}

	.resource-quantity {
		font-size: 0.9rem;
		color: #666;
	}

	@media (max-width: 768px) {
		.agent-profile-page {
			padding: 1rem;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.overview-grid {
			grid-template-columns: 1fr;
		}

		.resource-grid,
		.process-grid,
		.event-grid {
			grid-template-columns: 1fr;
		}

		.tabs {
			flex-direction: column;
			gap: 0.5rem;
		}

		.stat-details {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
