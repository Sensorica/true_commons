<script lang="ts">
	import type { EconomicResource, EconomicEvent, Action, Unit } from '$lib/graphql/types';

	let { resource, onClose } = $props<{
		resource: EconomicResource;
		onClose: () => void;
	}>();

	const produceAction: Action = { id: 'produce', label: 'Produce', resourceEffect: 'increment' };
	const useAction: Action = { id: 'use', label: 'Use', resourceEffect: 'decrement' };
	const transferAction: Action = { id: 'transfer', label: 'Transfer', resourceEffect: 'move' };

	const mockUnit: Unit = { id: 'unit', label: 'unit', symbol: 'u' };

	// Mock economic history for demonstration purposes
	const mockHistory: EconomicEvent[] = [
		{
			id: 'event1',
			action: produceAction,
			provider: { id: 'agent1', name: 'Alice' },
			receiver: { id: 'agent2', name: 'Bob' },
			hasPointInTime: '2023-10-26T10:00:00Z',
			resourceQuantity: { hasNumericalValue: 1, hasUnit: mockUnit }
		},
		{
			id: 'event2',
			action: useAction,
			provider: { id: 'agent3', name: 'Charlie' },
			hasPointInTime: '2023-10-27T14:30:00Z',
			resourceQuantity: { hasNumericalValue: 1, hasUnit: mockUnit }
		},
		{
			id: 'event3',
			action: transferAction,
			provider: { id: 'agent2', name: 'Bob' },
			receiver: { id: 'agent4', name: 'Dana' },
			hasPointInTime: '2023-10-28T09:00:00Z',
			resourceQuantity: { hasNumericalValue: 1, hasUnit: mockUnit }
		}
	];
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
	role="dialog"
	aria-modal="true"
	tabindex="0"
	onclick={onClose}
	onkeydown={(e) => e.key === 'Escape' && onClose()}
>
	<div
		class="relative mx-4 flex h-full max-h-[90vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl dark:bg-gray-800"
		role="document"
		onclick={(e) => e.stopPropagation()}
	>
		<header class="flex items-center justify-between border-b p-4 dark:border-gray-700">
			<h2 class="text-xl font-bold text-gray-900 dark:text-white">{resource.name}</h2>
			<button
				aria-label="Close"
				onclick={onClose}
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
		</header>

		<main class="flex-1 overflow-y-auto p-6">
			<p class="mb-6 text-gray-600 dark:text-gray-300">{resource.note}</p>

			<div class="mb-6 grid grid-cols-2 gap-4 text-sm">
				<div>
					<span class="font-semibold text-gray-700 dark:text-gray-200">Primary Accountable:</span>
					<span class="text-gray-600 dark:text-gray-400">
						{resource.primaryAccountable?.name || 'Anonymous'}
					</span>
				</div>
				<div>
					<span class="font-semibold text-gray-700 dark:text-gray-200">Created:</span>
					<span class="text-gray-600 dark:text-gray-400">
						{new Date(resource.created || '').toLocaleDateString()}
					</span>
				</div>
				<!-- More metadata can be added here -->
			</div>

			<!-- Economic History Section -->
			<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Economic History</h3>
			<div class="space-y-3">
				{#each mockHistory as event}
					<div class="rounded-md border p-3 dark:border-gray-700">
						<div class="flex items-center justify-between">
							<span class="font-bold text-blue-600 capitalize dark:text-blue-400">
								{event.action.label}
							</span>
							<span class="text-xs text-gray-500">
								{new Date(event.hasPointInTime || '').toLocaleString()}
							</span>
						</div>
						<p class="text-sm text-gray-700 dark:text-gray-300">
							{#if event.action.id === 'transfer'}
								{event.provider?.name} transferred to {event.receiver?.name}
							{:else if event.action.id === 'produce'}
								Created by {event.provider?.name}
							{:else}
								Action by {event.provider?.name}
							{/if}
						</p>
					</div>
				{/each}
			</div>
		</main>

		<footer class="flex justify-end gap-3 border-t p-4 dark:border-gray-700">
			<button
				disabled
				class="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-500 dark:border-gray-600 dark:text-gray-400"
				title="Coming Soon"
			>
				Comment
			</button>
			<button
				disabled
				class="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-500 dark:border-gray-600 dark:text-gray-400"
				title="Coming Soon"
			>
				Fork
			</button>
			<button
				disabled
				class="rounded-md bg-blue-600 px-4 py-2 font-medium text-white opacity-50"
				title="Coming Soon"
			>
				Use Resource
			</button>
		</footer>
	</div>
</div>
