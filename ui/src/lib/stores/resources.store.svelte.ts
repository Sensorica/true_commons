import { gql } from '@apollo/client/core';
import hreaService from '../services/hrea.service.svelte';
import type {
	EconomicResource,
	ResourceSpecification,
	GetEconomicResourcesResponse,
	GetResourceSpecificationsResponse,
	CreateResourceSpecificationResponse,
	UpdateResourceSpecificationResponse,
	DeleteResourceSpecificationResponse
} from '../graphql/types';
import { GET_ECONOMIC_RESOURCES, GET_RESOURCE_SPECIFICATIONS } from '../graphql/queries';
import {
	UPDATE_ECONOMIC_RESOURCE,
	CREATE_ECONOMIC_EVENT,
	CREATE_RESOURCE_SPECIFICATION,
	UPDATE_RESOURCE_SPECIFICATION,
	DELETE_RESOURCE_SPECIFICATION
} from '../graphql/mutations';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ResourcesStore {
	readonly resources: EconomicResource[];
	readonly resourceSpecifications: ResourceSpecification[];
	readonly loading: boolean;
	readonly error: string | null;

	// Resource methods
	fetchAllResources(): Promise<void>;
	createResource(resource: Partial<EconomicResource>): Promise<EconomicResource>;
	updateResource(id: string, resource: Partial<EconomicResource>): Promise<EconomicResource>;
	deleteResource(id: string): Promise<void>;

	// Resource Specification methods
	fetchAllResourceSpecifications(): Promise<void>;
	createResourceSpecification(spec: Partial<ResourceSpecification>): Promise<ResourceSpecification>;
	updateResourceSpecification(
		id: string,
		spec: Partial<ResourceSpecification>
	): Promise<ResourceSpecification>;
	deleteResourceSpecification(id: string): Promise<void>;

	// Helper methods
	createResourceFromSpec(
		resourceData: Partial<EconomicResource>,
		specId: string
	): Promise<EconomicResource>;
	searchResourcesByTag(tag: string): EconomicResource[];
	getResourcesByType(type: string): EconomicResource[];
	getResourceById(id: string): EconomicResource | null;
	getResourceSpecificationById(id: string): ResourceSpecification | null;

	// Testing helpers
	addMockResource(resource: EconomicResource): void;
	clearMockResources(): void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a resource specification mapping from resource data
 */
const createResourceSpecFromResourceData = (
	resourceData: Partial<EconomicResource>
): { name: string; note?: string } => {
	const name = resourceData.name || 'Unknown Resource Type';
	const note = `Resource specification for: ${name}`;
	return { name, note };
};

/**
 * Creates an economic event for resource creation following hREA patterns
 */
const createResourceCreationEvent = (
	agentId: string,
	resourceSpecId: string,
	resourceData: Partial<EconomicResource>
): Record<string, unknown> => {
	return {
		action: 'produce',
		provider: agentId,
		receiver: agentId, // Required field - set to same agent for self-creation
		resourceConformsTo: resourceSpecId,
		resourceQuantity: {
			hasNumericalValue: 1,
			hasUnit: 'one' // Must be string ID, not object
		},
		hasPointInTime: new Date().toISOString(),
		note: `Created resource: ${resourceData.name}`
	};
};

/**
 * Helper to handle loading state consistently
 */
const withLoadingState = <T>(
	operation: () => Promise<T>,
	setLoading: (loading: boolean) => void,
	setError: (error: string | null) => void
): Promise<T> => {
	setLoading(true);
	setError(null);

	return operation()
		.then((result) => {
			setLoading(false);
			return result;
		})
		.catch((error) => {
			setLoading(false);
			setError(String(error));
			throw error;
		});
};

// Convert string queries to gql documents
const GET_ALL_RESOURCES = gql`
	${GET_ECONOMIC_RESOURCES}
`;

const GET_ALL_RESOURCE_SPECIFICATIONS = gql`
	${GET_RESOURCE_SPECIFICATIONS}
`;

const CREATE_RESOURCE_SPECIFICATION_MUTATION = gql`
	${CREATE_RESOURCE_SPECIFICATION}
`;

const UPDATE_RESOURCE_SPECIFICATION_MUTATION = gql`
	${UPDATE_RESOURCE_SPECIFICATION}
`;

const DELETE_RESOURCE_SPECIFICATION_MUTATION = gql`
	${DELETE_RESOURCE_SPECIFICATION}
`;

const UPDATE_RESOURCE_MUTATION = gql`
	${UPDATE_ECONOMIC_RESOURCE}
`;

const CREATE_EVENT_MUTATION = gql`
	${CREATE_ECONOMIC_EVENT}
`;

const DELETE_RESOURCE_MUTATION = gql`
	mutation DeleteEconomicResource($id: ID!) {
		deleteEconomicResource(id: $id)
	}
`;

// ============================================================================
// STORE FACTORY FUNCTION
// ============================================================================

/**
 * Creates a resources store that manages both economic resources and resource specifications.
 * Uses the hREA service to perform GraphQL operations with proper ResourceSpecification flow.
 */
function createResourcesStore(): ResourcesStore {
	// State
	let resources: EconomicResource[] = $state([]);
	let resourceSpecifications: ResourceSpecification[] = $state([]);
	let loading: boolean = $state(false);
	let error: string | null = $state(null);

	const setLoading = (value: boolean) => {
		loading = value;
	};
	const setError = (value: string | null) => {
		error = value;
	};

	// ========================================================================
	// RESOURCE METHODS
	// ========================================================================

	/**
	 * Fetches all economic resources from the hREA system.
	 */
	async function fetchAllResources(): Promise<void> {
		if (loading) return;

		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				const result = await hreaService.apolloClient.query<GetEconomicResourcesResponse>({
					query: GET_ALL_RESOURCES,
					fetchPolicy: 'cache-first'
				});

				resources = (result.data.economicResources?.edges || []).map((edge) => edge.node);
				console.log(`Fetched ${resources.length} economic resources`);
			},
			setLoading,
			setError
		);
	}

	/**
	 * Creates a new economic resource using the proper hREA flow:
	 * 1. Create or find ResourceSpecification
	 * 2. Create economic event with resourceConformsTo
	 * 3. Extract created resource from event
	 */
	async function createResource(
		resourceData: Partial<EconomicResource>
	): Promise<EconomicResource> {
		// First, create or find a ResourceSpecification
		const specData = createResourceSpecFromResourceData(resourceData);

		// Check if we already have a similar ResourceSpecification
		let existingSpec = resourceSpecifications.find((spec) => spec.name === specData.name);

		if (!existingSpec) {
			console.log('Creating new ResourceSpecification for resource:', specData.name);
			existingSpec = await createResourceSpecification(specData);
		} else {
			console.log('Using existing ResourceSpecification:', existingSpec.name);
		}

		// Now create the resource using the ResourceSpecification
		return createResourceFromSpec(resourceData, existingSpec.id);
	}

	/**
	 * Creates a new economic resource from an existing ResourceSpecification.
	 */
	async function createResourceFromSpec(
		resourceData: Partial<EconomicResource>,
		specId: string
	): Promise<EconomicResource> {
		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				console.log('Creating resource from specification with data:', resourceData);

				// Get current agent
				const agentsStore = await import('./agents.store.svelte');
				const currentAgent = agentsStore.default.myAgent;
				if (!currentAgent) {
					throw new Error('No authenticated agent found');
				}

				// Create economic event with proper resourceConformsTo
				const produceEvent = createResourceCreationEvent(currentAgent.id, specId, resourceData);

				console.log('Sending produce event with ResourceSpecification:', produceEvent);

				let eventResult;
				try {
					eventResult = await hreaService.apolloClient.mutate({
						mutation: CREATE_EVENT_MUTATION,
						variables: {
							event: produceEvent
						}
					});
				} catch (mutationError: unknown) {
					console.error('GraphQL mutation failed with error:', mutationError);

					// Type guard to safely access error properties
					if (mutationError instanceof Error) {
						console.error('Error details:', {
							name: mutationError.name,
							message: mutationError.message,
							stack: mutationError.stack
						});
					}

					// Check if it's an Apollo error with GraphQL details
					if (
						mutationError &&
						typeof mutationError === 'object' &&
						'graphQLErrors' in mutationError
					) {
						const apolloError = mutationError as {
							graphQLErrors?: Array<{
								message: string;
								locations?: unknown;
								path?: unknown;
								extensions?: unknown;
							}>;
							networkError?: unknown;
						};
						console.error('Apollo error details:', {
							graphQLErrors: apolloError.graphQLErrors,
							networkError: apolloError.networkError
						});

						// Log individual GraphQL errors
						if (apolloError.graphQLErrors && Array.isArray(apolloError.graphQLErrors)) {
							apolloError.graphQLErrors.forEach(
								(
									error: {
										message: string;
										locations?: unknown;
										path?: unknown;
										extensions?: unknown;
									},
									index: number
								) => {
									console.error(`GraphQL Error ${index + 1}:`, {
										message: error.message,
										locations: error.locations,
										path: error.path,
										extensions: error.extensions
									});
								}
							);
						}
					}

					throw mutationError;
				}

				// Process the response
				const createdEvent = eventResult.data?.createEconomicEvent?.economicEvent;
				console.log('Economic event created successfully:', createdEvent);

				// Extract the created resource from the event
				const createdResource = createdEvent?.resourceInventoriedAs;
				if (!createdResource) {
					throw new Error('No resource was created by the economic event');
				}

				console.log('Base resource created successfully:', createdResource);

				// If we need to update additional properties, do it now
				let finalResource = createdResource;
				if (resourceData.name && resourceData.name !== createdResource.name) {
					console.log('Updating resource with additional properties:', resourceData);

					const updateResult = await hreaService.apolloClient.mutate({
						mutation: UPDATE_RESOURCE_MUTATION,
						variables: {
							resource: {
								id: createdResource.id,
								name: resourceData.name,
								note: resourceData.note,
								...(resourceData.trackingIdentifier && {
									trackingIdentifier: resourceData.trackingIdentifier
								})
							}
						}
					});

					finalResource =
						updateResult.data?.updateEconomicResource?.economicResource || createdResource;
					console.log('Resource updated successfully:', finalResource);
				}

				// Add to local store
				resources = [...resources, finalResource];

				return finalResource;
			},
			setLoading,
			setError
		);
	}

	/**
	 * Updates an existing economic resource.
	 */
	async function updateResource(
		id: string,
		resourceData: Partial<EconomicResource>
	): Promise<EconomicResource> {
		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				const result = await hreaService.apolloClient.mutate({
					mutation: UPDATE_RESOURCE_MUTATION,
					variables: {
						resource: {
							id,
							...resourceData
						}
					}
				});

				const updatedResource = result.data?.updateEconomicResource?.economicResource;
				if (!updatedResource) {
					throw new Error('Failed to update resource: No resource returned');
				}

				// Update in local store
				const index = resources.findIndex((r) => r.id === id);
				if (index !== -1) {
					resources[index] = updatedResource;
				}

				return updatedResource;
			},
			setLoading,
			setError
		);
	}

	/**
	 * Deletes an economic resource.
	 */
	async function deleteResource(id: string): Promise<void> {
		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				await hreaService.apolloClient.mutate({
					mutation: DELETE_RESOURCE_MUTATION,
					variables: { id }
				});

				// Remove from local store
				resources = resources.filter((r) => r.id !== id);
			},
			setLoading,
			setError
		);
	}

	// ========================================================================
	// RESOURCE SPECIFICATION METHODS
	// ========================================================================

	/**
	 * Fetches all resource specifications from the hREA system.
	 */
	async function fetchAllResourceSpecifications(): Promise<void> {
		if (loading) return;

		return withLoadingState(
			async () => {
				try {
					if (!hreaService.isInitialized) {
						await hreaService.initialize();
					}

					if (!hreaService.apolloClient) {
						throw new Error('Apollo client is not available');
					}

					const result = await hreaService.apolloClient.query<GetResourceSpecificationsResponse>({
						query: GET_ALL_RESOURCE_SPECIFICATIONS,
						fetchPolicy: 'cache-first'
					});

					// Defensive handling of GraphQL query result
					if (result.data && result.data.resourceSpecifications) {
						if (result.data.resourceSpecifications.edges) {
							resourceSpecifications = result.data.resourceSpecifications.edges.map(edge => edge.node);
						} else if (Array.isArray(result.data.resourceSpecifications)) {
							resourceSpecifications = result.data.resourceSpecifications;
						} else {
							resourceSpecifications = [];
						}
					} else {
						// If no resource specifications found, initialize as empty array
						resourceSpecifications = [];
						console.warn('No resource specifications found in GraphQL response, initializing empty array');
					}

					console.log(`Fetched ${resourceSpecifications.length} resource specifications`);
				} catch (err) {
					console.error('Failed to fetch resource specifications from GraphQL:', err);
					// On GraphQL failure, initialize empty array to prevent .map() errors
					resourceSpecifications = [];
					// Re-throw to trigger error handling
					throw err;
				}
			},
			setLoading,
			setError
		);
	}

	/**
	 * Creates a new resource specification.
	 */
	async function createResourceSpecification(
		specData: Partial<ResourceSpecification>
	): Promise<ResourceSpecification> {
		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				console.log('Creating resource specification:', specData);

				const result = await hreaService.apolloClient.mutate<CreateResourceSpecificationResponse>({
					mutation: CREATE_RESOURCE_SPECIFICATION_MUTATION,
					variables: {
						resourceSpecification: {
							name: specData.name,
							note: specData.note
						}
					}
				});

				const newResourceSpec = result.data?.createResourceSpecification?.resourceSpecification;
				if (!newResourceSpec) {
					throw new Error('Failed to create resource specification: No specification returned');
				}

				console.log('Resource specification created successfully:', newResourceSpec);

				// Add to local store
				resourceSpecifications = [...resourceSpecifications, newResourceSpec];

				return newResourceSpec;
			},
			setLoading,
			setError
		);
	}

	/**
	 * Updates an existing resource specification.
	 */
	async function updateResourceSpecification(
		id: string,
		specData: Partial<ResourceSpecification>
	): Promise<ResourceSpecification> {
		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				const result = await hreaService.apolloClient.mutate<UpdateResourceSpecificationResponse>({
					mutation: UPDATE_RESOURCE_SPECIFICATION_MUTATION,
					variables: {
						id,
						resourceSpecification: {
							name: specData.name,
							note: specData.note
						}
					}
				});

				const updatedResourceSpec = result.data?.updateResourceSpecification?.resourceSpecification;
				if (!updatedResourceSpec) {
					throw new Error('Failed to update resource specification: No specification returned');
				}

				// Update in local store
				const index = resourceSpecifications.findIndex((spec) => spec.id === id);
				if (index !== -1) {
					resourceSpecifications[index] = updatedResourceSpec;
				}

				return updatedResourceSpec;
			},
			setLoading,
			setError
		);
	}

	/**
	 * Deletes a resource specification.
	 */
	async function deleteResourceSpecification(id: string): Promise<void> {
		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				await hreaService.apolloClient.mutate<DeleteResourceSpecificationResponse>({
					mutation: DELETE_RESOURCE_SPECIFICATION_MUTATION,
					variables: { id }
				});

				// Remove from local store
				resourceSpecifications = resourceSpecifications.filter((spec) => spec.id !== id);
			},
			setLoading,
			setError
		);
	}

	// ========================================================================
	// HELPER METHODS
	// ========================================================================

	function searchResourcesByTag(tag: string): EconomicResource[] {
		return resources.filter(
			(resource) =>
				resource.name?.toLowerCase().includes(tag.toLowerCase()) ||
				resource.note?.toLowerCase().includes(tag.toLowerCase())
		);
	}

	function getResourcesByType(type: string): EconomicResource[] {
		return resources.filter((resource) => resource.conformsTo?.name === type);
	}

	function getResourceById(id: string): EconomicResource | null {
		return resources.find(resource => resource.id === id) || null;
	}

	function getResourceSpecificationById(id: string): ResourceSpecification | null {
		return resourceSpecifications.find(spec => spec.id === id) || null;
	}

	function addMockResource(resource: EconomicResource): void {
		resources = [...resources, resource];
	}

	function clearMockResources(): void {
		resources = [];
	}

	/**
	 * Gets resources by agent ID (resources where the agent is the provider/owner)
	 */
	function getResourcesByAgent(agentId: string): EconomicResource[] {
		return resources.filter(resource =>
			resource.providedBy?.id === agentId ||
			resource.custodian?.id === agentId
		);
	}

	/**
	 * Gets resources by agent ID with additional filtering
	 */
	function getResourcesByAgentWithFilter(agentId: string, options: {
		includeProvided?: boolean;
		includeCustodian?: boolean;
		resourceSpecificationId?: string;
	} = {}): EconomicResource[] {
		const { includeProvided = true, includeCustodian = true, resourceSpecificationId } = options;

		return resources.filter(resource => {
			// Agent filter
			const isProvider = includeProvided && resource.providedBy?.id === agentId;
			const isCustodian = includeCustodian && resource.custodian?.id === agentId;

			if (!isProvider && !isCustodian) {
				return false;
			}

			// Resource specification filter
			if (resourceSpecificationId && resource.conformsTo?.id !== resourceSpecificationId) {
				return false;
			}

			return true;
		});
	}

	/**
	 * Gets resource statistics for an agent
	 */
	function getResourceStatsByAgent(agentId: string) {
		const agentResources = getResourcesByAgent(agentId);

		return {
			total: agentResources.length,
			provided: agentResources.filter(r => r.providedBy?.id === agentId).length,
			custodian: agentResources.filter(r => r.custodian?.id === agentId).length,
			bySpecification: agentResources.reduce((acc, resource) => {
				const specId = resource.conformsTo?.id || 'unknown';
				acc[specId] = (acc[specId] || 0) + 1;
				return acc;
			}, {} as Record<string, number>)
		};
	}

	// ========================================================================
	// STORE INTERFACE RETURN
	// ========================================================================

	return {
		get resources() {
			return resources;
		},
		get resourceSpecifications() {
			return resourceSpecifications;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},

		// Resource methods
		fetchAllResources,
		createResource,
		updateResource,
		deleteResource,

		// Resource Specification methods
		fetchAllResourceSpecifications,
		createResourceSpecification,
		updateResourceSpecification,
		deleteResourceSpecification,

		// Helper methods
		createResourceFromSpec,
		searchResourcesByTag,
		getResourcesByType,
		getResourceById,
		getResourceSpecificationById,
		addMockResource,
		clearMockResources,
		getResourcesByAgent,
		getResourcesByAgentWithFilter,
		getResourceStatsByAgent
	};
}

// ============================================================================
// STORE INSTANCE CREATION
// ============================================================================

const resourcesStore = createResourcesStore();
export default resourcesStore;
