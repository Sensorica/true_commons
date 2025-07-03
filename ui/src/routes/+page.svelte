<script lang="ts">
	import type {
		NetworkStats,
		TrueCommonsAgent,
		TrueCommonsResource
	} from '$lib/true_commons_service.svelte';
	import trueCommonsService from '$lib/true_commons_service.svelte';
	import { onMount } from 'svelte';

	// Reactive state
	let isConnected = $state(false);
	let stats: NetworkStats = $state({
		total_agents: 0,
		total_resources: 0,
		total_events: 0,
		total_value_created: 0,
		active_collaborations: 0
	});
	let recentResources: TrueCommonsResource[] = $state([]);
	let activeAgents: TrueCommonsAgent[] = $state([]);
	let isLoading = $state(true);
	let connectionStatus = $state('Connecting to True Commons...');

	onMount(async () => {
		try {
			await trueCommonsService.connect();
			isConnected = trueCommonsService.isConnected;

			if (isConnected) {
				connectionStatus = 'Connected to hREA backend';
			} else {
				connectionStatus = 'Running in demo mode';
			}

			// Load dashboard data
			await loadDashboardData();
		} catch (error) {
			console.error('Failed to initialize True Commons:', error);
			connectionStatus = 'Connection failed - demo mode active';
			await loadDashboardData();
		} finally {
			isLoading = false;
		}
	});

	async function loadDashboardData() {
		try {
			const [networkStats, resources, agents] = await Promise.all([
				trueCommonsService.getNetworkStats(),
				trueCommonsService.getAllResources(),
				trueCommonsService.getAllAgents()
			]);

			stats = networkStats;
			recentResources = resources.slice(0, 3); // Show recent 3
			activeAgents = agents.slice(0, 3); // Show top 3
		} catch (error) {
			console.error('Failed to load dashboard data:', error);
		}
	}

	function formatDate(dateString?: string) {
		if (!dateString) return 'Unknown';
		return new Date(dateString).toLocaleDateString();
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
		{#if isLoading}
			<div class="flex items-center justify-center py-12">
				<div class="text-center">
					<div class="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
					<p class="mt-4 text-gray-600 dark:text-gray-300">Loading True Commons...</p>
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
											{resource.name}
										</h3>
										<p class="mb-3 text-sm text-gray-600 dark:text-gray-300">{resource.note}</p>
										<div
											class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400"
										>
											<span>By {resource.primaryAccountable?.name || 'Anonymous'}</span>
											<span>•</span>
											<span>{formatDate(resource.created_at)}</span>
											{#if resource.license}
												<span>•</span>
												<span class="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700"
													>{resource.license}</span
												>
											{/if}
										</div>
									</div>
									<div class="text-right text-sm text-gray-500 dark:text-gray-400">
										{#if resource.usage_count}
											<div>{resource.usage_count} uses</div>
										{/if}
										{#if resource.fork_count}
											<div>{resource.fork_count} forks</div>
										{/if}
									</div>
								</div>
								{#if resource.tags && resource.tags.length > 0}
									<div class="mt-4 flex flex-wrap gap-2">
										{#each resource.tags.slice(0, 3) as tag (tag)}
											<span
												class="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
												>#{tag}</span
											>
										{/each}
									</div>
								{/if}
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
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Active Agents</h2>
						<a
							href="/agents"
							class="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
							>View all →</a
						>
					</div>
					<div class="space-y-4">
						{#each activeAgents as agent (agent.id)}
							<div
								class="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800"
							>
								<div class="flex items-center space-x-4">
									<div
										class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white"
									>
										{agent.name?.charAt(0) || '?'}
									</div>
									<div class="flex-1">
										<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
											{agent.name}
										</h3>
										<p class="text-sm text-gray-600 dark:text-gray-300">{agent.note}</p>
										{#if agent.primaryLocation}
											<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
												📍 {agent.primaryLocation}
											</p>
										{/if}
									</div>
									<div class="text-right text-sm text-gray-500 dark:text-gray-400">
										{#if agent.reputation_score}
											<div class="font-medium text-green-600 dark:text-green-400">
												⭐ {agent.reputation_score}
											</div>
										{/if}
										{#if agent.contributions_count}
											<div>{agent.contributions_count} contributions</div>
										{/if}
										{#if agent.agent_type}
											<div class="mt-1">
												<span class="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700"
													>{agent.agent_type}</span
												>
											</div>
										{/if}
									</div>
								</div>
							</div>
						{:else}
							<div
								class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400"
							>
								No agents found.
							</div>
						{/each}
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
