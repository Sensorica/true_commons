<script lang="ts">
	import ResourcesCanvas from '$lib/components/ResourcesCanvas.svelte';
	import { agentsStore, economicResourcesStore, economicEventsStore } from '$lib/stores';
	import { onMount } from 'svelte';

	let resourceSearch = $state('');
	let selectedResourceType = $state('all');

	// Resource type options for filtering
	const resourceTypes = [
		{ value: 'all', label: 'All Types' },
		{ value: 'Document', label: 'Document' },
		{ value: 'Software', label: 'Software' },
		{ value: 'Design', label: 'Design' },
		{ value: 'Dataset', label: 'Dataset' },
		{ value: 'Media', label: 'Media' },
		{ value: 'Knowledge', label: 'Knowledge' },
		{ value: 'Tool', label: 'Tool' },
		{ value: 'Process', label: 'Process' },
		{ value: 'Template', label: 'Template' }
	];

	// Statistics
	let stats = $derived({
		total: economicResourcesStore.resources.length,
		byType: resourceTypes.slice(1).map((type) => ({
			type: type.label,
			count: economicResourcesStore.resources.filter((r) => r.resourceType === type.value).length
		})),
		recentCreated: economicResourcesStore.resources
			.filter((r) => r.created_at)
			.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
			.slice(0, 5)
	});

	// Handle search and filtering
	function handleSearch() {
		if (resourceSearch.trim()) {
			economicResourcesStore.searchResourcesByTag(resourceSearch);
		} else {
			// Reset to show all resources
			economicResourcesStore.fetchAllResources();
		}
	}

	function handleTypeFilter() {
		if (selectedResourceType === 'all') {
			economicResourcesStore.fetchAllResources();
		} else {
			economicResourcesStore.getResourcesByType(selectedResourceType);
		}
	}

	// Testing functions
	async function addSampleResource() {
		const sampleResources = [
			{
				name: 'Community Garden Planning Guide',
				note: 'Comprehensive guide for starting and maintaining community gardens in urban environments.',
				resourceType: 'Document',
				license: 'CC-BY',
				tags: ['gardening', 'community', 'sustainability', 'urban-planning'],
				content:
					'This guide covers site selection, soil preparation, community organizing, and seasonal planning for urban community gardens.'
			},
			{
				name: 'Open Source Weather Station',
				note: 'Arduino-based weather monitoring system with IoT connectivity.',
				resourceType: 'Software',
				license: 'MIT',
				tags: ['arduino', 'iot', 'weather', 'open-hardware'],
				content:
					'Complete hardware schematics and software for building a connected weather station.'
			},
			{
				name: 'Permaculture Design Patterns',
				note: 'Collection of proven permaculture design patterns for sustainable agriculture.',
				resourceType: 'Knowledge',
				license: 'CC0',
				tags: ['permaculture', 'agriculture', 'design-patterns', 'sustainability'],
				content:
					'Visual and textual documentation of permaculture design principles and their applications.'
			}
		];

		const randomSample = sampleResources[Math.floor(Math.random() * sampleResources.length)];
		await economicResourcesStore.createResource(randomSample);
	}

	function clearAllResources() {
		economicResourcesStore.clearMockResources();
	}

	onMount(() => {
		// Load resources when page mounts
		economicResourcesStore.fetchAllResources();
		agentsStore.fetchAllAgents();
	});
</script>

<svelte:head>
	<title>Resources - True Commons</title>
	<meta
		name="description"
		content="Discover and manage digital resources in the True Commons network"
	/>
</svelte:head>

<div class="space-y-8">
	<!-- Page Header -->
	<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Resources</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-300">
				Discover, create, and manage digital resources in the True Commons network
			</p>
		</div>

		<!-- Quick Stats -->
		<div class="mt-4 grid grid-cols-2 gap-4 lg:mt-0 lg:grid-cols-3">
			<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
				<div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
				<div class="text-sm text-gray-600 dark:text-gray-400">Total Resources</div>
			</div>
			<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
				<div class="text-2xl font-bold text-green-600 dark:text-green-400">
					{stats.byType.reduce((sum, type) => sum + type.count, 0)}
				</div>
				<div class="text-sm text-gray-600 dark:text-gray-400">Available Types</div>
			</div>
			<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
				<div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
					{stats.recentCreated.length}
				</div>
				<div class="text-sm text-gray-600 dark:text-gray-400">Recent</div>
			</div>
		</div>
	</div>

	<!-- Search and Filter Controls -->
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
		<div class="lg:col-span-2">
			<label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
				Search Resources
			</label>
			<div class="mt-1 flex rounded-md shadow-sm">
				<input
					type="text"
					id="search"
					bind:value={resourceSearch}
					onkeyup={handleSearch}
					placeholder="Search by name, description, or tags..."
					class="block w-full rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
				<button
					onclick={handleSearch}
					class="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
				>
					Search
				</button>
			</div>
		</div>

		<div>
			<label for="type-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
				Filter by Type
			</label>
			<select
				id="type-filter"
				bind:value={selectedResourceType}
				onchange={handleTypeFilter}
				class="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			>
				{#each resourceTypes as type}
					<option value={type.value}>{type.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Resource Type Statistics -->
	{#if stats.byType.some((type) => type.count > 0)}
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Resources by Type</h3>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
				{#each stats.byType as type}
					{#if type.count > 0}
						<div class="text-center">
							<div class="text-xl font-bold text-gray-900 dark:text-white">{type.count}</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">{type.type}</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	<!-- Resources Canvas - Main Content -->
	<ResourcesCanvas />

	<!-- Development Testing Controls -->
	{#if import.meta.env.DEV}
		<div
			class="rounded-lg border border-orange-200 bg-orange-50 p-6 dark:border-orange-800 dark:bg-orange-900/20"
		>
			<h3 class="mb-4 text-lg font-medium text-orange-800 dark:text-orange-200">
				🛠️ Development Tools
			</h3>
			<div class="flex flex-wrap gap-3">
				<button
					onclick={addSampleResource}
					class="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
				>
					Add Sample Resource
				</button>
				<button
					onclick={clearAllResources}
					class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
				>
					Clear All Resources
				</button>
				<div class="flex items-center text-sm text-orange-700 dark:text-orange-300">
					Resources: {stats.total} | Agent: {agentsStore.myAgent
						? agentsStore.myAgent.name
						: 'None'}
				</div>
			</div>
		</div>
	{/if}
</div>
