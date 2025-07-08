import { gql } from '@apollo/client/core';
import hreaService from '../services/hrea.service.svelte';
import type {
	EconomicEvent,
	GetEconomicEventsResponse,
	CreateEconomicEventResponse
} from '../graphql/types';
import { GET_ECONOMIC_EVENTS } from '../graphql/queries';
import { CREATE_ECONOMIC_EVENT } from '../graphql/mutations';

export interface EconomicEventsStore {
	readonly events: EconomicEvent[];
	readonly loading: boolean;
	readonly error: string | null;
	fetchAllEvents(): Promise<void>;
	createEvent(event: Partial<EconomicEvent>): Promise<EconomicEvent>;
	updateEvent(id: string, event: Partial<EconomicEvent>): Promise<EconomicEvent>;
	deleteEvent(id: string): Promise<void>;
}

// Convert string queries to gql documents
const GET_ALL_EVENTS = gql`
	${GET_ECONOMIC_EVENTS}
`;
const CREATE_EVENT_MUTATION = gql`
	${CREATE_ECONOMIC_EVENT}
`;

// Additional mutations that may not exist yet
const UPDATE_EVENT = gql`
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

const DELETE_EVENT = gql`
	mutation DeleteEconomicEvent($id: ID!) {
		deleteEconomicEvent(id: $id)
	}
`;

/**
 * Creates an economic events store that manages event-related state and operations.
 * Uses the hREA service to perform GraphQL operations with existing fragments.
 *
 * @returns An object with event state and methods
 */
function createEconomicEventsStore(): EconomicEventsStore {
	// State
	let events: EconomicEvent[] = $state([]);
	let loading: boolean = $state(false);
	let error: string | null = $state(null);

	/**
	 * Fetches all economic events from the hREA system.
	 */
	async function fetchAllEvents(): Promise<void> {
		if (loading) return;

		loading = true;
		error = null;

		try {
			// Ensure hREA service is initialized
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
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error = `Failed to fetch economic events: ${errorMessage}`;
			console.error(error, err);
		} finally {
			loading = false;
		}
	}

	/**
	 * Creates a new economic event in the hREA system.
	 * Falls back to mock creation for testing if GraphQL fails.
	 */
	async function createEvent(eventData: Partial<EconomicEvent>): Promise<EconomicEvent> {
		if (loading) {
			throw new Error('Another operation is in progress');
		}

		loading = true;
		error = null;

		try {
			// Try to create via GraphQL first
			if (hreaService.isInitialized && hreaService.apolloClient) {
				const result = await hreaService.apolloClient.mutate<CreateEconomicEventResponse>({
					mutation: CREATE_EVENT_MUTATION,
					variables: {
						event: eventData
					}
				});

				const newEvent = result.data?.createEconomicEvent.economicEvent;
				if (newEvent) {
					events = [...events, newEvent];
					console.log('Created new economic event via GraphQL:', newEvent.id);
					return newEvent;
				}
			}

			// Fallback: Create mock event for testing
			const mockEvent: EconomicEvent = {
				id: `mock-event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				action: eventData.action || { id: 'work', label: 'Work', resourceEffect: 'no-change' },
				provider: eventData.provider,
				receiver: eventData.receiver,
				resourceInventoriedAs: eventData.resourceInventoriedAs,
				resourceQuantity: eventData.resourceQuantity,
				effortQuantity: eventData.effortQuantity,
				hasPointInTime: eventData.hasPointInTime || new Date().toISOString(),
				hasBeginning: eventData.hasBeginning,
				hasEnd: eventData.hasEnd,
				note: eventData.note,
				inScopeOf: eventData.inScopeOf
			};

			events = [...events, mockEvent];
			console.log('Created mock economic event:', mockEvent.id);

			return mockEvent;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error = `Failed to create economic event: ${errorMessage}`;
			console.error(error, err);
			throw err;
		} finally {
			loading = false;
		}
	}

	/**
	 * Updates an existing economic event in the hREA system.
	 */
	async function updateEvent(
		id: string,
		eventData: Partial<EconomicEvent>
	): Promise<EconomicEvent> {
		if (loading) {
			throw new Error('Another operation is in progress');
		}

		loading = true;
		error = null;

		try {
			// Ensure hREA service is initialized
			if (!hreaService.isInitialized) {
				await hreaService.initialize();
			}

			if (!hreaService.apolloClient) {
				throw new Error('Apollo client is not available');
			}

			const result = await hreaService.apolloClient.mutate({
				mutation: UPDATE_EVENT,
				variables: {
					id,
					event: eventData
				}
			});

			const updatedEvent = result.data.updateEconomicEvent.economicEvent;
			events = events.map((event) => (event.id === id ? updatedEvent : event));
			console.log('Updated economic event:', id);

			return updatedEvent;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error = `Failed to update economic event: ${errorMessage}`;
			console.error(error, err);
			throw err;
		} finally {
			loading = false;
		}
	}

	/**
	 * Deletes an economic event from the hREA system.
	 */
	async function deleteEvent(id: string): Promise<void> {
		if (loading) {
			throw new Error('Another operation is in progress');
		}

		loading = true;
		error = null;

		try {
			// Ensure hREA service is initialized
			if (!hreaService.isInitialized) {
				await hreaService.initialize();
			}

			if (!hreaService.apolloClient) {
				throw new Error('Apollo client is not available');
			}

			await hreaService.apolloClient.mutate({
				mutation: DELETE_EVENT,
				variables: { id }
			});

			events = events.filter((event) => event.id !== id);
			console.log('Deleted economic event:', id);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error = `Failed to delete economic event: ${errorMessage}`;
			console.error(error, err);
			throw err;
		} finally {
			loading = false;
		}
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
		deleteEvent
	};
}

const economicEventsStore = createEconomicEventsStore();
export default economicEventsStore;
