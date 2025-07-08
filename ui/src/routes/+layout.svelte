<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { agentsStore } from '$lib/stores';
	import { onMount } from 'svelte';

	let { children } = $props();

	// Get current route for active state
	let currentPath = $derived($page.url.pathname);

	// Initialize agent data on mount
	onMount(async () => {
		try {
			// Load all agents first, which will also restore myAgent from localStorage
			await agentsStore.fetchAllAgents();
			// Then try to fetch myAgent from GraphQL if not already restored
			await agentsStore.fetchMyAgent();
		} catch (error) {
			console.warn('Failed to initialize agent data on layout mount:', error);
		}
	});
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Navigation Bar -->
	<nav class="bg-white shadow dark:bg-gray-800">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between">
				<!-- Logo and primary navigation -->
				<div class="flex">
					<div class="flex flex-shrink-0 items-center">
						<a href="/" class="flex items-center space-x-3">
							<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
								<svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
									<path
										d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
									/>
								</svg>
							</div>
							<span class="text-xl font-bold text-gray-900 dark:text-white">True Commons</span>
						</a>
					</div>
					<div class="hidden sm:ml-6 sm:flex sm:space-x-8">
						<!-- Navigation Links -->
						<a
							href="/"
							class="inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium
								{currentPath === '/'
								? 'border-blue-500 text-gray-900 dark:text-white'
								: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'}"
						>
							Dashboard
						</a>
						<a
							href="/resources"
							class="inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium
								{currentPath === '/resources'
								? 'border-blue-500 text-gray-900 dark:text-white'
								: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'}"
						>
							Resources
						</a>
						<a
							href="/agents"
							class="inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium
								{currentPath === '/agents'
								? 'border-blue-500 text-gray-900 dark:text-white'
								: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'}"
						>
							Agents
						</a>
					</div>
				</div>

				<!-- Right side - User info and actions -->
				<div class="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
					<!-- Current agent indicator -->
					{#if agentsStore.myAgent}
						<div
							class="flex items-center space-x-2 rounded-lg bg-green-50 px-3 py-1 dark:bg-green-900/20"
						>
							<div class="h-2 w-2 rounded-full bg-green-500"></div>
							<span class="text-sm font-medium text-green-700 dark:text-green-300">
								{agentsStore.myAgent.name}
							</span>
						</div>
					{:else}
						<div
							class="flex items-center space-x-2 rounded-lg bg-yellow-50 px-3 py-1 dark:bg-yellow-900/20"
						>
							<div class="h-2 w-2 rounded-full bg-yellow-500"></div>
							<span class="text-sm font-medium text-yellow-700 dark:text-yellow-300">
								No Agent
							</span>
						</div>
					{/if}

					<!-- Theme toggle (placeholder for future) -->
					<button
						class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
						title="Toggle theme"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
							/>
						</svg>
					</button>
				</div>

				<!-- Mobile menu button -->
				<div class="flex items-center sm:hidden">
					<button
						type="button"
						class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-white"
						aria-controls="mobile-menu"
						aria-expanded="false"
					>
						<span class="sr-only">Open main menu</span>
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Mobile menu (hidden by default) -->
		<div class="sm:hidden" id="mobile-menu">
			<div class="space-y-1 pt-2 pb-3">
				<a
					href="/"
					class="block border-l-4 py-2 pr-4 pl-3 text-sm font-medium
						{currentPath === '/'
						? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}"
				>
					Dashboard
				</a>
				<a
					href="/resources"
					class="block border-l-4 py-2 pr-4 pl-3 text-sm font-medium
						{currentPath === '/resources'
						? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}"
				>
					Resources
				</a>
				<a
					href="/agents"
					class="block border-l-4 py-2 pr-4 pl-3 text-sm font-medium
						{currentPath === '/agents'
						? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}"
				>
					Agents
				</a>
			</div>
		</div>
	</nav>

	<!-- Main content -->
	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		{@render children()}
	</main>
</div>
