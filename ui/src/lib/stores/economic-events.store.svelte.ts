import { gql } from '@apollo/client/core';
import hreaService from '../services/hrea.service.svelte';
import foundationService from '../services/foundation.service.svelte';
import unitsStore from './units.store.svelte';
import actionsStore from './actions.store.svelte';
import agentsStore from './agents.store.svelte';
import resourcesStore from './resources.store.svelte';
import type {
	EconomicEvent,
	EconomicEventCreateParams,
	EconomicEventUpdateParams,
	GetEconomicEventsResponse,
	CreateEconomicEventResponse,
	UpdateEconomicEventResponse,
	DeleteEconomicEventResponse
} from '../graphql/types';
import { GET_ECONOMIC_EVENTS } from '../graphql/queries';
import { CREATE_ECONOMIC_EVENT } from '../graphql/mutations';

export interface EconomicEventsStore {
	readonly events: EconomicEvent[];
	readonly loading: boolean;
	readonly error: string | null;
	fetchAllEvents(): Promise<void>;
	createEvent(event: EconomicEventCreateParams): Promise<EconomicEvent>;
	updateEvent(id: string, event: EconomicEventUpdateParams): Promise<EconomicEvent>;
	deleteEvent(id: string): Promise<void>;
	validateEventData(event: EconomicEventCreateParams): Promise<string[]>;
	getEventsByResource(resourceId: string): EconomicEvent[];
	getEventsByAgent(agentId: string): EconomicEvent[];
	getEventsByAction(actionId: string): EconomicEvent[];
}

// Convert string queries to gql documents
const GET_ALL_EVENTS = gql`
	${GET_ECONOMIC_EVENTS}
`;

const CREATE_EVENT_MUTATION = gql`
	${CREATE_ECONOMIC_EVENT}
`;

const UPDATE_EVENT_MUTATION = gql`
	mutation UpdateEconomicEvent($id: ID!, $event: EconomicEventUpdateParams!) {
		updateEconomicEvent(id: $id, event: $event) {
			economicEvent {
				id
				action {
					id
					label
					resourceEffect
				}
				provider {
					id
					name
				}
				receiver {
					id
					name
				}
				resourceInventoriedAs {
					id
					name
				}
				resourceQuantity {
					hasNumericalValue
					hasUnit {
						id
						label
						symbol
					}
				}
				effortQuantity {
					hasNumericalValue
					hasUnit {
						id
						label
						symbol
					}
				}
				hasPointInTime
				hasBeginning
				hasEnd
				note
				inScopeOf {
					id
					name
				}
			}
		}
	}
`;

const DELETE_EVENT_MUTATION = gql`
	mutation DeleteEconomicEvent($id: ID!) {
		deleteEconomicEvent(id: $id)
	}
`;

/**
 * Creates an economic events store that manages event-related state and operations.
 * Uses the hREA service to perform GraphQL operations with proper foundation validation.
 *
 * @returns An object with event state and methods
 */
function createEconomicEventsStore(): EconomicEventsStore {
	// State
	let events: EconomicEvent[] = $state([]);
	let loading: boolean = $state(false);
	let error: string | null = $state(null);

	/**
	 * Utility function to handle loading state and errors
	 */
	async function withLoadingState<T>(
		operation: () => Promise<T>,
		setLoading: (value: boolean) => void,
		setError: (value: string | null) => void
	): Promise<T> {
		if (loading) {
			throw new Error('Another operation is in progress');
		}

		setLoading(true);
		setError(null);

		try {
			return await operation();
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			setError(`Operation failed: ${errorMessage}`);
			console.error('Economic events store operation failed:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	}

	/**
	 * Validates event data to ensure all required foundation components exist
	 */
	async function validateEventData(event: EconomicEventCreateParams): Promise<string[]> {
		const errors: string[] = [];

		// Check foundation requirements
		if (!foundationService.isInitialized) {
			try {
				await foundationService.initialize();
			} catch (err) {
				errors.push('Foundation service initialization failed');
				return errors;
			}
		}

		const foundationStatus = await foundationService.checkFoundationRequirements();
		if (!foundationStatus.allReady) {
			errors.push('Foundation components not ready. Please initialize foundation components first.');
			return errors;
		}

		// Validate Action exists
		if (!actionsStore.getActionById(event.action)) {
			errors.push(`Action "${event.action}" not found. Available actions: ${actionsStore.actions.map(a => a.id).join(', ')}`);
		}

		// Validate Provider Agent exists (if provided)
		if (event.provider && !agentsStore.getAgentById(event.provider)) {
			errors.push(`Provider agent "${event.provider}" not found`);
		}

		// Validate Receiver Agent exists (if provided)
		if (event.receiver && !agentsStore.getAgentById(event.receiver)) {
			errors.push(`Receiver agent "${event.receiver}" not found`);
		}

		// Validate Resource exists (if provided)
		if (event.resourceInventoriedAs && !resourcesStore.getResourceById(event.resourceInventoriedAs)) {
			errors.push(`Resource "${event.resourceInventoriedAs}" not found`);
		}

		// Validate ResourceSpecification exists (if provided)
		if (event.resourceConformsTo && !resourcesStore.getResourceSpecificationById(event.resourceConformsTo)) {
			errors.push(`Resource specification "${event.resourceConformsTo}" not found`);
		}

		// Validate Units in quantities (if provided)
		if (event.resourceQuantity?.hasUnit && !unitsStore.getUnitById(event.resourceQuantity.hasUnit)) {
			errors.push(`Unit "${event.resourceQuantity.hasUnit}" not found for resource quantity`);
		}

		if (event.effortQuantity?.hasUnit && !unitsStore.getUnitById(event.effortQuantity.hasUnit)) {
			errors.push(`Unit "${event.effortQuantity.hasUnit}" not found for effort quantity`);
		}

		// Validate In Scope Of Agent exists (if provided)
		if (event.inScopeOf && !agentsStore.getAgentById(event.inScopeOf)) {
			errors.push(`Scope agent "${event.inScopeOf}" not found`);
		}

		return errors;
	}

	/**
	 * Fetches all economic events from the hREA system.
	 */
	async function fetchAllEvents(): Promise<void> {
		if (loading) return;

		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				const result = await hreaService.apolloClient.query<GetEconomicEventsResponse>({
					query: GET_ALL_EVENTS,
					fetchPolicy: 'cache-first'
				});

				events = (result.data.economicEvents?.edges || []).map((edge) => edge.node);
				console.log(`Fetched ${events.length} economic events`);
			},
			(value) => (loading = value),
			(value) => (error = value)
		);
	}

	/**
	 * Creates a new economic event in the hREA system with proper validation.
	 */
	async function createEvent(eventData: EconomicEventCreateParams): Promise<EconomicEvent> {
		return withLoadingState(
			async () => {
				// Validate event data first
				const validationErrors = await validateEventData(eventData);
				if (validationErrors.length > 0) {
					throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
				}

				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				const result = await hreaService.apolloClient.mutate<CreateEconomicEventResponse>({
					mutation: CREATE_EVENT_MUTATION,
					variables: {
						event: eventData
					}
				});

				const newEvent = result.data?.createEconomicEvent.economicEvent;
				if (!newEvent) {
					throw new Error('Failed to create economic event - no data returned');
				}

				events = [...events, newEvent];
				console.log('Created new economic event:', newEvent.id);

				return newEvent;
			},
			(value) => (loading = value),
			(value) => (error = value)
		);
	}

	/**
	 * Updates an existing economic event in the hREA system.
	 */
	async function updateEvent(id: string, eventData: EconomicEventUpdateParams): Promise<EconomicEvent> {
		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				const result = await hreaService.apolloClient.mutate<UpdateEconomicEventResponse>({
					mutation: UPDATE_EVENT_MUTATION,
					variables: {
						id,
						event: eventData
					}
				});

				const updatedEvent = result.data?.updateEconomicEvent.economicEvent;
				if (!updatedEvent) {
					throw new Error('Failed to update economic event - no data returned');
				}

				// Update in local store
				const index = events.findIndex((e) => e.id === id);
				if (index !== -1) {
					events[index] = updatedEvent;
				}

				console.log('Updated economic event:', id);
				return updatedEvent;
			},
			(value) => (loading = value),
			(value) => (error = value)
		);
	}

	/**
	 * Deletes an economic event from the hREA system.
	 */
	async function deleteEvent(id: string): Promise<void> {
		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				await hreaService.apolloClient.mutate<DeleteEconomicEventResponse>({
					mutation: DELETE_EVENT_MUTATION,
					variables: { id }
				});

				// Remove from local store
				events = events.filter((e) => e.id !== id);
				console.log('Deleted economic event:', id);
			},
			(value) => (loading = value),
			(value) => (error = value)
		);
	}

	/**
	 * Gets events related to a specific resource
	 */
	function getEventsByResource(resourceId: string): EconomicEvent[] {
		return events.filter(event => event.resourceInventoriedAs?.id === resourceId);
	}

	/**
	 * Gets economic events by agent ID (where agent is provider or receiver)
	 */
	function getEventsByAgent(agentId: string): EconomicEvent[] {
		return events.filter(event =>
			event.provider?.id === agentId ||
			event.receiver?.id === agentId
		);
	}

	/**
	 * Gets economic events by agent ID with additional filtering
	 */
	function getEventsByAgentWithFilter(agentId: string, options: {
		includeProvided?: boolean;
		includeReceived?: boolean;
		actionId?: string;
		resourceId?: string;
		fromDate?: string;
		toDate?: string;
	} = {}): EconomicEvent[] {
		const { includeProvided = true, includeReceived = true, actionId, resourceId, fromDate, toDate } = options;

		return events.filter(event => {
			// Agent filter
			const isProvider = includeProvided && event.provider?.id === agentId;
			const isReceiver = includeReceived && event.receiver?.id === agentId;

			if (!isProvider && !isReceiver) {
				return false;
			}

			// Action filter
			if (actionId && event.action?.id !== actionId) {
				return false;
			}

			// Resource filter
			if (resourceId && event.resourceInventoriedAs?.id !== resourceId) {
				return false;
			}

			// Date filters
			const eventDate = event.hasPointInTime || event.hasBeginning;
			if (fromDate && eventDate && eventDate < fromDate) {
				return false;
			}
			if (toDate && eventDate && eventDate > toDate) {
				return false;
			}

			return true;
		});
	}

	/**
	 * Gets economic event statistics for an agent
	 */
	function getEventStatsByAgent(agentId: string) {
		const agentEvents = getEventsByAgent(agentId);

		return {
			total: agentEvents.length,
			provided: agentEvents.filter(e => e.provider?.id === agentId).length,
			received: agentEvents.filter(e => e.receiver?.id === agentId).length,
			byAction: agentEvents.reduce((acc, event) => {
				const actionId = event.action?.id || 'unknown';
				acc[actionId] = (acc[actionId] || 0) + 1;
				return acc;
			}, {} as Record<string, number>),
			byResource: agentEvents.reduce((acc, event) => {
				const resourceId = event.resourceInventoriedAs?.id || 'unknown';
				acc[resourceId] = (acc[resourceId] || 0) + 1;
				return acc;
			}, {} as Record<string, number>)
		};
	}

	/**
	 * Gets events with a specific action
	 */
	function getEventsByAction(actionId: string): EconomicEvent[] {
		return events.filter(event => event.action.id === actionId);
	}

	return {
		// Getters
		get events() {
			return events;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},

		// Methods
		fetchAllEvents,
		createEvent,
		updateEvent,
		deleteEvent,
		validateEventData,
		getEventsByResource,
		getEventsByAgent,
		getEventsByAgentWithFilter,
		getEventStatsByAgent,
		getEventsByAction
	};
}

const economicEventsStore = createEconomicEventsStore();
export default economicEventsStore;
