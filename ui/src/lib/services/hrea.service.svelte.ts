import { ApolloClient, InMemoryCache, type NormalizedCacheObject } from '@apollo/client/core';
import { SchemaLink } from '@apollo/client/link/schema';
import { createHolochainSchema } from '@valueflows/vf-graphql-holochain';
import holochainClientService from './holochain_client_service.svelte';

export interface HREAService {
	readonly apolloClient: ApolloClient<NormalizedCacheObject> | null;
	readonly isInitialized: boolean;
	readonly initializationError: string | null;
	initialize(): Promise<void>;
}

/**
 * Creates an hREA service that manages the Apollo Client with the hREA GraphQL schema.
 * This service bridges the Holochain connection with GraphQL operations using
 * the @valueflows/vf-graphql-holochain library.
 *
 * @returns An object with methods to interact with the hREA GraphQL schema
 */
function createHREAService(): HREAService {
	// State
	let apolloClient: ApolloClient<NormalizedCacheObject> | null = $state(null);
	let isInitialized: boolean = $state(false);
	let isConnecting: boolean = $state(false);
	let initializationPromise: Promise<void> | null = null;
	let initializationError: string | null = $state(null);

	/**
	 * Initializes the Apollo Client with the hREA GraphQL schema.
	 * Requires an active Holochain connection.
	 */
	async function initialize(): Promise<void> {
		// If we are already initialized, no need to do anything
		if (isInitialized || apolloClient) {
			return;
		}

		// If a connection attempt is in progress, wait for it to complete
		if (isConnecting && initializationPromise) {
			return initializationPromise;
		}

		// Start a new connection attempt
		isConnecting = true;
		initializationError = null;

		initializationPromise = (async () => {
			try {
				console.log('🔗 Initializing hREA service...');

				// Ensure Holochain client is connected
				if (!holochainClientService.isConnected) {
					console.log('🔌 Connecting to Holochain client...');
					await holochainClientService.connectClient();
				}

				if (!holochainClientService.client) {
					console.error('❌ Holochain client is still not available after connection attempt');
					throw new Error('Holochain client is not available');
				}

				console.log('✅ Holochain client is available, creating GraphQL schema...');

				// Create the hREA GraphQL schema using the Holochain connection
				const schema = createHolochainSchema({
					appWebSocket: holochainClientService.client,
					roleName: 'hrea'
				});

				console.log('✅ GraphQL schema created, setting up Apollo Client...');

				// Create Apollo Client with the Holochain schema
				apolloClient = new ApolloClient({
					cache: new InMemoryCache({
						// Configure cache for hREA entities
						typePolicies: {
							Agent: {
								keyFields: ['id']
							},
							EconomicResource: {
								keyFields: ['id']
							},
							EconomicEvent: {
								keyFields: ['id']
							},
							ResourceSpecification: {
								keyFields: ['id']
							},
							Intent: {
								keyFields: ['id']
							},
							Proposal: {
								keyFields: ['id']
							},
							Unit: {
								keyFields: ['id']
							},
							Action: {
								keyFields: ['id']
							}
						}
					}),
					link: new SchemaLink({ schema }),
					defaultOptions: {
						query: {
							fetchPolicy: 'cache-first'
						},
						mutate: {
							fetchPolicy: 'no-cache'
						}
					}
				});

				isInitialized = true;
				console.log('✅ hREA service initialized successfully with GraphQL schema');
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown initialization error';
				initializationError = `Failed to initialize hREA service: ${errorMessage}`;
				console.error('❌ hREA service initialization failed:', initializationError, error);
				apolloClient = null;
				isInitialized = false;
				throw error;
			} finally {
				isConnecting = false;
				initializationPromise = null;
			}
		})();

		return initializationPromise;
	}

	return {
		// Getters
		get apolloClient() {
			return apolloClient;
		},
		get isInitialized() {
			return isInitialized;
		},
		get initializationError() {
			return initializationError;
		},

		// Methods
		initialize
	};
}

const hreaService = createHREAService();
export default hreaService;
