<script lang="ts">
	import { economicResourcesStore, agentsStore } from '$lib/stores';
	import ResourceCard from './ResourceCard.svelte';
	import ResourceDetail from './ResourceDetail.svelte';
	import type { EconomicResource } from '$lib/graphql/types';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let selectedResourceId = $state<string | null>(null);

	function handleResourceClick(resourceId: string) {
		selectedResourceId = resourceId;
	}

	function handleCloseDetail() {
		selectedResourceId = null;
	}

	function handleCreateAgent() {
		dispatch('createagent');
	}

	let selectedResource = $derived(
		selectedResourceId
			? economicResourcesStore.resources.find((r) => r.id === selectedResourceId) || null
			: null
	);
</script>

<section>
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Digital Resources</h2>
		<div class="flex items-center gap-4">
			<input
				type="search"
				placeholder="Search resources..."
				class="w-64 rounded-md border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			/>
			{#if agentsStore.myAgent}
				<button class="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
					+ Create Resource
				</button>
			{:else}
				<button
					on:click={handleCreateAgent}
					class="rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
				>
					+ Create Agent to Contribute
				</button>
			{/if}
		</div>
	</div>

	{#if economicResourcesStore.resources.length > 0}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each economicResourcesStore.resources as resource (resource.id)}
				<div on:click={() => handleResourceClick(resource.id)}>
					<ResourceCard {resource} />
				</div>
			{/each}
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
					on:click={handleCreateAgent}
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
