<script lang="ts">
	import { onMount } from 'svelte';
	import CommitmentCreateForm from '$lib/components/CommitmentCreateForm.svelte';
	import commitmentsStore from '$lib/stores/commitments.store.svelte';
	import foundationService from '$lib/services/foundation.service.svelte';
	import agentsStore from '$lib/stores/agents.store.svelte';
	import actionsStore from '$lib/stores/actions.store.svelte';
	import type { Commitment } from '$lib/graphql/types';

	let showCreateForm = $state(false);
	let selectedCommitment = $state<Commitment | null>(null);

	onMount(async () => {
		// Initialize foundation and stores
		await foundationService.initialize();
		await Promise.all([commitmentsStore.fetchAllCommitments(), agentsStore.fetchAllAgents()]);
	});

	function handleCommitmentCreated(commitment: Commitment) {
		showCreateForm = false;
		console.log('Commitment created:', commitment);
	}

	function handleCommitmentClick(commitment: Commitment) {
		selectedCommitment = commitment;
	}

	function closeCommitmentDetail() {
		selectedCommitment = null;
	}

	async function handleDeleteCommitment(commitmentId: string) {
		if (confirm('Are you sure you want to delete this commitment?')) {
			try {
				await commitmentsStore.deleteCommitment(commitmentId);
				if (selectedCommitment?.id === commitmentId) {
					selectedCommitment = null;
				}
			} catch (error) {
				console.error('Failed to delete commitment:', error);
				alert('Failed to delete commitment. Please try again.');
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

	function getCommitmentStatus(commitment: Commitment): string {
		if (commitment.fulfilledBy && commitment.fulfilledBy.length > 0) {
			return 'Fulfilled';
		}
		if (commitment.due) {
			const dueDate = new Date(commitment.due);
			const now = new Date();
			if (dueDate < now) {
				return 'Overdue';
			}
		}
		return 'Active';
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'Fulfilled':
				return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
			case 'Overdue':
				return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
			default:
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
		}
	}
</script>

<svelte:head>
	<title>Commitments - True Commons</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Commitments</h1>
					<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
						Manage promises and obligations within the network
					</p>
				</div>
				<button
					onclick={() => (showCreateForm = !showCreateForm)}
					class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600"
				>
					<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						/>
					</svg>
					New Commitment
				</button>
			</div>
		</div>

		<!-- Create Form -->
		{#if showCreateForm}
			<div class="mb-8">
				<CommitmentCreateForm onCommitmentCreated={handleCommitmentCreated} />
			</div>
		{/if}

		<!-- Commitments List -->
		<div class="rounded-lg bg-white shadow-lg dark:bg-gray-800">
			<div class="px-4 py-5 sm:p-6">
				<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">All Commitments</h3>

				{#if commitmentsStore.loading}
					<div class="flex items-center justify-center py-8">
						<svg class="h-8 w-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
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
				{:else if commitmentsStore.commitments.length === 0}
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
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No commitments</h3>
						<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
							Get started by creating a new commitment.
						</p>
					</div>
				{:else}
					<div class="space-y-4">
						{#each commitmentsStore.commitments as commitment}
							<div
								role="button"
								tabindex="0"
								onkeydown={(e) =>
									(e.key === 'Enter' || e.key === ' ') && handleCommitmentClick(commitment)}
								class="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
								onclick={() => handleCommitmentClick(commitment)}
							>
								<div class="flex items-center justify-between">
									<div class="min-w-0 flex-1">
										<div class="flex items-center space-x-3">
											<span class="text-sm font-medium text-gray-900 dark:text-white">
												{getActionLabel(commitment.action.id)}
											</span>
											<span
												class="inline-flex rounded-full px-2 py-1 text-xs font-medium {getStatusColor(
													getCommitmentStatus(commitment)
												)}"
											>
												{getCommitmentStatus(commitment)}
											</span>
										</div>
										<div
											class="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400"
										>
											{#if commitment.provider}
												<span>Provider: {getAgentName(commitment.provider.id)}</span>
											{/if}
											{#if commitment.receiver}
												<span>Receiver: {getAgentName(commitment.receiver.id)}</span>
											{/if}
											{#if commitment.due}
												<span>Due: {formatDateTime(commitment.due)}</span>
											{/if}
										</div>
										{#if commitment.note}
											<p class="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
												{commitment.note}
											</p>
										{/if}
									</div>
									<div class="flex items-center space-x-2">
										{#if commitment.resourceQuantity}
											<span class="text-sm text-gray-500 dark:text-gray-400">
												{commitment.resourceQuantity.hasNumericalValue}
												{commitment.resourceQuantity.hasUnit?.label || 'units'}
											</span>
										{/if}
										<button
											aria-label="Delete commitment"
											onclick={(e) => {
												e.stopPropagation();
												handleDeleteCommitment(commitment.id);
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
