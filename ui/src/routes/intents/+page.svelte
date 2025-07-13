<script lang="ts">
	import { onMount } from 'svelte';
	import IntentCreateForm from '$lib/components/IntentCreateForm.svelte';
	import intentsStore from '$lib/stores/intents.store.svelte';
	import foundationService from '$lib/services/foundation.service.svelte';
	import agentsStore from '$lib/stores/agents.store.svelte';
	import actionsStore from '$lib/stores/actions.store.svelte';
	import type { Intent } from '$lib/graphql/types';

	let showCreateForm = $state(false);
	let selectedIntent = $state<Intent | null>(null);

	onMount(async () => {
		// Initialize foundation and stores
		await foundationService.initialize();
		await Promise.all([intentsStore.fetchAllIntents(), agentsStore.fetchAllAgents()]);
	});

	function handleIntentCreated(intent: Intent) {
		showCreateForm = false;
		console.log('Intent created:', intent);
	}

	function handleIntentClick(intent: Intent) {
		selectedIntent = intent;
	}

	function closeIntentDetail() {
		selectedIntent = null;
	}

	async function handleDeleteIntent(intentId: string) {
		if (confirm('Are you sure you want to delete this intent?')) {
			try {
				await intentsStore.deleteIntent(intentId);
				if (selectedIntent?.id === intentId) {
					selectedIntent = null;
				}
			} catch (error) {
				console.error('Failed to delete intent:', error);
				alert('Failed to delete intent. Please try again.');
			}
		}
	}

	function formatDateTime(dateTimeString: string): string {
		return new Date(dateTimeString).toLocaleString();
	}

	function getActionLabel(actionId: string): string {
		const action = actionsStore.actions.find((a) => a.id === actionId);
		return action ? action.label : actionId;
	}

	function getAgentName(agentId: string): string {
		const agent = agentsStore.agents.find((a) => a.id === agentId);
		return agent ? agent.name : agentId;
	}

	function getIntentStatus(intent: Intent): string {
		if (intent.satisfiedBy && intent.satisfiedBy.length > 0) {
			return 'Satisfied';
		}
		if (intent.due) {
			const dueDate = new Date(intent.due);
			const now = new Date();
			if (dueDate < now) {
				return 'Expired';
			}
		}
		return 'Open';
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'Satisfied':
				return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
			case 'Expired':
				return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
			default:
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
		}
	}
</script>

<svelte:head>
	<title>Intents - True Commons</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Intents</h1>
					<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
						Manage desired future activities and plans within the network
					</p>
				</div>
				<button
					onclick={() => (showCreateForm = !showCreateForm)}
					class="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none dark:bg-green-500 dark:hover:bg-green-600"
				>
					<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						/>
					</svg>
					New Intent
				</button>
			</div>
		</div>

		<!-- Statistics -->
		<div class="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
			<div class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
								<svg
									class="h-5 w-5 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
									Total Intents
								</dt>
								<dd class="text-lg font-medium text-gray-900 dark:text-white">
									{intentsStore.intents.length}
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
								<svg
									class="h-5 w-5 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Open</dt>
								<dd class="text-lg font-medium text-gray-900 dark:text-white">
									{intentsStore.intents.filter((i) => !i.satisfiedBy || i.satisfiedBy.length === 0)
										.length}
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
								<svg
									class="h-5 w-5 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
									Satisfied
								</dt>
								<dd class="text-lg font-medium text-gray-900 dark:text-white">
									{intentsStore.intents.filter((i) => i.satisfiedBy && i.satisfiedBy.length > 0)
										.length}
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
								<svg
									class="h-5 w-5 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
									/>
								</svg>
							</div>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
									Expired
								</dt>
								<dd class="text-lg font-medium text-gray-900 dark:text-white">
									{intentsStore.intents.filter(
										(i) =>
											i.due &&
											new Date(i.due) < new Date() &&
											(!i.satisfiedBy || i.satisfiedBy.length === 0)
									).length}
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Create Form -->
		{#if showCreateForm}
			<div class="mb-8">
				<IntentCreateForm onIntentCreated={handleIntentCreated} />
			</div>
		{/if}

		<!-- Intents List -->
		<div class="rounded-lg bg-white shadow-lg dark:bg-gray-800">
			<div class="px-4 py-5 sm:p-6">
				<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">All Intents</h3>

				{#if intentsStore.loading}
					<div class="flex items-center justify-center py-8">
						<svg class="h-8 w-8 animate-spin text-green-500" fill="none" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					</div>
				{:else if intentsStore.intents.length === 0}
					<div class="py-8 text-center">
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
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
						<h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No intents</h3>
						<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
							Get started by creating a new intent.
						</p>
					</div>
				{:else}
					<div class="space-y-4">
						{#each intentsStore.intents as intent}
							<div
								role="button"
								tabindex="0"
								onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleIntentClick(intent)}
								onclick={() => handleIntentClick(intent)}
								class="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
							>
								<div class="flex items-center justify-between">
									<div class="min-w-0 flex-1">
										<div class="flex items-center space-x-3">
											<span class="text-sm font-medium text-gray-900 dark:text-white">
												{getActionLabel(intent.action.id)}
											</span>
											<span
												class="inline-flex rounded-full px-2 py-1 text-xs font-medium {getStatusColor(
													getIntentStatus(intent)
												)}"
											>
												{getIntentStatus(intent)}
											</span>
										</div>
										<div
											class="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400"
										>
											{#if intent.provider}
												<span>Provider: {getAgentName(intent.provider.id)}</span>
											{/if}
											{#if intent.receiver}
												<span>Receiver: {getAgentName(intent.receiver.id)}</span>
											{/if}
											{#if intent.due}
												<span>Due: {formatDateTime(intent.due)}</span>
											{/if}
										</div>
										{#if intent.note}
											<p class="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
												{intent.note}
											</p>
										{/if}
									</div>
									<div class="flex items-center space-x-2">
										{#if intent.resourceQuantity}
											<span class="text-sm text-gray-500 dark:text-gray-400">
												{intent.resourceQuantity.hasNumericalValue}
												{intent.resourceQuantity.hasUnit?.label || 'units'}
											</span>
										{/if}
										<button
											aria-label="Delete intent"
											onclick={(e) => {
												e.stopPropagation();
												handleDeleteIntent(intent.id);
											}}
											class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
										>
											<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Intent Detail Modal -->
{#if selectedIntent}
	<div
		class="fixed inset-0 z-50 overflow-y-auto"
		aria-labelledby="modal-title"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0"
		>
			<div
				class="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity"
				aria-hidden="true"
				onclick={closeIntentDetail}
			></div>
			<div
				class="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle dark:bg-gray-800"
			>
				<div class="absolute top-0 right-0 pt-4 pr-4">
					<button
						type="button"
						class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none dark:bg-gray-800"
						onclick={closeIntentDetail}
					>
						<span class="sr-only">Close</span>
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
				<div class="sm:flex sm:items-start">
					<div class="mt-3 w-full text-center sm:mt-0 sm:text-left">
						<h3
							class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
							id="modal-title"
						>
							Intent Details
						</h3>
						<div class="mt-4 space-y-4">
							<div>
								<span class="block text-sm font-medium text-gray-700 dark:text-gray-300"
									>Action</span
								>
								<p class="mt-1 text-sm text-gray-900 dark:text-white">
									{getActionLabel(selectedIntent.action.id)}
								</p>
							</div>
							{#if selectedIntent.provider}
								<div>
									<span class="block text-sm font-medium text-gray-700 dark:text-gray-300"
										>Provider</span
									>
									<p class="mt-1 text-sm text-gray-900 dark:text-white">
										{getAgentName(selectedIntent.provider.id)}
									</p>
								</div>
							{/if}
							{#if selectedIntent.receiver}
								<div>
									<span class="block text-sm font-medium text-gray-700 dark:text-gray-300"
										>Receiver</span
									>
									<p class="mt-1 text-sm text-gray-900 dark:text-white">
										{getAgentName(selectedIntent.receiver.id)}
									</p>
								</div>
							{/if}
							{#if selectedIntent.resourceQuantity}
								<div>
									<span class="block text-sm font-medium text-gray-700 dark:text-gray-300"
										>Resource Quantity</span
									>
									<p class="mt-1 text-sm text-gray-900 dark:text-white">
										{selectedIntent.resourceQuantity.hasNumericalValue}
										{selectedIntent.resourceQuantity.hasUnit?.label || 'units'}
									</p>
								</div>
							{/if}
							{#if selectedIntent.effortQuantity}
								<div>
									<span class="block text-sm font-medium text-gray-700 dark:text-gray-300"
										>Effort Quantity</span
									>
									<p class="mt-1 text-sm text-gray-900 dark:text-white">
										{selectedIntent.effortQuantity.hasNumericalValue}
										{selectedIntent.effortQuantity.hasUnit?.label || 'units'}
									</p>
								</div>
							{/if}
							{#if selectedIntent.due}
								<div>
									<span class="block text-sm font-medium text-gray-700 dark:text-gray-300"
										>Due Date</span
									>
									<p class="mt-1 text-sm text-gray-900 dark:text-white">
										{formatDateTime(selectedIntent.due)}
									</p>
								</div>
							{/if}
							{#if selectedIntent.note}
								<div>
									<span class="block text-sm font-medium text-gray-700 dark:text-gray-300"
										>Description</span
									>
									<p class="mt-1 text-sm text-gray-900 dark:text-white">{selectedIntent.note}</p>
								</div>
							{/if}
							<div>
								<span class="block text-sm font-medium text-gray-700 dark:text-gray-300"
									>Status</span
								>
								<span
									class="mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium {getStatusColor(
										getIntentStatus(selectedIntent)
									)}"
								>
									{getIntentStatus(selectedIntent)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
