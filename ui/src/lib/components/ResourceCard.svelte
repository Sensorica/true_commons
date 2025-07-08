<script lang="ts">
	import type { EconomicResource } from '$lib/graphql/types';

	let { resource } = $props<{ resource: EconomicResource }>();

	function getResourceAccountable(resource: EconomicResource): string {
		return resource.primaryAccountable?.name || 'Anonymous';
	}
</script>

<div
	class="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
>
	<div class="flex items-start gap-4">
		<div
			class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300"
		>
			{resource.name.charAt(0).toUpperCase()}
		</div>
		<div class="flex-1">
			<h3 class="font-bold text-gray-900 dark:text-white">{resource.name}</h3>
			<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
				{resource.note || 'No description available.'}
			</p>

			<div class="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
				<span>by {getResourceAccountable(resource)}</span>
				{#if resource.created}
					<span>{new Date(resource.created).toLocaleDateString()}</span>
				{/if}
			</div>
		</div>
	</div>
	<!-- Placeholder for signals -->
	<div class="mt-3 flex flex-wrap gap-2">
		{#if resource.classification}
			{#each resource.classification as tag}
				<span
					class="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
				>
					{tag}
				</span>
			{/each}
		{/if}
		<span
			class="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200"
			>Validated</span
		>
	</div>
</div>
