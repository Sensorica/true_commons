<script lang="ts">
	import { agentsStore, economicResourcesStore, economicEventsStore } from '$lib/stores';
	import { onMount } from 'svelte';

	// Dashboard statistics
	let stats = $derived({
		agents: {
			total: agentsStore.agents.length,
			authenticated: !!agentsStore.myAgent
		},
		resources: {
			total: economicResourcesStore.resources.length,
			recent: economicResourcesStore.resources
				.filter((r) => r.created_at)
				.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
				.slice(0, 3),
			byType: ['Document', 'Software', 'Knowledge', 'Tool'].map((type) => ({
				type,
				count: economicResourcesStore.resources.filter((r) => r.resourceType === type).length
			}))
		},
		activity: {
			events: economicEventsStore.events.length,
			recentEvents: economicEventsStore.events.slice(0, 5)
		}
	});

	// Quick actions
	function goToResources() {
		window.location.href = '/resources';
	}

	function goToAgents() {
		window.location.href = '/agents';
	}

	// Load data on mount
	onMount(() => {
		agentsStore.fetchAllAgents();
		agentsStore.fetchMyAgent();
		economicResourcesStore.fetchAllResources();
		economicEventsStore.fetchAllEvents();
	});
</script>

<svelte:head>
	<title>True Commons - Dashboard</title>
	<meta
		name="description"
		content="True Commons - Organization-agnostic, capture-resistant digital assets platform"
	/>
</svelte:head>

<div class="space-y-8">
	<!-- Welcome Banner -->
	<div class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
		<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
			<div>
				<h1 class="text-4xl font-bold">Welcome to True Commons</h1>
				<p class="mt-2 text-xl">Organization-agnostic, capture-resistant digital assets platform</p>
				<p class="mt-4 text-blue-100">
					Create, discover, and collaborate on digital resources in a decentralized network powered
					by Holochain and ValueFlows.
				</p>
			</div>
			<div class="mt-6 lg:mt-0">
				{#if agentsStore.myAgent}
					<div class="rounded-lg bg-white/20 p-4">
						<p class="text-sm text-blue-100">Authenticated as</p>
						<p class="text-lg font-semibold">{agentsStore.myAgent.name}</p>
					</div>
				{:else}
					<div class="rounded-lg bg-yellow-500/20 p-4">
						<p class="text-sm text-yellow-100">⚠️ No agent selected</p>
						<button
							onclick={goToAgents}
							class="mt-2 rounded bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
						>
							Set up identity
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Dashboard Stats Grid -->
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		<!-- Agents Overview -->
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						></path>
					</svg>
				</div>
				<div class="ml-5 w-0 flex-1">
					<dl>
						<dt class="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
							Network Agents
						</dt>
						<dd class="text-lg font-medium text-gray-900 dark:text-white">{stats.agents.total}</dd>
					</dl>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex items-center text-sm">
					<span
						class="flex items-center text-{stats.agents.authenticated ? 'green' : 'yellow'}-600"
					>
						<span
							class="h-2 w-2 rounded-full bg-{stats.agents.authenticated
								? 'green'
								: 'yellow'}-500 mr-2"
						></span>
						{stats.agents.authenticated ? 'Authenticated' : 'Not authenticated'}
					</span>
				</div>
				<button
					onclick={goToAgents}
					class="mt-3 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
				>
					Manage agents →
				</button>
			</div>
		</div>

		<!-- Resources Overview -->
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
						></path>
					</svg>
				</div>
				<div class="ml-5 w-0 flex-1">
					<dl>
						<dt class="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
							Digital Resources
						</dt>
						<dd class="text-lg font-medium text-gray-900 dark:text-white">
							{stats.resources.total}
						</dd>
					</dl>
				</div>
			</div>
			<div class="mt-4">
				<div class="text-sm text-gray-600 dark:text-gray-400">
					{#each stats.resources.byType.filter((t) => t.count > 0) as type}
						<span class="mr-3">{type.type}: {type.count}</span>
					{/each}
				</div>
				<button
					onclick={goToResources}
					class="mt-3 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
				>
					Browse resources →
				</button>
			</div>
		</div>

		<!-- Activity Overview -->
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<svg
						class="h-8 w-8 text-purple-600"
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
				<div class="ml-5 w-0 flex-1">
					<dl>
						<dt class="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
							Economic Events
						</dt>
						<dd class="text-lg font-medium text-gray-900 dark:text-white">
							{stats.activity.events}
						</dd>
					</dl>
				</div>
			</div>
			<div class="mt-4">
				<div class="text-sm text-gray-600 dark:text-gray-400">
					Track all value flows and contributions
				</div>
			</div>
		</div>
	</div>

	<!-- Recent Resources -->
	{#if stats.resources.recent.length > 0}
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Recent Resources</h2>
				<button
					onclick={goToResources}
					class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
				>
					View all →
				</button>
			</div>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each stats.resources.recent as resource}
					<div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<h3 class="font-medium text-gray-900 dark:text-white">
									{resource.name || 'Untitled Resource'}
								</h3>
								{#if resource.note}
									<p class="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
										{resource.note}
									</p>
								{/if}
								<div class="mt-2 flex items-center space-x-2">
									{#if resource.resourceType}
										<span
											class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
										>
											{resource.resourceType}
										</span>
									{/if}
									{#if resource.license}
										<span
											class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
										>
											{resource.license}
										</span>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Quick Actions -->
	<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
		<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<button
				onclick={goToResources}
				class="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:hover:border-gray-500"
			>
				<div>
					<svg
						class="mx-auto h-8 w-8 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						></path>
					</svg>
					<span class="mt-2 block text-sm font-medium text-gray-900 dark:text-white"
						>Create Resource</span
					>
					<span class="block text-sm text-gray-500 dark:text-gray-400">Add new digital asset</span>
				</div>
			</button>

			<button
				onclick={goToAgents}
				class="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:hover:border-gray-500"
			>
				<div>
					<svg
						class="mx-auto h-8 w-8 text-gray-400"
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
					<span class="mt-2 block text-sm font-medium text-gray-900 dark:text-white"
						>Manage Identity</span
					>
					<span class="block text-sm text-gray-500 dark:text-gray-400">Set up agent profile</span>
				</div>
			</button>

			<button
				onclick={goToResources}
				class="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:hover:border-gray-500"
			>
				<div>
					<svg
						class="mx-auto h-8 w-8 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						></path>
					</svg>
					<span class="mt-2 block text-sm font-medium text-gray-900 dark:text-white">Discover</span>
					<span class="block text-sm text-gray-500 dark:text-gray-400"
						>Browse network resources</span
					>
				</div>
			</button>

			<a
				href="https://github.com/your-repo/true_commons"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:hover:border-gray-500"
			>
				<div>
					<svg class="mx-auto h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						/>
					</svg>
					<span class="mt-2 block text-sm font-medium text-gray-900 dark:text-white">GitHub</span>
					<span class="block text-sm text-gray-500 dark:text-gray-400">View source code</span>
				</div>
			</a>
		</div>
	</div>

	<!-- About True Commons -->
	<div class="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
		<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">About True Commons</h2>
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div>
				<h3 class="mb-2 font-medium text-gray-900 dark:text-white">🌐 Decentralized</h3>
				<p class="text-sm text-gray-600 dark:text-gray-300">
					Built on Holochain for true peer-to-peer data integrity without central authorities.
				</p>
			</div>
			<div>
				<h3 class="mb-2 font-medium text-gray-900 dark:text-white">💎 Capture-Resistant</h3>
				<p class="text-sm text-gray-600 dark:text-gray-300">
					Designed to prevent value extraction and maintain commons-based resource sharing.
				</p>
			</div>
			<div>
				<h3 class="mb-2 font-medium text-gray-900 dark:text-white">🔄 ValueFlows</h3>
				<p class="text-sm text-gray-600 dark:text-gray-300">
					Economic activity tracking using the ValueFlows vocabulary for transparency and
					attribution.
				</p>
			</div>
		</div>
	</div>
</div>
