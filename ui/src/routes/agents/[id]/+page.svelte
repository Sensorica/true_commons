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

<div class="min-h-screen bg-gray-900">
	<!-- Header -->
	<div class="border-b border-gray-700 bg-gray-800 shadow-sm">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<button
					onclick={goBack}
					class="inline-flex items-center rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-200 transition-colors duration-200 hover:bg-gray-600 hover:text-white"
				>
					<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						></path>
					</svg>
					Back to Agents
				</button>

				{#if agentsStore.myAgent?.id === agent?.id}
					<div
						class="inline-flex items-center rounded-full bg-emerald-900 px-3 py-1 text-sm font-medium text-emerald-300"
					>
						<svg class="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L10 4.414l8.293 8.293a1 1 0 001.414-1.414l-9-9z"
							></path>
						</svg>
						Your Profile
					</div>
				{/if}
			</div>
		</div>
	</div>

	{#if loading}
		<div class="flex min-h-96 items-center justify-center">
			<div class="text-center">
				<div
					class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent"
				></div>
				<p class="text-gray-400">Loading agent profile...</p>
			</div>
		</div>
	{:else if error}
		<div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
			<div class="rounded-xl border border-red-800 bg-red-900 p-8 text-center">
				<svg
					class="mx-auto mb-4 h-12 w-12 text-red-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
					></path>
				</svg>
				<h3 class="mb-2 text-lg font-semibold text-red-300">Error Loading Profile</h3>
				<p class="text-red-400">{error}</p>
			</div>
		</div>
	{:else if agent}
		<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<!-- Hero Section -->
			<div class="mb-8 overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-lg">
				<div class="px-8 py-12">
					<AgentProfileDisplay {agent} showFullProfile={true} />
				</div>
			</div>

			<!-- Statistics Grid -->
			<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
				<!-- Resources Card -->
				<div
					class="transform rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg transition-transform duration-200 hover:scale-105"
				>
					<div class="mb-4 flex items-center justify-between">
						<div class="rounded-lg bg-blue-900 p-2">
							<svg
								class="h-6 w-6 text-blue-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
								></path>
							</svg>
						</div>
						<span class="text-3xl font-bold text-blue-400">{stats.resources.total}</span>
					</div>
					<h3 class="mb-3 text-lg font-semibold text-white">Resources</h3>
					<div class="flex justify-between text-sm text-gray-400">
						<span>Provided: {stats.resources.provided}</span>
						<span>Custodian: {stats.resources.custodian}</span>
					</div>
				</div>

				<!-- Processes Card -->
				<div
					class="transform rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg transition-transform duration-200 hover:scale-105"
				>
					<div class="mb-4 flex items-center justify-between">
						<div class="rounded-lg bg-emerald-900 p-2">
							<svg
								class="h-6 w-6 text-emerald-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								></path>
							</svg>
						</div>
						<span class="text-3xl font-bold text-emerald-400">{stats.processes.total}</span>
					</div>
					<h3 class="mb-3 text-lg font-semibold text-white">Processes</h3>
					<div class="flex justify-between text-sm text-gray-400">
						<span>Finished: {stats.processes.finished}</span>
						<span>In Progress: {stats.processes.inProgress}</span>
					</div>
				</div>

				<!-- Events Card -->
				<div
					class="transform rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg transition-transform duration-200 hover:scale-105"
				>
					<div class="mb-4 flex items-center justify-between">
						<div class="rounded-lg bg-purple-900 p-2">
							<svg
								class="h-6 w-6 text-purple-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								></path>
							</svg>
						</div>
						<span class="text-3xl font-bold text-purple-400">{stats.events.total}</span>
					</div>
					<h3 class="mb-3 text-lg font-semibold text-white">Events</h3>
					<div class="flex justify-between text-sm text-gray-400">
						<span>Provided: {stats.events.provided}</span>
						<span>Received: {stats.events.received}</span>
					</div>
				</div>
			</div>

			<!-- Main Content -->
			<div class="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-lg">
				<!-- Navigation Tabs -->
				<div class="border-b border-gray-700">
					<nav class="flex space-x-8 px-6" aria-label="Tabs">
						<button
							onclick={() => (activeTab = 'overview')}
							class="border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 {activeTab ===
							'overview'
								? 'border-blue-400 text-blue-400'
								: 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200'}"
						>
							Overview
						</button>
						<button
							onclick={() => (activeTab = 'resources')}
							class="border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 {activeTab ===
							'resources'
								? 'border-blue-400 text-blue-400'
								: 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200'}"
						>
							Resources
							<span
								class="ml-2 inline-flex items-center rounded-full bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-300"
							>
								{agentResources.length}
							</span>
						</button>
						<button
							onclick={() => (activeTab = 'processes')}
							class="border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 {activeTab ===
							'processes'
								? 'border-blue-400 text-blue-400'
								: 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200'}"
						>
							Processes
							<span
								class="ml-2 inline-flex items-center rounded-full bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-300"
							>
								{agentProcesses.length}
							</span>
						</button>
						<button
							onclick={() => (activeTab = 'events')}
							class="border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 {activeTab ===
							'events'
								? 'border-blue-400 text-blue-400'
								: 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200'}"
						>
							Events
							<span
								class="ml-2 inline-flex items-center rounded-full bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-300"
							>
								{agentEvents.length}
							</span>
						</button>
					</nav>
				</div>

				<!-- Tab Content -->
				<div class="p-6">
					{#if activeTab === 'overview'}
						<div class="space-y-8">
							<!-- Overview Grid -->
							<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
								<!-- Recent Resources -->
								<div class="rounded-xl bg-gray-700 p-6">
									<div class="mb-4 flex items-center justify-between">
										<h3 class="text-lg font-semibold text-white">Recent Resources</h3>
										<svg
											class="h-5 w-5 text-blue-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
											></path>
										</svg>
									</div>
									{#if agentResources.length === 0}
										<p class="py-8 text-center text-sm text-gray-400 italic">No resources found</p>
									{:else}
										<div class="space-y-3">
											{#each agentResources.slice(0, 3) as resource}
												<div class="rounded-lg border border-gray-600 bg-gray-800 p-4">
													<div class="mb-2 flex items-start justify-between">
														<h4 class="font-medium text-white">{resource.name}</h4>
														<span
															class="inline-flex items-center rounded-full bg-blue-900 px-2 py-1 text-xs font-medium text-blue-300"
														>
															{resource.providedBy?.id === agentId ? 'Provider' : 'Custodian'}
														</span>
													</div>
													{#if resource.note}
														<p class="mb-2 text-sm text-gray-400">{resource.note}</p>
													{/if}
													{#if resource.conformsTo}
														<div class="text-xs text-gray-500">
															Type: {resource.conformsTo.name}
														</div>
													{/if}
												</div>
											{/each}
										</div>
										{#if agentResources.length > 3}
											<button
												onclick={() => (activeTab = 'resources')}
												class="mt-4 w-full text-sm font-medium text-blue-400 hover:text-blue-300"
											>
												View all {agentResources.length} resources →
											</button>
										{/if}
									{/if}
								</div>

								<!-- Recent Processes -->
								<div class="rounded-xl bg-gray-700 p-6">
									<div class="mb-4 flex items-center justify-between">
										<h3 class="text-lg font-semibold text-white">Recent Processes</h3>
										<svg
											class="h-5 w-5 text-emerald-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
											></path>
										</svg>
									</div>
									{#if agentProcesses.length === 0}
										<p class="py-8 text-center text-sm text-gray-400 italic">No processes found</p>
									{:else}
										<div class="space-y-3">
											{#each agentProcesses.slice(0, 3) as process}
												<div class="rounded-lg border border-gray-600 bg-gray-800 p-4">
													<div class="mb-2 flex items-start justify-between">
														<h4 class="font-medium text-white">{process.name}</h4>
														<span
															class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {process.isFinished
																? 'bg-emerald-900 text-emerald-300'
																: 'bg-amber-900 text-amber-300'}"
														>
															{process.isFinished ? '✓ Finished' : '⏳ In Progress'}
														</span>
													</div>
													{#if process.note}
														<p class="mb-2 text-sm text-gray-400">{process.note}</p>
													{/if}
													{#if process.basedOn}
														<div class="text-xs text-gray-500">
															Based on: {process.basedOn.name}
														</div>
													{/if}
												</div>
											{/each}
										</div>
										{#if agentProcesses.length > 3}
											<button
												onclick={() => (activeTab = 'processes')}
												class="mt-4 w-full text-sm font-medium text-blue-400 hover:text-blue-300"
											>
												View all {agentProcesses.length} processes →
											</button>
										{/if}
									{/if}
								</div>

								<!-- Recent Events -->
								<div class="rounded-xl bg-gray-700 p-6">
									<div class="mb-4 flex items-center justify-between">
										<h3 class="text-lg font-semibold text-white">Recent Events</h3>
										<svg
											class="h-5 w-5 text-purple-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M13 10V3L4 14h7v7l9-11h-7z"
											></path>
										</svg>
									</div>
									{#if agentEvents.length === 0}
										<p class="py-8 text-center text-sm text-gray-400 italic">No events found</p>
									{:else}
										<div class="space-y-3">
											{#each agentEvents.slice(0, 3) as event}
												<div class="rounded-lg border border-gray-600 bg-gray-800 p-4">
													<div class="mb-2 flex items-start justify-between">
														<h4 class="font-medium text-white">
															{getActionLabel(event.action.id)}
														</h4>
														<span class="text-xs text-gray-400"
															>{formatDateTime(event.hasPointInTime || '')}</span
														>
													</div>
													<div class="mb-2 text-sm text-gray-400">
														{event.provider?.id === agentId ? 'Provider' : 'Receiver'}
													</div>
													{#if event.resourceInventoriedAs}
														<div class="mb-1 text-xs text-gray-500">
															Resource: {event.resourceInventoriedAs.name}
														</div>
													{/if}
													{#if event.resourceQuantity}
														<div class="text-xs text-gray-500">
															Quantity: {formatQuantity(event.resourceQuantity)}
														</div>
													{/if}
												</div>
											{/each}
										</div>
										{#if agentEvents.length > 3}
											<button
												onclick={() => (activeTab = 'events')}
												class="mt-4 w-full text-sm font-medium text-blue-400 hover:text-blue-300"
											>
												View all {agentEvents.length} events →
											</button>
										{/if}
									{/if}
								</div>
							</div>
						</div>
					{:else if activeTab === 'resources'}
						<div>
							<div class="mb-6 flex items-center justify-between">
								<h2 class="text-xl font-semibold text-white">Resources</h2>
							</div>
							{#if agentResources.length === 0}
								<div class="py-16 text-center">
									<svg
										class="mx-auto mb-4 h-16 w-16 text-gray-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
										></path>
									</svg>
									<h3 class="mb-2 text-lg font-medium text-white">No resources found</h3>
									<p class="text-gray-400">This agent has no resources associated with them.</p>
								</div>
							{:else}
								<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
									{#each agentResources as resource}
										<div
											class="rounded-xl border border-gray-600 bg-gray-700 p-6 transition-shadow duration-200 hover:shadow-lg"
										>
											<div class="mb-4 flex items-start justify-between">
												<h3 class="text-lg font-semibold text-white">{resource.name}</h3>
												<span
													class="inline-flex items-center rounded-full bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-300"
												>
													{resource.providedBy?.id === agentId ? 'Provider' : 'Custodian'}
												</span>
											</div>
											{#if resource.note}
												<p class="mb-4 line-clamp-3 text-sm text-gray-400">{resource.note}</p>
											{/if}
											<div class="space-y-2">
												{#if resource.conformsTo}
													<div class="flex items-center text-sm">
														<span class="mr-2 font-medium text-gray-300">Type:</span>
														<span class="text-gray-400">{resource.conformsTo.name}</span>
													</div>
												{/if}
												{#if resource.currentQuantity}
													<div class="flex items-center text-sm">
														<span class="mr-2 font-medium text-gray-300">Quantity:</span>
														<span class="text-gray-400"
															>{formatQuantity(resource.currentQuantity)}</span
														>
													</div>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{:else if activeTab === 'processes'}
						<div>
							<div class="mb-6 flex items-center justify-between">
								<h2 class="text-xl font-semibold text-white">Processes</h2>
							</div>
							{#if agentProcesses.length === 0}
								<div class="py-16 text-center">
									<svg
										class="mx-auto mb-4 h-16 w-16 text-gray-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										></path>
									</svg>
									<h3 class="mb-2 text-lg font-medium text-white">No processes found</h3>
									<p class="text-gray-400">This agent has no processes associated with them.</p>
								</div>
							{:else}
								<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
									{#each agentProcesses as process}
										<div
											class="rounded-xl border border-gray-600 bg-gray-700 p-6 transition-shadow duration-200 hover:shadow-lg"
										>
											<div class="mb-4 flex items-start justify-between">
												<h3 class="text-lg font-semibold text-white">{process.name}</h3>
												<span
													class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {process.isFinished
														? 'bg-emerald-900 text-emerald-300'
														: 'bg-amber-900 text-amber-300'}"
												>
													{process.isFinished ? '✓ Finished' : '⏳ In Progress'}
												</span>
											</div>
											{#if process.note}
												<p class="mb-4 line-clamp-3 text-sm text-gray-400">{process.note}</p>
											{/if}
											<div class="space-y-2">
												{#if process.basedOn}
													<div class="flex items-center text-sm">
														<span class="mr-2 font-medium text-gray-300">Based on:</span>
														<span class="text-gray-400">{process.basedOn.name}</span>
													</div>
												{/if}
												{#if process.hasBeginning}
													<div class="flex items-center text-sm">
														<span class="mr-2 font-medium text-gray-300">Started:</span>
														<span class="text-gray-400">{formatDateTime(process.hasBeginning)}</span
														>
													</div>
												{/if}
												{#if process.hasEnd}
													<div class="flex items-center text-sm">
														<span class="mr-2 font-medium text-gray-300">Ended:</span>
														<span class="text-gray-400">{formatDateTime(process.hasEnd)}</span>
													</div>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{:else if activeTab === 'events'}
						<div>
							<div class="mb-6 flex items-center justify-between">
								<h2 class="text-xl font-semibold text-white">Events</h2>
							</div>
							{#if agentEvents.length === 0}
								<div class="py-16 text-center">
									<svg
										class="mx-auto mb-4 h-16 w-16 text-gray-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 10V3L4 14h7v7l9-11h-7z"
										></path>
									</svg>
									<h3 class="mb-2 text-lg font-medium text-white">No events found</h3>
									<p class="text-gray-400">
										This agent has no economic events associated with them.
									</p>
								</div>
							{:else}
								<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
									{#each agentEvents as event}
										<div
											class="rounded-xl border border-gray-600 bg-gray-700 p-6 transition-shadow duration-200 hover:shadow-lg"
										>
											<div class="mb-4 flex items-start justify-between">
												<h3 class="text-lg font-semibold text-white">
													{getActionLabel(event.action.id)}
												</h3>
												<span class="text-xs text-gray-400"
													>{formatDateTime(event.hasPointInTime || '')}</span
												>
											</div>
											<div class="mb-4">
												<span
													class="inline-flex items-center rounded-full bg-purple-900 px-2.5 py-0.5 text-xs font-medium text-purple-300"
												>
													{event.provider?.id === agentId ? 'Provider' : 'Receiver'}
												</span>
											</div>
											<div class="space-y-2">
												{#if event.resourceInventoriedAs}
													<div class="flex items-center text-sm">
														<span class="mr-2 font-medium text-gray-300">Resource:</span>
														<span class="text-gray-400">{event.resourceInventoriedAs.name}</span>
													</div>
												{/if}
												{#if event.resourceQuantity}
													<div class="flex items-center text-sm">
														<span class="mr-2 font-medium text-gray-300">Quantity:</span>
														<span class="text-gray-400"
															>{formatQuantity(event.resourceQuantity)}</span
														>
													</div>
												{/if}
												{#if event.note}
													<div class="mt-3 text-sm text-gray-400">{event.note}</div>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
			<div class="rounded-xl border border-gray-700 bg-gray-800 p-8 text-center">
				<svg
					class="mx-auto mb-4 h-12 w-12 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					></path>
				</svg>
				<h3 class="mb-2 text-lg font-semibold text-white">Agent Not Found</h3>
				<p class="text-gray-400">The requested agent could not be found.</p>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Custom utility for line clamping if not available */
	.line-clamp-3 {
		display: -webkit-box;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
