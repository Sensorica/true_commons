<script lang="ts">
	import { onMount } from 'svelte';
	import EconomicEventCreateForm from '$lib/components/EconomicEventCreateForm.svelte';
	import economicEventsStore from '$lib/stores/economic-events.store.svelte';
	import foundationService from '$lib/services/foundation.service.svelte';
	import agentsStore from '$lib/stores/agents.store.svelte';
	import resourcesStore from '$lib/stores/resources.store.svelte';
	import unitsStore from '$lib/stores/units.store.svelte';
	import actionsStore from '$lib/stores/actions.store.svelte';
	import type { EconomicEvent } from '$lib/graphql/types';

	let showCreateForm = $state(false);
	let selectedEvent = $state<EconomicEvent | null>(null);

	onMount(async () => {
		// Initialize foundation and stores
		await foundationService.initialize();
		await Promise.all([
			economicEventsStore.fetchAllEvents(),
			agentsStore.fetchAllAgents(),
			resourcesStore.fetchAllResources(),
			resourcesStore.fetchAllResourceSpecifications()
		]);
	});

	function handleEventCreated(event: EconomicEvent) {
		showCreateForm = false;
		console.log('Event created:', event);
	}

	function handleEventClick(event: EconomicEvent) {
		selectedEvent = event;
	}

	function closeEventDetail() {
		selectedEvent = null;
	}

	async function handleDeleteEvent(eventId: string) {
		if (confirm('Are you sure you want to delete this event?')) {
			try {
				await economicEventsStore.deleteEvent(eventId);
				if (selectedEvent?.id === eventId) {
					selectedEvent = null;
				}
			} catch (error) {
				console.error('Failed to delete event:', error);
				alert('Failed to delete event. Please try again.');
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

	function getUnitLabel(unitId: string): string {
		const unit = unitsStore.units.find((u) => u.id === unitId);
		return unit ? `${unit.label} (${unit.symbol})` : unitId;
	}
</script>

<div class="events-page">
	<div class="page-header">
		<h1>Economic Events</h1>
		<p class="description">
			Economic events represent actual occurrences of economic activity such as production,
			consumption, exchange, and transfers.
		</p>

		<div class="header-actions">
			<button class="btn btn-primary" onclick={() => (showCreateForm = true)}>
				Create Event
			</button>
		</div>
	</div>

	{#if showCreateForm}
		<div
			class="modal-overlay"
			role="button"
			tabindex="0"
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (showCreateForm = false)}
			onclick={() => (showCreateForm = false)}
		>
			<div class="modal-content" onpointerdown={(e) => e.stopPropagation()}>
				<button aria-label="Close" class="close-button" onclick={() => (showCreateForm = false)}>
					&times;
				</button>
				<EconomicEventCreateForm onEventCreated={handleEventCreated} />
			</div>
		</div>
	{/if}

	{#if selectedEvent}
		<div
			class="modal-overlay"
			role="button"
			tabindex="0"
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && closeEventDetail()}
			onclick={closeEventDetail}
		>
			<div class="modal-content" onpointerdown={(e) => e.stopPropagation()}>
				<button aria-label="Close" class="close-button" onclick={closeEventDetail}>
					&times;
				</button>
				<div class="event-detail">
					<h2>Event Details</h2>

					<div class="detail-section">
						<h3>Basic Information</h3>
						<div class="detail-grid">
							<div class="detail-item">
								<strong>Action:</strong>
								<span
									>{getActionLabel(selectedEvent.action.id)} ({selectedEvent.action
										.resourceEffect})</span
								>
							</div>
							<div class="detail-item">
								<strong>Date & Time:</strong>
								<span>{formatDateTime(selectedEvent.hasPointInTime || '')}</span>
							</div>
							{#if selectedEvent.note}
								<div class="detail-item">
									<strong>Note:</strong>
									<span>{selectedEvent.note}</span>
								</div>
							{/if}
						</div>
					</div>

					<div class="detail-section">
						<h3>Participants</h3>
						<div class="detail-grid">
							{#if selectedEvent.provider}
								<div class="detail-item">
									<strong>Provider:</strong>
									<span>{selectedEvent.provider.name}</span>
								</div>
							{/if}
							{#if selectedEvent.receiver}
								<div class="detail-item">
									<strong>Receiver:</strong>
									<span>{selectedEvent.receiver.name}</span>
								</div>
							{/if}
							{#if selectedEvent.inScopeOf}
								<div class="detail-item">
									<strong>In Scope Of:</strong>
									<span>{selectedEvent.inScopeOf.name}</span>
								</div>
							{/if}
						</div>
					</div>

					{#if selectedEvent.resourceInventoriedAs}
						<div class="detail-section">
							<h3>Resource Information</h3>
							<div class="detail-grid">
								<div class="detail-item">
									<strong>Resource:</strong>
									<span>{selectedEvent.resourceInventoriedAs.name}</span>
								</div>
								{#if selectedEvent.resourceInventoriedAs.conformsTo}
									<div class="detail-item">
										<strong>Resource Type:</strong>
										<span>{selectedEvent.resourceInventoriedAs.conformsTo.name}</span>
									</div>
								{/if}
							</div>
						</div>
					{/if}

					{#if selectedEvent.resourceQuantity || selectedEvent.effortQuantity}
						<div class="detail-section">
							<h3>Quantities</h3>
							<div class="detail-grid">
								{#if selectedEvent.resourceQuantity}
									<div class="detail-item">
										<strong>Resource Quantity:</strong>
										<span
											>{selectedEvent.resourceQuantity.hasNumericalValue}
											{getUnitLabel(selectedEvent.resourceQuantity.hasUnit.id)}</span
										>
									</div>
								{/if}
								{#if selectedEvent.effortQuantity}
									<div class="detail-item">
										<strong>Effort Quantity:</strong>
										<span
											>{selectedEvent.effortQuantity.hasNumericalValue}
											{getUnitLabel(selectedEvent.effortQuantity.hasUnit.id)}</span
										>
									</div>
								{/if}
							</div>
						</div>
					{/if}

					<div class="detail-actions">
						<button
							class="btn btn-danger"
							onclick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
						>
							Delete Event
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<div class="events-content">
		{#if economicEventsStore.loading}
			<div class="loading">Loading events...</div>
		{:else if economicEventsStore.error}
			<div class="error">
				<p>Error: {economicEventsStore.error}</p>
			</div>
		{:else if economicEventsStore.events.length === 0}
			<div class="empty-state">
				<h2>No Events Yet</h2>
				<p>Create your first economic event to get started.</p>
				<button class="btn btn-primary" onclick={() => (showCreateForm = true)}>
					Create Event
				</button>
			</div>
		{:else}
			<div class="events-grid">
				{#each economicEventsStore.events as event}
					<div
						class="event-card"
						role="button"
						tabindex="0"
						onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleEventClick(event)}
						onclick={() => handleEventClick(event)}
					>
						<div class="event-header">
							<h3>{getActionLabel(event.action.id)}</h3>
							<span class="event-date">{formatDateTime(event.hasPointInTime || '')}</span>
						</div>

						<div class="event-body">
							{#if event.provider || event.receiver}
								<div class="event-participants">
									{#if event.provider}
										<span class="participant">👤 {event.provider.name}</span>
									{/if}
									{#if event.provider && event.receiver}
										<span class="arrow">→</span>
									{/if}
									{#if event.receiver}
										<span class="participant">👤 {event.receiver.name}</span>
									{/if}
								</div>
							{/if}

							{#if event.resourceInventoriedAs}
								<div class="event-resource">
									<span class="resource-name">📦 {event.resourceInventoriedAs.name}</span>
									{#if event.resourceQuantity}
										<span class="resource-quantity">
											{event.resourceQuantity.hasNumericalValue}
											{getUnitLabel(event.resourceQuantity.hasUnit.id)}
										</span>
									{/if}
								</div>
							{/if}

							{#if event.note}
								<div class="event-note">
									<p>{event.note}</p>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.events-page {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.page-header h1 {
		color: #2c3e50;
		margin-bottom: 0.5rem;
	}

	.description {
		color: #7f8c8d;
		font-size: 1.1rem;
		margin-bottom: 2rem;
	}

	.header-actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
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

	.btn-primary:hover {
		background: #2980b9;
	}

	.btn-danger {
		background: #e74c3c;
		color: white;
	}

	.btn-danger:hover {
		background: #c0392b;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		border-radius: 8px;
		max-width: 90vw;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
	}

	.close-button {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #999;
		z-index: 10;
	}

	.close-button:hover {
		color: #333;
	}

	.loading {
		text-align: center;
		padding: 3rem;
		color: #7f8c8d;
	}

	.error {
		background: #f8d7da;
		border: 1px solid #f5c6cb;
		border-radius: 4px;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.error p {
		color: #721c24;
		margin: 0;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #7f8c8d;
	}

	.empty-state h2 {
		color: #2c3e50;
		margin-bottom: 1rem;
	}

	.events-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.event-card {
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		padding: 1.5rem;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.event-card:hover {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	.event-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.event-header h3 {
		color: #2c3e50;
		margin: 0;
	}

	.event-date {
		color: #7f8c8d;
		font-size: 0.9rem;
	}

	.event-body {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.event-participants {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	.participant {
		color: #2c3e50;
	}

	.arrow {
		color: #7f8c8d;
	}

	.event-resource {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.9rem;
	}

	.resource-name {
		color: #2c3e50;
		font-weight: 600;
	}

	.resource-quantity {
		color: #7f8c8d;
	}

	.event-note {
		font-size: 0.9rem;
		color: #7f8c8d;
		font-style: italic;
	}

	.event-note p {
		margin: 0;
	}

	.event-detail {
		padding: 2rem;
		max-width: 600px;
	}

	.event-detail h2 {
		color: #2c3e50;
		margin-bottom: 2rem;
		text-align: center;
	}

	.detail-section {
		margin-bottom: 2rem;
	}

	.detail-section h3 {
		color: #2c3e50;
		margin-bottom: 1rem;
		border-bottom: 2px solid #3498db;
		padding-bottom: 0.5rem;
	}

	.detail-grid {
		display: grid;
		gap: 1rem;
	}

	.detail-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid #f0f0f0;
	}

	.detail-item strong {
		color: #2c3e50;
		min-width: 120px;
	}

	.detail-item span {
		color: #7f8c8d;
		text-align: right;
	}

	.detail-actions {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid #f0f0f0;
		text-align: center;
	}

	@media (max-width: 768px) {
		.events-page {
			padding: 1rem;
		}

		.events-grid {
			grid-template-columns: 1fr;
		}

		.event-participants {
			flex-direction: column;
			align-items: flex-start;
		}

		.event-resource {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
