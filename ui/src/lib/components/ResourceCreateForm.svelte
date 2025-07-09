<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import agentsStore from '$lib/stores/agents.store.svelte';
	import resourcesStore from '$lib/stores/resources.store.svelte';
	import unitsStore from '$lib/stores/units.store.svelte';
	import actionsStore from '$lib/stores/actions.store.svelte';
	import foundationService from '$lib/services/foundation.service.svelte';
	import type { EconomicResource, ResourceSpecification } from '$lib/graphql/types';

	const dispatch = createEventDispatcher();

	// Form state
	let form = $state({
		name: '',
		note: '',
		primaryAccountable: '',
		custodian: '',
		license: 'CC-BY',
		resourceType: 'Document',
		conformsTo: '', // ResourceSpecification ID
		content: '',
		trackingIdentifier: '',
		tags: '',
		currentLocation: ''
	});

	let loading = $state(false);
	let error = $state<string | null>(null);
	let formErrors = $state<Record<string, string>>({});
	let showAdvanced = $state(false);
	let foundationReady = $state(false);
	let foundationStatus = $state<any>(null);
	let initializingFoundation = $state(false);

	// Resource type options - now mapped to ResourceSpecification IDs
	const resourceTypes = [
		{ id: 'document-spec', label: 'Document' },
		{ id: 'software-spec', label: 'Software' },
		{ id: 'design-spec', label: 'Design' },
		{ id: 'knowledge-spec', label: 'Knowledge' }
	];

	// License options
	const licenseOptions = [
		{ value: 'CC0', label: 'CC0 - Public Domain' },
		{ value: 'CC-BY', label: 'CC BY - Attribution' },
		{ value: 'CC-BY-SA', label: 'CC BY-SA - Attribution-ShareAlike' },
		{ value: 'CC-BY-NC', label: 'CC BY-NC - Attribution-NonCommercial' },
		{ value: 'MIT', label: 'MIT License' },
		{ value: 'GPL-3.0', label: 'GPL v3' },
		{ value: 'Apache-2.0', label: 'Apache 2.0' },
		{ value: 'Custom', label: 'Custom License' }
	];

	onMount(async () => {
		await checkFoundationStatus();
		// Set default ResourceSpecification
		if (resourcesStore.resourceSpecifications.length > 0) {
			form.conformsTo = resourcesStore.resourceSpecifications[0].id;
		} else {
			form.conformsTo = 'document-spec'; // Default fallback
		}
	});

	async function checkFoundationStatus() {
		try {
			foundationStatus = await foundationService.checkFoundationRequirements();
			foundationReady = foundationStatus.allReady;
			
			if (!foundationReady) {
				console.log('Foundation not ready:', foundationStatus);
			}
		} catch (err) {
			console.error('Failed to check foundation status:', err);
			error = 'Failed to verify system requirements. Please try again.';
		}
	}

	async function initializeFoundation() {
		if (initializingFoundation) return;
		
		initializingFoundation = true;
		error = null;

		try {
			await foundationService.initialize();
			await checkFoundationStatus();
			console.log('Foundation initialized successfully');
		} catch (err) {
			console.error('Failed to initialize foundation:', err);
			error = 'Failed to initialize system requirements. Please check the console for details.';
		} finally {
			initializingFoundation = false;
		}
	}

	function resetForm() {
		form = {
			name: '',
			note: '',
			primaryAccountable: '',
			custodian: '',
			license: 'CC-BY',
			resourceType: 'Document',
			conformsTo: resourcesStore.resourceSpecifications.length > 0 
				? resourcesStore.resourceSpecifications[0].id 
				: 'document-spec',
			content: '',
			trackingIdentifier: '',
			tags: '',
			currentLocation: ''
		};
		error = null;
		formErrors = {};
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		// Check foundation requirements before proceeding
		if (!foundationReady) {
			error = 'System requirements not met. Please initialize foundation components first.';
			return;
		}

		if (!form.name.trim()) {
			formErrors.name = 'Name is required';
			return;
		}

		if (!form.conformsTo) {
			formErrors.conformsTo = 'Resource specification is required';
			return;
		}

		loading = true;
		error = null;
		formErrors = {};

		try {
			// Find the selected ResourceSpecification
			const selectedSpec = resourcesStore.resourceSpecifications.find(
				rs => rs.id === form.conformsTo
			);

			if (!selectedSpec) {
				throw new Error('Selected resource specification not found');
			}

			// Create resource data object with proper ValueFlows structure
			const resourceData = {
				name: form.name,
				note: JSON.stringify({
					note: form.note,
					primaryAccountable: form.primaryAccountable,
					custodian: form.custodian,
					license: form.license,
					resourceType: form.resourceType,
					contentHash: btoa(form.content),
					content: form.content,
					tags: form.tags ? form.tags.split(',').map(t => t.trim()) : []
				}),
				trackingIdentifier: form.trackingIdentifier || undefined,
				currentLocation: form.currentLocation || undefined,
				conformsTo: selectedSpec,
				// Set default quantities using proper Units
				accountingQuantity: {
					hasNumericalValue: 1,
					hasUnit: selectedSpec.defaultUnitOfResource || unitsStore.getUnitById('one')
				},
				onhandQuantity: {
					hasNumericalValue: 1,
					hasUnit: selectedSpec.defaultUnitOfResource || unitsStore.getUnitById('one')
				}
			};

			console.log('Creating resource with data:', resourceData);

			// Use the createResource method that handles ResourceSpecifications properly
			const newResource = await resourcesStore.createResource(resourceData);

			console.log('Resource created successfully:', newResource);

			// Reset form
			resetForm();

			// Dispatch success event
			dispatch('resource-created', { resource: newResource });
		} catch (err) {
			console.error('Failed to create resource:', err);
			error = err instanceof Error ? err.message : 'Failed to create resource';
		} finally {
			loading = false;
		}
	}

	function handleCancel() {
		resetForm();
		dispatch('close');
	}
</script>

<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
	<div
		class="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
	>
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-xl font-semibold text-gray-900 dark:text-white">Create New Resource</h3>
			<button
				aria-label="Close"
				onclick={handleCancel}
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
		</div>

		<!-- Foundation Status Warning -->
		{#if !foundationReady && foundationStatus}
			<div class="mb-4 rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
				<div class="flex">
					<div class="flex-shrink-0">
						<svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
						</svg>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
							System Requirements Not Met
						</h3>
						<div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
							<p>Before creating resources, the following foundation components need to be initialized:</p>
							<ul class="mt-1 list-disc list-inside">
								{#if !foundationStatus.unitsReady}
									<li>Units: {foundationStatus.missing.units.join(', ')}</li>
								{/if}
								{#if !foundationStatus.actionsReady}
									<li>Actions: {foundationStatus.missing.actions.join(', ')}</li>
								{/if}
								{#if !foundationStatus.resourceSpecificationsReady}
									<li>Resource Specifications: {foundationStatus.missing.resourceSpecifications.join(', ')}</li>
								{/if}
							</ul>
						</div>
						<div class="mt-3">
							<button
								onclick={initializeFoundation}
								disabled={initializingFoundation}
								class="rounded-md bg-yellow-600 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
							>
								{initializingFoundation ? 'Initializing...' : 'Initialize Foundation Components'}
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Foundation Initialization Progress -->
		{#if initializingFoundation && foundationService.initializationProgress}
			<div class="mb-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<svg class="h-5 w-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
							{foundationService.initializationProgress.step}
						</h3>
						<p class="text-sm text-blue-700 dark:text-blue-300">
							{foundationService.initializationProgress.currentOperation}
						</p>
						<div class="mt-2 w-full bg-blue-200 rounded-full h-2 dark:bg-blue-700">
							<div 
								class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
								style="width: {(foundationService.initializationProgress.completed / foundationService.initializationProgress.total) * 100}%"
							></div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-4">
			<!-- Resource Specification Selection -->
			<div>
				<label
					for="resource-spec"
					class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Resource Type *
				</label>
				<select
					id="resource-spec"
					bind:value={form.conformsTo}
					required
					disabled={!foundationReady}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
				>
					<option value="">Select a resource type...</option>
					{#each resourcesStore.resourceSpecifications as spec}
						<option value={spec.id}>{spec.name}</option>
					{/each}
				</select>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					This determines the default units and properties for your resource
				</p>
			</div>

			<!-- Resource Name -->
			<div>
				<label
					for="resource-name"
					class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Name *
				</label>
				<input
					id="resource-name"
					type="text"
					bind:value={form.name}
					required
					disabled={!foundationReady}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
					placeholder="Enter resource name"
				/>
			</div>

			<!-- Resource Description -->
			<div>
				<label
					for="resource-note"
					class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Description *
				</label>
				<textarea
					id="resource-note"
					bind:value={form.note}
					required
					disabled={!foundationReady}
					rows="3"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
					placeholder="Describe what this resource is and how it can be used"
				></textarea>
			</div>

			<!-- Content -->
			<div>
				<label
					for="resource-content"
					class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Content *
				</label>
				<textarea
					id="resource-content"
					bind:value={form.content}
					required
					disabled={!foundationReady}
					rows="6"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
					placeholder="Enter the content of your resource (text, code, instructions, etc.)"
				></textarea>
			</div>

			<!-- License -->
			<div>
				<label
					for="resource-license"
					class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					License
				</label>
				<select
					id="resource-license"
					bind:value={form.license}
					disabled={!foundationReady}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
				>
					{#each licenseOptions as license}
						<option value={license.value}>{license.label}</option>
					{/each}
				</select>
			</div>

			<!-- Tags -->
			<div>
				<label
					for="resource-tags"
					class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Tags
				</label>
				<input
					id="resource-tags"
					type="text"
					bind:value={form.tags}
					disabled={!foundationReady}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
					placeholder="comma, separated, tags"
				/>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					Separate tags with commas (e.g., "agriculture, open-source, irrigation")
				</p>
			</div>

			<!-- Advanced Options Toggle -->
			<div>
				<button
					type="button"
					onclick={() => (showAdvanced = !showAdvanced)}
					disabled={!foundationReady}
					class="flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 disabled:opacity-50"
				>
					<svg
						class="mr-1 h-4 w-4 transform transition-transform {showAdvanced ? 'rotate-90' : ''}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
					Advanced Options
				</button>
			</div>

			<!-- Advanced Options -->
			{#if showAdvanced}
				<div class="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-600">
					<div>
						<label
							for="tracking-identifier"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Tracking Identifier
						</label>
						<input
							id="tracking-identifier"
							type="text"
							bind:value={form.trackingIdentifier}
							disabled={!foundationReady}
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
							placeholder="Optional unique identifier"
						/>
					</div>

					<div>
						<label
							for="current-location"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Location
						</label>
						<input
							id="current-location"
							type="text"
							bind:value={form.currentLocation}
							disabled={!foundationReady}
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
							placeholder="Physical or digital location"
						/>
					</div>
				</div>
			{/if}

			<!-- Error Display -->
			{#if error}
				<div class="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
					<p class="text-sm text-red-800 dark:text-red-200">{error}</p>
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="flex space-x-3 pt-4">
				<button
					type="submit"
					disabled={loading || !foundationReady || !form.name.trim() || !form.note.trim() || !form.content.trim() || !form.conformsTo}
					class="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
				>
					{loading ? 'Creating...' : 'Create Resource'}
				</button>
				<button
					type="button"
					onclick={handleCancel}
					class="flex-1 rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
				>
					Cancel
				</button>
			</div>
		</form>
	</div>
</div>
