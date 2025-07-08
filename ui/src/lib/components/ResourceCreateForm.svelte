<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { economicResourcesStore, economicEventsStore, agentsStore } from '$lib/stores';
	import type { EconomicResource } from '$lib/graphql/types';

	const dispatch = createEventDispatcher();

	// Form state
	let formData = $state({
		name: '',
		note: '',
		resourceType: 'Document',
		content: '',
		license: 'CC-BY',
		tags: '',
		trackingIdentifier: '',
		currentLocation: ''
	});

	let isCreating = $state(false);
	let createError = $state<string | null>(null);
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
		formData = {
			name: '',
			note: '',
			resourceType: 'Document',
			content: '',
			license: 'CC-BY',
			tags: '',
			trackingIdentifier: '',
			currentLocation: ''
		};
		createError = null;
		showAdvanced = false;
	}

	async function handleSubmit(evt: Event) {
		evt.preventDefault();

		if (!formData.name.trim()) {
			createError = 'Resource name is required';
			return;
		}

		if (!formData.note.trim()) {
			createError = 'Resource description is required';
			return;
		}

		if (!formData.content.trim()) {
			createError = 'Resource content is required';
			return;
		}

		if (!agentsStore.myAgent) {
			createError = 'You must be authenticated as an agent to create resources';
			return;
		}

		isCreating = true;
		createError = null;

		try {
			// Parse tags
			const tags = formData.tags
				.split(',')
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0);

			// Generate a simple content hash for demo purposes
			const contentHash = btoa(formData.content).substring(0, 32);

			// Create the resource data
			const resourceData: Partial<EconomicResource> = {
				name: formData.name.trim(),
				note: formData.note.trim(),
				trackingIdentifier: formData.trackingIdentifier.trim() || undefined,
				currentLocation: formData.currentLocation.trim() || undefined,
				// Set the current agent as the primary accountable
				primaryAccountable: agentsStore.myAgent,
				custodian: agentsStore.myAgent,
				// Add metadata for True Commons specific fields
				...(tags.length > 0 && { tags }),
				license: formData.license,
				resourceType: formData.resourceType,
				contentHash,
				content: formData.content.trim()
			};

			// Create the resource
			const newResource = await economicResourcesStore.createResource(resourceData);

			// Create an economic event for the resource creation
			await economicEventsStore.createEvent({
				action: { id: 'produce', label: 'Produce', resourceEffect: 'increment' },
				provider: agentsStore.myAgent,
				resourceInventoriedAs: newResource,
				resourceQuantity: {
					hasNumericalValue: 1,
					hasUnit: { id: 'one', label: 'Each', symbol: 'ea' }
				},
				hasPointInTime: new Date().toISOString(),
				note: `Created resource: ${newResource.name}`
			});

			// Reset form and notify parent
			resetForm();
			dispatch('created', newResource);
			dispatch('close');

			console.log('Resource created successfully!');
		} catch (error) {
			createError = error instanceof Error ? error.message : 'Failed to create resource';
			console.error('Failed to create resource:', error);
		} finally {
			isCreating = false;
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
					bind:value={formData.name}
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
					bind:value={formData.note}
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
					bind:value={formData.resourceType}
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
					bind:value={formData.content}
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
					bind:value={formData.license}
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
					bind:value={formData.tags}
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
							bind:value={formData.trackingIdentifier}
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
							bind:value={formData.currentLocation}
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							placeholder="Physical or digital location"
						/>
					</div>
				</div>
			{/if}

			<!-- Error Display -->
			{#if createError}
				<div class="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
					<p class="text-sm text-red-800 dark:text-red-200">{createError}</p>
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="flex space-x-3 pt-4">
				<button
					type="submit"
					disabled={isCreating ||
						!formData.name.trim() ||
						!formData.note.trim() ||
						!formData.content.trim()}
					class="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
				>
					{isCreating ? 'Creating...' : 'Create Resource'}
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
