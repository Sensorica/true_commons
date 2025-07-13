<script lang="ts">
	import { onMount } from 'svelte';
	import type { IntentCreateParams } from '$lib/graphql/types';
	import intentsStore from '$lib/stores/intents.store.svelte';
	import foundationService from '$lib/services/foundation.service.svelte';
	import unitsStore from '$lib/stores/units.store.svelte';
	import actionsStore from '$lib/stores/actions.store.svelte';
	import agentsStore from '$lib/stores/agents.store.svelte';
	import resourcesStore from '$lib/stores/resources.store.svelte';
	import processesStore from '$lib/stores/processes.store.svelte';

	// Local interface for form data with required quantities
	interface IntentFormData extends Omit<IntentCreateParams, 'resourceQuantity' | 'effortQuantity'> {
		resourceQuantity: {
			hasNumericalValue: number;
			hasUnit: string;
		};
		effortQuantity: {
			hasNumericalValue: number;
			hasUnit: string;
		};
	}

	let { onIntentCreated = () => {} } = $props<{
		onIntentCreated?: (intent: any) => void;
	}>();

	// Form state
	let formData: IntentFormData = $state({
		action: 'produce',
		provider: '',
		receiver: '',
		resourceConformsTo: '',
		resourceInventoriedAs: '',
		resourceQuantity: {
			hasNumericalValue: 1,
			hasUnit: 'each'
		},
		effortQuantity: {
			hasNumericalValue: 1,
			hasUnit: 'hour'
		},
		hasBeginning: '',
		hasEnd: '',
		due: '',
		note: '',
		inputOf: '',
		outputOf: ''
	});

	// UI state
	let loading = $state(false);
	let error = $state<string | null>(null);
	let validationErrors = $state<string[]>([]);
	let foundationReady = $state(false);
	let isInitializing = $state(false);

	// Check foundation status
	onMount(async () => {
		await checkFoundationStatus();
		await loadRelatedData();
	});

	async function checkFoundationStatus() {
		try {
			if (!foundationService.isInitialized) {
				await foundationService.initialize();
			}

			const status = await foundationService.checkFoundationRequirements();
			foundationReady = status.allReady;

			if (!foundationReady) {
				error = 'Foundation components not ready. Please initialize foundation components first.';
			}
		} catch (err) {
			error = 'Failed to check foundation status';
			console.error(err);
		}
	}

	async function loadRelatedData() {
		try {
			await processesStore.fetchAllProcesses();
		} catch (err) {
			console.error('Failed to load related data:', err);
		}
	}

	async function initializeFoundation() {
		isInitializing = true;
		error = null;

		try {
			await foundationService.ensureFoundationData();
			await checkFoundationStatus();
		} catch (err) {
			error = 'Failed to initialize foundation components';
			console.error(err);
		} finally {
			isInitializing = false;
		}
	}

	async function validateForm(): Promise<boolean> {
		if (!foundationReady) {
			validationErrors = ['Foundation components not ready'];
			return false;
		}

		validationErrors = await intentsStore.validateIntentData(formData);
		return validationErrors.length === 0;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (loading) return;

		const isValid = await validateForm();
		if (!isValid) return;

		loading = true;
		error = null;

		try {
			const createdIntent = await intentsStore.createIntent(formData);
			onIntentCreated(createdIntent);

			// Reset form
			formData = {
				action: 'produce',
				provider: '',
				receiver: '',
				resourceConformsTo: '',
				resourceInventoriedAs: '',
				resourceQuantity: {
					hasNumericalValue: 1,
					hasUnit: 'each'
				},
				effortQuantity: {
					hasNumericalValue: 1,
					hasUnit: 'hour'
				},
				hasBeginning: '',
				hasEnd: '',
				due: '',
				note: '',
				inputOf: '',
				outputOf: ''
			};
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create intent';
		} finally {
			loading = false;
		}
	}

	// Helper function to format datetime for input
	function formatDateTimeForInput(dateString: string): string {
		return new Date(dateString).toISOString().slice(0, 16);
	}
</script>

<div class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
	<h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Create Intent</h2>

	<!-- Foundation Status Check -->
	{#if !foundationReady}
		<div class="mb-4 rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
						Foundation Components Not Ready
					</h3>
					<p class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
						Foundation components (units, actions, agents, resource specifications) must be
						initialized before creating intents.
					</p>
					<div class="mt-3">
						<button
							onclick={initializeFoundation}
							disabled={isInitializing}
							class="rounded-md bg-yellow-600 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
						>
							{isInitializing ? 'Initializing...' : 'Initialize Foundation Components'}
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Error Display -->
	{#if error}
		<div class="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
					<p class="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Validation Errors -->
	{#if validationErrors.length > 0}
		<div class="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-red-800 dark:text-red-200">Validation Errors</h3>
					<ul class="mt-2 list-inside list-disc text-sm text-red-700 dark:text-red-300">
						{#each validationErrors as error}
							<li>{error}</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	{/if}

	<form onsubmit={handleSubmit} class="space-y-6">
		<!-- Action Selection -->
		<div>
			<label for="action" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
				Action *
			</label>
			<select
				id="action"
				bind:value={formData.action}
				required
				disabled={!foundationReady}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			>
				<option value="">Select an action...</option>
				{#each actionsStore.actions as action}
					<option value={action.id}>{action.label}</option>
				{/each}
			</select>
			<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
				What type of economic activity do you intend to perform?
			</p>
		</div>

		<!-- Provider Agent -->
		<div>
			<label for="provider" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
				Provider Agent
			</label>
			<select
				id="provider"
				bind:value={formData.provider}
				disabled={!foundationReady}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			>
				<option value="">Select a provider...</option>
				{#each agentsStore.agents as agent}
					<option value={agent.id}>{agent.name}</option>
				{/each}
			</select>
			<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
				Who will provide the resource or service?
			</p>
		</div>

		<!-- Receiver Agent -->
		<div>
			<label for="receiver" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
				Receiver Agent
			</label>
			<select
				id="receiver"
				bind:value={formData.receiver}
				disabled={!foundationReady}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			>
				<option value="">Select a receiver...</option>
				{#each agentsStore.agents as agent}
					<option value={agent.id}>{agent.name}</option>
				{/each}
			</select>
			<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
				Who will receive the resource or service?
			</p>
		</div>

		<!-- Resource Specification -->
		<div>
			<label
				for="resourceConformsTo"
				class="block text-sm font-medium text-gray-700 dark:text-gray-300"
			>
				Resource Type
			</label>
			<select
				id="resourceConformsTo"
				bind:value={formData.resourceConformsTo}
				disabled={!foundationReady}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			>
				<option value="">Select a resource type...</option>
				{#each resourcesStore.resourceSpecifications as spec}
					<option value={spec.id}>{spec.name}</option>
				{/each}
			</select>
			<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
				What type of resource is this intent about?
			</p>
		</div>

		<!-- Resource Quantities -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<label
					for="intentResourceQty"
					class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Resource Quantity
				</label>
				<div class="mt-1 flex space-x-2">
					<input
						id="intentResourceQty"
						type="number"
						bind:value={formData.resourceQuantity.hasNumericalValue}
						min="0"
						step="0.01"
						disabled={!foundationReady}
						class="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
					<select
						bind:value={formData.resourceQuantity.hasUnit}
						disabled={!foundationReady}
						class="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						{#each unitsStore.units as unit}
							<option value={unit.id}>{unit.label}</option>
						{/each}
					</select>
				</div>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">How much of the resource?</p>
			</div>

			<div>
				<label
					for="intentEffortQty"
					class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Effort Quantity
				</label>
				<div class="mt-1 flex space-x-2">
					<input
						id="intentEffortQty"
						type="number"
						bind:value={formData.effortQuantity.hasNumericalValue}
						min="0"
						step="0.01"
						disabled={!foundationReady}
						class="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
					<select
						bind:value={formData.effortQuantity.hasUnit}
						disabled={!foundationReady}
						class="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						{#each unitsStore.units as unit}
							<option value={unit.id}>{unit.label}</option>
						{/each}
					</select>
				</div>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">How much effort is expected?</p>
			</div>
		</div>

		<!-- Time Fields -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div>
				<label
					for="hasBeginning"
					class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Desired Start Time
				</label>
				<input
					id="hasBeginning"
					type="datetime-local"
					bind:value={formData.hasBeginning}
					disabled={!foundationReady}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>

			<div>
				<label for="hasEnd" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					Desired End Time
				</label>
				<input
					id="hasEnd"
					type="datetime-local"
					bind:value={formData.hasEnd}
					disabled={!foundationReady}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>

			<div>
				<label for="due" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					Due Date
				</label>
				<input
					id="due"
					type="datetime-local"
					bind:value={formData.due}
					disabled={!foundationReady}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>
		</div>

		<!-- Note -->
		<div>
			<label for="note" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
				Description *
			</label>
			<textarea
				id="note"
				bind:value={formData.note}
				disabled={!foundationReady}
				rows="3"
				required
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				placeholder="Describe what you intend to do..."
			></textarea>
			<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
				Provide a clear description of your intent
			</p>
		</div>

		<!-- Process Relationships -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<label for="inputOf" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					Input to Process
				</label>
				<select
					id="inputOf"
					bind:value={formData.inputOf}
					disabled={!foundationReady}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				>
					<option value="">Select a process...</option>
					{#each processesStore.processes as process}
						<option value={process.id}>{process.name}</option>
					{/each}
				</select>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					Will this intent be an input to a process?
				</p>
			</div>

			<div>
				<label for="outputOf" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					Output of Process
				</label>
				<select
					id="outputOf"
					bind:value={formData.outputOf}
					disabled={!foundationReady}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				>
					<option value="">Select a process...</option>
					{#each processesStore.processes as process}
						<option value={process.id}>{process.name}</option>
					{/each}
				</select>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					Will this intent be an output of a process?
				</p>
			</div>
		</div>

		<!-- Submit Button -->
		<div class="flex justify-end space-x-4">
			<button
				type="submit"
				disabled={loading || !foundationReady}
				class="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
			>
				{#if loading}
					<svg class="mr-3 -ml-1 h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Creating...
				{:else}
					Create Intent
				{/if}
			</button>
		</div>
	</form>
</div>
