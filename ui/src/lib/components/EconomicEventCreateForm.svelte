<script lang="ts">
	import { onMount } from 'svelte';
	import type { EconomicEventCreateParams } from '$lib/graphql/types';
	import economicEventsStore from '$lib/stores/economic-events.store.svelte';
	import foundationService from '$lib/services/foundation.service.svelte';
	import unitsStore from '$lib/stores/units.store.svelte';
	import actionsStore from '$lib/stores/actions.store.svelte';
	import agentsStore from '$lib/stores/agents.store.svelte';
	import resourcesStore from '$lib/stores/resources.store.svelte';
	import processesStore from '$lib/stores/processes.store.svelte';

	let { onEventCreated = () => {} } = $props<{
		onEventCreated?: (event: any) => void;
	}>();

	// Form state
	let formData: EconomicEventCreateParams = $state({
		action: 'produce',
		provider: '',
		receiver: '',
		resourceInventoriedAs: '',
		resourceConformsTo: '',
		resourceQuantity: {
			hasNumericalValue: 1,
			hasUnit: 'each'
		},
		effortQuantity: {
			hasNumericalValue: 1,
			hasUnit: 'hour'
		},
		hasPointInTime: new Date().toISOString().slice(0, 16),
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
		await loadProcesses();
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

	async function loadProcesses() {
		try {
			await processesStore.fetchAllProcesses();
		} catch (err) {
			console.error('Failed to load processes:', err);
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

		validationErrors = await economicEventsStore.validateEventData(formData);
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
			const createdEvent = await economicEventsStore.createEvent(formData);
			onEventCreated(createdEvent);

			// Reset form
			formData = {
				action: 'produce',
				provider: '',
				receiver: '',
				resourceInventoriedAs: '',
				resourceConformsTo: '',
				resourceQuantity: {
					hasNumericalValue: 1,
					hasUnit: 'each'
				},
				effortQuantity: {
					hasNumericalValue: 1,
					hasUnit: 'hour'
				},
				hasPointInTime: new Date().toISOString().slice(0, 16),
				note: '',
				inputOf: '',
				outputOf: ''
			};
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create event';
		} finally {
			loading = false;
		}
	}

	// Helper function to format datetime for input
	function formatDateTimeForInput(dateString: string): string {
		return new Date(dateString).toISOString().slice(0, 16);
	}

	// Update datetime when changed
	function handleDateTimeChange(event: Event) {
		const target = event.target as HTMLInputElement;
		formData.hasPointInTime = new Date(target.value).toISOString();
	}
</script>

<div class="economic-event-form">
	<div class="form-header">
		<h2>Create Economic Event</h2>
		<p class="description">
			Economic events represent actual occurrences of economic activity - production, consumption,
			exchange, etc.
		</p>
	</div>

	{#if !foundationReady}
		<div class="foundation-warning">
			<h3>⚠️ Foundation Components Required</h3>
			<p>
				Economic events require foundation components (Units, Actions, Agents, Resource
				Specifications) to be initialized first.
			</p>
			<button
				type="button"
				class="btn btn-primary"
				onclick={initializeFoundation}
				disabled={isInitializing}
			>
				{isInitializing ? 'Initializing...' : 'Initialize Foundation Components'}
			</button>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="event-form">
			<div class="form-section">
				<h3>Event Details</h3>

				<div class="form-group">
					<label for="action">Action *</label>
					<select id="action" bind:value={formData.action} required>
						<option value="">Select an action...</option>
						{#each actionsStore.actions as action}
							<option value={action.id}>{action.label} ({action.resourceEffect})</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="hasPointInTime">Date & Time *</label>
					<input
						type="datetime-local"
						id="hasPointInTime"
						value={formatDateTimeForInput(formData.hasPointInTime || '')}
						onchange={handleDateTimeChange}
						required
					/>
				</div>

				<div class="form-group">
					<label for="note">Note</label>
					<textarea
						id="note"
						bind:value={formData.note}
						placeholder="Description of the economic event..."
						rows="3"
					></textarea>
				</div>
			</div>

			<div class="form-section">
				<h3>Participants</h3>

				<div class="form-group">
					<label for="provider">Provider Agent</label>
					<select id="provider" bind:value={formData.provider}>
						<option value="">Select provider...</option>
						{#each agentsStore.agents as agent}
							<option value={agent.id}>{agent.name}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="receiver">Receiver Agent</label>
					<select id="receiver" bind:value={formData.receiver}>
						<option value="">Select receiver...</option>
						{#each agentsStore.agents as agent}
							<option value={agent.id}>{agent.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="form-section">
				<h3>Resource Information</h3>

				<div class="form-group">
					<label for="resourceInventoriedAs">Resource Instance</label>
					<select id="resourceInventoriedAs" bind:value={formData.resourceInventoriedAs}>
						<option value="">Select resource...</option>
						{#each resourcesStore.resources as resource}
							<option value={resource.id}>{resource.name}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="resourceConformsTo">Resource Specification</label>
					<select id="resourceConformsTo" bind:value={formData.resourceConformsTo}>
						<option value="">Select resource type...</option>
						{#each resourcesStore.resourceSpecifications as spec}
							<option value={spec.id}>{spec.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="form-section">
				<h3>Quantities</h3>

				<div class="form-row">
					<div class="form-group">
						<label for="resourceQuantityValue">Resource Quantity</label>
						<input
							type="number"
							id="resourceQuantityValue"
							bind:value={formData.resourceQuantity.hasNumericalValue}
							min="0"
							step="0.01"
						/>
					</div>
					<div class="form-group">
						<label for="resourceQuantityUnit">Resource Unit</label>
						<select id="resourceQuantityUnit" bind:value={formData.resourceQuantity.hasUnit}>
							<option value="">Select unit...</option>
							{#each unitsStore.units as unit}
								<option value={unit.id}>{unit.label} ({unit.symbol})</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="effortQuantityValue">Effort Quantity</label>
						<input
							type="number"
							id="effortQuantityValue"
							bind:value={formData.effortQuantity.hasNumericalValue}
							min="0"
							step="0.01"
						/>
					</div>
					<div class="form-group">
						<label for="effortQuantityUnit">Effort Unit</label>
						<select id="effortQuantityUnit" bind:value={formData.effortQuantity.hasUnit}>
							<option value="">Select unit...</option>
							{#each unitsStore.units as unit}
								<option value={unit.id}>{unit.label} ({unit.symbol})</option>
							{/each}
						</select>
					</div>
				</div>
			</div>

			<div class="form-section">
				<h3>Process Linking</h3>
				<p class="section-description">
					Link this event to a process as either an input or output.
				</p>

				<div class="form-group">
					<label for="inputOf">Input to Process</label>
					<select id="inputOf" bind:value={formData.inputOf}>
						<option value="">Select a process...</option>
						{#each processesStore.processes as process}
							<option value={process.id}>{process.name}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="outputOf">Output from Process</label>
					<select id="outputOf" bind:value={formData.outputOf}>
						<option value="">Select a process...</option>
						{#each processesStore.processes as process}
							<option value={process.id}>{process.name}</option>
						{/each}
					</select>
				</div>

				<div class="form-note">
					<p>
						<strong>Note:</strong> An event can be either an input <em>or</em> output to a process, but
						not both.
					</p>
				</div>
			</div>

			{#if validationErrors.length > 0}
				<div class="validation-errors">
					<h4>Validation Errors:</h4>
					<ul>
						{#each validationErrors as error}
							<li>{error}</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if error}
				<div class="error-message">
					<p>{error}</p>
				</div>
			{/if}

			<div class="form-actions">
				<button type="submit" class="btn btn-primary" disabled={loading || !foundationReady}>
					{loading ? 'Creating...' : 'Create Event'}
				</button>
			</div>
		</form>
	{/if}
</div>

<style>
	.economic-event-form {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	.form-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.form-header h2 {
		color: #2c3e50;
		margin-bottom: 0.5rem;
	}

	.description {
		color: #7f8c8d;
		font-style: italic;
	}

	.foundation-warning {
		background: #fff3cd;
		border: 1px solid #ffeaa7;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 2rem;
		text-align: center;
	}

	.foundation-warning h3 {
		color: #856404;
		margin-bottom: 1rem;
	}

	.event-form {
		background: #f8f9fa;
		border-radius: 8px;
		padding: 2rem;
	}

	.form-section {
		margin-bottom: 2rem;
	}

	.form-section h3 {
		color: #2c3e50;
		margin-bottom: 1rem;
		border-bottom: 2px solid #3498db;
		padding-bottom: 0.5rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #2c3e50;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #3498db;
		box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
	}

	.validation-errors {
		background: #f8d7da;
		border: 1px solid #f5c6cb;
		border-radius: 4px;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.validation-errors h4 {
		color: #721c24;
		margin-bottom: 0.5rem;
	}

	.validation-errors ul {
		margin: 0;
		padding-left: 1.5rem;
	}

	.validation-errors li {
		color: #721c24;
		margin-bottom: 0.25rem;
	}

	.error-message {
		background: #f8d7da;
		border: 1px solid #f5c6cb;
		border-radius: 4px;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.error-message p {
		color: #721c24;
		margin: 0;
	}

	.form-actions {
		text-align: center;
		padding-top: 1rem;
		border-top: 1px solid #ddd;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-primary {
		background: #3498db;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2980b9;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.section-description {
		color: #666;
		font-size: 0.9rem;
		margin-bottom: 1rem;
		line-height: 1.4;
	}

	.form-note {
		background: #e9ecef;
		border: 1px solid #dee2e6;
		border-radius: 4px;
		padding: 1rem;
		margin-top: 1rem;
	}

	.form-note p {
		margin: 0;
		font-size: 0.9rem;
		color: #495057;
	}

	@media (max-width: 768px) {
		.economic-event-form {
			padding: 1rem;
		}

		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>
