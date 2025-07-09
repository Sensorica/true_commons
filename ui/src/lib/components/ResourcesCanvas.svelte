<script lang="ts">
	import resourcesStore from '$lib/stores/resources.store.svelte';
	import agentsStore from '$lib/stores/agents.store.svelte';
	import ResourceCard from './ResourceCard.svelte';
	import ResourceDetail from './ResourceDetail.svelte';
	import ResourceCreateForm from './ResourceCreateForm.svelte';
	import type { Agent, EconomicResource, ResourceSpecification } from '$lib/graphql/types';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	// Component state
	let searchQuery = $state('');
	let selectedResourceId = $state<string | null>(null);
	let showCreateForm = $state(false);

	function handleResourceClick(resourceId: string) {
		selectedResourceId = resourceId;
	}

	function handleCloseDetail() {
		selectedResourceId = null;
	}

	function handleCreateAgent() {
		dispatch('createagent');
	}

	function handleCreateResource() {
		showCreateForm = true;
	}

	function handleCloseCreateForm() {
		showCreateForm = false;
	}

	function handleResourceCreated(event: CustomEvent<EconomicResource>) {
		// Resource was created successfully
		console.log('Resource created:', event.detail);
		showCreateForm = false;
	}

	// Computed properties
	let filteredResources = $derived(
		searchQuery.trim() ? resourcesStore.searchResourcesByTag(searchQuery) : resourcesStore.resources
	);

	let selectedResource = $derived(
		selectedResourceId
			? resourcesStore.resources.find((r) => r.id === selectedResourceId) || null
			: null
	);
</script>

<section>
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Digital Resources</h2>
		<div class="flex items-center gap-4">
			<input
				type="search"
				bind:value={searchQuery}
				placeholder="Search resources by name, tags, or description..."
				class="w-80 rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			/>
			{#if agentsStore.myAgent}
				<button
					onclick={handleCreateResource}
					class="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
				>
					+ Create Resource
				</button>
			{:else}
				<button
					onclick={handleCreateAgent}
					class="rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
				>
					+ Create Agent to Contribute
				</button>
			{/if}
		</div>
	</div>

	<!-- Resource Stats -->
	{#if resourcesStore.resources.length > 0}
		<div class="mb-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
			<span>Total: {resourcesStore.resources.length} resources</span>
			{#if searchQuery.trim()}
				<span>•</span>
				<span>Showing: {filteredResources.length} filtered results</span>
			{/if}
		</div>
	{/if}

	<!-- Resources Grid -->
	{#if filteredResources.length > 0}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredResources as resource (resource.id)}
				<div
					onclick={() => handleResourceClick(resource.id)}
					onkeydown={(e) =>
						(e.key === 'Enter' || e.key === ' ') && handleResourceClick(resource.id)}
					class="cursor-pointer"
					role="button"
					tabindex="0"
				>
					<ResourceCard {resource} />
				</div>
			{/each}
		</div>
	{:else if searchQuery.trim()}
		<div class="py-12 text-center">
			<svg
				class="mx-auto h-12 w-12 text-gray-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
			<h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No resources found</h3>
			<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
				Try a different search term or create a new resource.
			</p>
		</div>
	{:else if resourcesStore.resources.length === 0}
		<div class="py-12 text-center">
			<svg
				class="mx-auto h-12 w-12 text-gray-400"
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
			<h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No resources yet</h3>
			<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
				Get started by creating your first digital resource.
			</p>
			{#if agentsStore.myAgent}
				<button
					onclick={handleCreateResource}
					class="mt-4 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
				>
					Create First Resource
				</button>
			{:else}
				<button
					onclick={handleCreateAgent}
					class="mt-4 rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
				>
					Create Agent Profile First
				</button>
			{/if}
		</div>
	{:else}
		<div
			class="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-600 dark:bg-gray-800"
		>
			<h3 class="text-lg font-medium text-gray-900 dark:text-white">No resources found</h3>
			{#if agentsStore.myAgent}
				<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
					Get started by creating a new digital resource.
				</p>
				<button
					class="mt-4 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
				>
					+ Create Resource
				</button>
			{:else}
				<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
					You must create an agent profile before you can add resources.
				</p>
				<button
					onclick={handleCreateAgent}
					class="mt-4 rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
				>
					+ Create Your Agent Profile
				</button>
			{/if}
		</div>
	{/if}
</section>

{#if selectedResource}
	<ResourceDetail resource={selectedResource} onClose={handleCloseDetail} />
{/if}

{#if showCreateForm}
	<ResourceCreateForm on:created={handleResourceCreated} on:close={handleCloseCreateForm} />
{/if}
