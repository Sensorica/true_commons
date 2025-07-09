<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import agentsStore from '$lib/stores/agents.store.svelte';
	import resourcesStore from '$lib/stores/resources.store.svelte';
	import type { EconomicResource } from '$lib/graphql/types';

	const dispatch = createEventDispatcher();

	// Form state
	let form = $state({
		name: '',
		note: '',
		primaryAccountable: '',
		custodian: '',
		license: 'CC-BY',
		resourceType: 'Document',
		content: '',
		trackingIdentifier: '',
		tags: '',
		currentLocation: ''
	});

	let loading = $state(false);
	let error = $state<string | null>(null);
	let formErrors = $state<Record<string, string>>({});
	let showAdvanced = $state(false);

	// Resource type options
	const resourceTypes = [
		'Document',
		'Software',
		'Design',
		'Dataset',
		'Media',
		'Knowledge',
		'Tool',
		'Process',
		'Template'
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

	function resetForm() {
		form = {
			name: '',
			note: '',
			primaryAccountable: '',
			custodian: '',
			license: 'CC-BY',
			resourceType: 'Document',
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

		if (!form.name.trim()) {
			formErrors.name = 'Name is required';
			return;
		}

		loading = true;
		error = null;
		formErrors = {};

		try {
			// Create resource data object
			const resourceData = {
				name: form.name,
				note: JSON.stringify({
					note: form.note,
					primaryAccountable: form.primaryAccountable,
					custodian: form.custodian,
					license: form.license,
					resourceType: form.resourceType,
					contentHash: btoa(form.content),
					content: form.content
				}),
				trackingIdentifier: form.trackingIdentifier || undefined
			};

			console.log('Creating resource with data:', resourceData);

			// Use the new createResource method that handles ResourceSpecifications
			const newResource = await resourcesStore.createResource(resourceData);

			console.log('Resource created successfully:', newResource);

			// Reset form
			form = {
				name: '',
				note: '',
				primaryAccountable: '',
				custodian: '',
				license: 'CC-BY',
				resourceType: 'Document',
				content: '',
				trackingIdentifier: '',
				tags: '',
				currentLocation: ''
			};

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

		<form onsubmit={handleSubmit} class="space-y-4">
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
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
					rows="3"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					placeholder="Describe what this resource is and how it can be used"
				></textarea>
			</div>

			<!-- Resource Type -->
			<div>
				<label
					for="resource-type"
					class="block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Type
				</label>
				<select
					id="resource-type"
					bind:value={form.resourceType}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				>
					{#each resourceTypes as type}
						<option value={type}>{type}</option>
					{/each}
				</select>
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
					rows="6"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
					class="flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
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
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
					disabled={loading || !form.name.trim() || !form.note.trim() || !form.content.trim()}
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
