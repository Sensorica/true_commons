<script lang="ts">
	import type { Agent, EconomicResource, EconomicEvent } from '$lib/graphql/types';
	import { agentsStore, economicResourcesStore, economicEventsStore } from '$lib/stores';
	import holochainClientService from '$lib/services/holochain_client_service.svelte';
	import hreaService from '$lib/services/hrea.service.svelte';
	import { onMount } from 'svelte';

	// Reactive state derived from stores
	let isConnected = $state(false);
	let isLoading = $state(true);
	let connectionStatus = $state('Connecting to True Commons...');
	let initializationError = $state<string | null>(null);

	// Agent creation form state
	let showCreateAgentForm = $state(false);
	let agentFormData = $state({
		name: '',
		note: '',
		primaryLocation: ''
	});
	let isCreatingAgent = $state(false);
	let createAgentError = $state<string | null>(null);

	// Derived stats from store data
	let stats = $derived({
		total_agents: agentsStore.agents.length,
		total_resources: economicResourcesStore.resources.length,
		total_events: economicEventsStore.events.length,
		total_value_created: economicEventsStore.events.reduce((total, event) => {
			return total + (event.resourceQuantity?.hasNumericalValue || 0);
		}, 0),
		active_collaborations: new Set(
			economicEventsStore.events.map((event) => event.inScopeOf?.id).filter(Boolean)
		).size
	});

	// Recent data for dashboard display
	let recentResources = $derived(economicResourcesStore.resources.slice(0, 3));
	let activeAgents = $derived(agentsStore.agents.slice(0, 5)); // Show more agents for testing

	// Loading states from stores
	let storesLoading = $derived(
		agentsStore.loading || economicResourcesStore.loading || economicEventsStore.loading
	);
	let storesError = $derived(
		agentsStore.error || economicResourcesStore.error || economicEventsStore.error
	);

	onMount(async () => {
		try {
			// Connect to Holochain
			await holochainClientService.connectClient();
			isConnected = holochainClientService.isConnected;

			if (isConnected) {
				connectionStatus = 'Connected to hREA backend';

				// Initialize hREA service
				await hreaService.initialize();

				if (hreaService.isInitialized) {
					// Load data from all stores
					await Promise.all([
						agentsStore.fetchAllAgents(),
						agentsStore.fetchMyAgent(),
						economicResourcesStore.fetchAllResources(),
						economicEventsStore.fetchAllEvents()
					]);
				} else {
					throw new Error(hreaService.initializationError || 'Failed to initialize hREA service');
				}
			} else {
				connectionStatus = 'Running in demo mode';
				initializationError = holochainClientService.connectionError;
			}
		} catch (error) {
			console.error('Failed to initialize True Commons:', error);
			connectionStatus = 'Connection failed - demo mode active';
			initializationError = error instanceof Error ? error.message : 'Unknown error';
		} finally {
			isLoading = false;
		}
	});

	async function handleCreateAgent(evt: Event) {
		evt.preventDefault();
		if (!agentFormData.name.trim()) {
			createAgentError = 'Agent name is required';
			return;
		}

		isCreatingAgent = true;
		createAgentError = null;

		try {
			await agentsStore.createAgent({
				name: agentFormData.name.trim(),
				note: agentFormData.note.trim() || undefined,
				primaryLocation: agentFormData.primaryLocation.trim() || undefined
			});

			// Reset form and close modal on success
			agentFormData = { name: '', note: '', primaryLocation: '' };
			showCreateAgentForm = false;
			console.log('Agent created successfully!');
		} catch (error) {
			createAgentError = error instanceof Error ? error.message : 'Failed to create agent';
			console.error('Failed to create agent:', error);
		} finally {
			isCreatingAgent = false;
		}
	}

	function resetAgentForm() {
		agentFormData = { name: '', note: '', primaryLocation: '' };
		createAgentError = null;
	}

	function formatDate(dateString?: string) {
		if (!dateString) return 'Unknown';
		return new Date(dateString).toLocaleDateString();
	}

	function getAgentInitial(agent: Agent): string {
		return agent.name?.charAt(0)?.toUpperCase() || '?';
	}

	function getResourceAccountable(resource: EconomicResource): string {
		return resource.primaryAccountable?.name || 'Anonymous';
	}
</script>

<svelte:head>
	<title>True Commons - Digital Commons Platform</title>
	<meta
		name="description"
		content="Organization-agnostic, capture-resistant digital commons built on Holochain and ValueFlows"
	/>
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
>
	<!-- Header -->
	<header class="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
		<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900 dark:text-white">True Commons</h1>
					<p class="mt-1 text-gray-600 dark:text-gray-300">
						Organization-agnostic digital commons built on Holochain & ValueFlows
					</p>
				</div>
				<div class="flex items-center space-x-3">
					<div class="flex items-center space-x-2">
						<div
							class="h-3 w-3 rounded-full {isConnected ? 'bg-green-500' : 'bg-yellow-500'}"
						></div>
						<span class="text-sm text-gray-600 dark:text-gray-300">{connectionStatus}</span>
					</div>
					<nav class="hidden space-x-6 md:flex">
						<a
							href="/resources"
							class="font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
							>Resources</a
						>
						<a
							href="/agents"
							class="font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
							>Agents</a
						>
						<a
							href="/events"
							class="font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
							>Economic Events</a
						>
						<a
							href="/create"
							class="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
							>Create Resource</a
						>
					</nav>
				</div>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		{#if isLoading || storesLoading}
			<div class="flex items-center justify-center py-12">
				<div class="text-center">
					<div class="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
					<p class="mt-4 text-gray-600 dark:text-gray-300">Loading True Commons...</p>
				</div>
			</div>
		{:else if initializationError || storesError}
			<div
				class="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20"
			>
				<div class="flex">
					<div class="flex-shrink-0">
						<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800 dark:text-red-200">Connection Error</h3>
						<div class="mt-2 text-sm text-red-700 dark:text-red-300">
							<p>{initializationError || storesError}</p>
							<p class="mt-1">Running in demo mode with limited functionality.</p>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<!-- Network Stats -->
			<section class="mb-8">
				<h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Network Overview</h2>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
					<div
						class="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800"
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Agents</p>
								<p class="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_agents}</p>
							</div>
							<div class="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
								<svg
									class="h-6 w-6 text-blue-600 dark:text-blue-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div
						class="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800"
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Resources</p>
								<p class="text-3xl font-bold text-gray-900 dark:text-white">
									{stats.total_resources}
								</p>
							</div>
							<div class="rounded-full bg-green-100 p-3 dark:bg-green-900">
								<svg
									class="h-6 w-6 text-green-600 dark:text-green-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div
						class="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800"
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Economic Events</p>
								<p class="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_events}</p>
							</div>
							<div class="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
								<svg
									class="h-6 w-6 text-purple-600 dark:text-purple-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div
						class="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800"
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Value Created</p>
								<p class="text-3xl font-bold text-gray-900 dark:text-white">
									{stats.total_value_created.toLocaleString()}
								</p>
							</div>
							<div class="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
								<svg
									class="h-6 w-6 text-yellow-600 dark:text-yellow-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div
						class="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800"
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-gray-600 dark:text-gray-400">
									Active Collaborations
								</p>
								<p class="text-3xl font-bold text-gray-900 dark:text-white">
									{stats.active_collaborations}
								</p>
							</div>
							<div class="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900">
								<svg
									class="h-6 w-6 text-indigo-600 dark:text-indigo-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- hREA Testing Section -->
			<section class="mb-8">
				<div class="mb-6 flex items-center justify-between">
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white">hREA Testing</h2>
					<button
						onclick={() => (showCreateAgentForm = true)}
						class="rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
						disabled={!isConnected || !hreaService.isInitialized}
					>
						Create Test Agent
					</button>
				</div>

				<!-- Connection Status -->
				<div
					class="mb-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
				>
					<div class="flex items-center space-x-3">
						<div class="flex items-center space-x-2">
							<div class="h-3 w-3 rounded-full {isConnected ? 'bg-green-500' : 'bg-red-500'}"></div>
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Holochain:</span>
							<span class="text-sm text-gray-600 dark:text-gray-400">
								{isConnected ? 'Connected' : 'Disconnected'}
							</span>
						</div>
						<div class="flex items-center space-x-2">
							<div
								class="h-3 w-3 rounded-full {hreaService.isInitialized
									? 'bg-green-500'
									: 'bg-red-500'}"
							></div>
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">hREA Service:</span
							>
							<span class="text-sm text-gray-600 dark:text-gray-400">
								{hreaService.isInitialized ? 'Initialized' : 'Not Initialized'}
							</span>
						</div>
						<div class="flex items-center space-x-2">
							<div
								class="h-3 w-3 rounded-full {agentsStore.loading
									? 'bg-yellow-500'
									: agentsStore.error
										? 'bg-red-500'
										: 'bg-green-500'}"
							></div>
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Agents Store:</span
							>
							<span class="text-sm text-gray-600 dark:text-gray-400">
								{agentsStore.loading ? 'Loading' : agentsStore.error ? 'Error' : 'Ready'}
							</span>
						</div>
					</div>
				</div>

				<!-- Agent Creation Form Modal -->
				{#if showCreateAgentForm}
					<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
						<div class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
							<div class="mb-4 flex items-center justify-between">
								<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
									Create New Agent
								</h3>
								<button
									aria-label="Close"
									onclick={() => {
										showCreateAgentForm = false;
										resetAgentForm();
									}}
									class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
								>
									<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>

							<form onsubmit={handleCreateAgent} class="space-y-4">
								<div>
									<label
										for="agent-name"
										class="block text-sm font-medium text-gray-700 dark:text-gray-300"
									>
										Name *
									</label>
									<input
										id="agent-name"
										type="text"
										bind:value={agentFormData.name}
										required
										class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
										placeholder="Enter agent name"
									/>
								</div>

								<div>
									<label
										for="agent-note"
										class="block text-sm font-medium text-gray-700 dark:text-gray-300"
									>
										Description
									</label>
									<textarea
										id="agent-note"
										bind:value={agentFormData.note}
										rows="3"
										class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
										placeholder="Enter agent description"
									></textarea>
								</div>

								<div>
									<label
										for="agent-location"
										class="block text-sm font-medium text-gray-700 dark:text-gray-300"
									>
										Location
									</label>
									<input
										id="agent-location"
										type="text"
										bind:value={agentFormData.primaryLocation}
										class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
										placeholder="Enter location"
									/>
								</div>

								{#if createAgentError}
									<div class="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
										<p class="text-sm text-red-800 dark:text-red-200">{createAgentError}</p>
									</div>
								{/if}

								<div class="flex space-x-3">
									<button
										type="submit"
										disabled={isCreatingAgent || !agentFormData.name.trim()}
										class="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
									>
										{isCreatingAgent ? 'Creating...' : 'Create Agent'}
									</button>
									<button
										type="button"
										onclick={() => {
											showCreateAgentForm = false;
											resetAgentForm();
										}}
										class="flex-1 rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
									>
										Cancel
									</button>
								</div>
							</form>
						</div>
					</div>
				{/if}
			</section>

			<!-- Recent Resources & Active Agents -->
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<!-- Recent Resources -->
				<section>
					<div class="mb-6 flex items-center justify-between">
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Recent Resources</h2>
						<a
							href="/resources"
							class="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
							>View all →</a
						>
					</div>
					<div class="space-y-4">
						{#each recentResources as resource (resource.id)}
							<div
								class="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800"
							>
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
											{resource.name || 'Unnamed Resource'}
										</h3>
										<p class="mb-3 text-sm text-gray-600 dark:text-gray-300">
											{resource.note || 'No description available'}
										</p>
										<div
											class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400"
										>
											<span>By {getResourceAccountable(resource)}</span>
											{#if resource.trackingIdentifier}
												<span>•</span>
												<span>ID: {resource.trackingIdentifier}</span>
											{/if}
											{#if resource.conformsTo?.name}
												<span>•</span>
												<span class="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700"
													>{resource.conformsTo.name}</span
												>
											{/if}
										</div>
									</div>
									<div class="text-right text-sm text-gray-500 dark:text-gray-400">
										{#if resource.accountingQuantity}
											<div>
												{resource.accountingQuantity.hasNumericalValue}
												{resource.accountingQuantity.hasUnit?.symbol ||
													resource.accountingQuantity.hasUnit?.label ||
													'units'}
											</div>
										{/if}
										{#if resource.onhandQuantity}
											<div class="text-xs">
												On-hand: {resource.onhandQuantity.hasNumericalValue}
												{resource.onhandQuantity.hasUnit?.symbol ||
													resource.onhandQuantity.hasUnit?.label ||
													'units'}
											</div>
										{/if}
									</div>
								</div>
							</div>
						{:else}
							<div
								class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400"
							>
								No resources found. <a
									href="/create"
									class="text-blue-600 dark:text-blue-400 hover:underline">Create the first one!</a
								>
							</div>
						{/each}
					</div>
				</section>

				<!-- Active Agents -->
				<section>
					<div class="mb-6 flex items-center justify-between">
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
							All Agents ({agentsStore.agents.length})
						</h2>
						<div class="flex items-center space-x-2">
							{#if agentsStore.loading}
								<div class="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
								<span class="text-sm text-gray-500">Loading...</span>
							{:else}
								<button
									onclick={() => agentsStore.fetchAllAgents()}
									class="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
								>
									Refresh
								</button>
							{/if}
						</div>
					</div>
					<div class="space-y-4">
						{#each activeAgents as agent (agent.id)}
							<div
								class="rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
							>
								<div class="flex items-center space-x-3">
									<div
										class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white"
									>
										{getAgentInitial(agent)}
									</div>
									<div class="min-w-0 flex-1">
										<h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
											{agent.name || 'Anonymous Agent'}
										</h3>
										{#if agent.note}
											<p class="truncate text-xs text-gray-600 dark:text-gray-300">
												{agent.note}
											</p>
										{/if}
										{#if agent.primaryLocation}
											<p class="truncate text-xs text-gray-500 dark:text-gray-400">
												📍 {agent.primaryLocation}
											</p>
										{/if}
									</div>
									<div class="text-right">
										<div class="text-xs text-gray-500 dark:text-gray-400">
											ID: {agent.id.slice(0, 8)}...
										</div>
										{#if agent.canonicalUrl}
											<a
												href={agent.canonicalUrl}
												target="_blank"
												rel="noopener noreferrer"
												class="text-xs text-blue-600 hover:underline dark:text-blue-400"
											>
												Profile →
											</a>
										{/if}
									</div>
								</div>
							</div>
						{:else}
							<div
								class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400"
							>
								No agents found.
								{#if isConnected && hreaService.isInitialized}
									<button
										onclick={() => (showCreateAgentForm = true)}
										class="text-blue-600 dark:text-blue-400 hover:underline"
									>
										Create the first one!
									</button>
								{:else}
									Connect to hREA to create agents.
								{/if}
							</div>
						{/each}

						{#if agentsStore.agents.length > 5}
							<div class="pt-2 text-center">
								<a
									href="/agents"
									class="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
								>
									View all {agentsStore.agents.length} agents →
								</a>
							</div>
						{/if}
					</div>
				</section>
			</div>

			<!-- True Commons Principles -->
			<section
				class="mt-12 rounded-lg border border-gray-200 bg-white p-8 shadow dark:border-gray-700 dark:bg-gray-800"
			>
				<h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
					True Commons Principles
				</h2>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
					<div class="text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
						>
							<svg
								class="h-8 w-8 text-blue-600 dark:text-blue-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
						<h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
							Capture Resistant
						</h3>
						<p class="text-sm text-gray-600 dark:text-gray-300">
							Built on Holochain for true decentralization and resistance to corporate capture
						</p>
					</div>
					<div class="text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
						>
							<svg
								class="h-8 w-8 text-green-600 dark:text-green-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
						</div>
						<h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
							Organization Agnostic
						</h3>
						<p class="text-sm text-gray-600 dark:text-gray-300">
							No single organization controls resources - governed by embedded rules
						</p>
					</div>
					<div class="text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900"
						>
							<svg
								class="h-8 w-8 text-purple-600 dark:text-purple-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
								/>
							</svg>
						</div>
						<h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Value Tracking</h3>
						<p class="text-sm text-gray-600 dark:text-gray-300">
							Uses ValueFlows to track all economic activities and contributions
						</p>
					</div>
					<div class="text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900"
						>
							<svg
								class="h-8 w-8 text-yellow-600 dark:text-yellow-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
								/>
							</svg>
						</div>
						<h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Permissionless</h3>
						<p class="text-sm text-gray-600 dark:text-gray-300">
							Open access under defined rules - anyone can contribute and use
						</p>
					</div>
				</div>
			</section>
		{/if}
	</main>
</div>
