import { gql } from '@apollo/client/core';
import hreaService from '../services/hrea.service.svelte';
import type {
	EconomicResource,
	GetEconomicResourcesResponse,
	UpdateEconomicResourceResponse
} from '../graphql/types';
import { GET_ECONOMIC_RESOURCES } from '../graphql/queries';
import { UPDATE_ECONOMIC_RESOURCE } from '../graphql/mutations';

export interface EconomicResourcesStore {
	readonly resources: EconomicResource[];
	readonly loading: boolean;
	readonly error: string | null;
	fetchAllResources(): Promise<void>;
	createResource(resource: Partial<EconomicResource>): Promise<EconomicResource>;
	updateResource(id: string, resource: Partial<EconomicResource>): Promise<EconomicResource>;
	deleteResource(id: string): Promise<void>;
	// True Commons specific methods
	searchResourcesByTag(tag: string): EconomicResource[];
	getResourcesByType(type: string): EconomicResource[];
	// Testing helpers
	addMockResource(resource: EconomicResource): void;
	clearMockResources(): void;
}

// Convert string queries to gql documents
const GET_ALL_RESOURCES = gql`
	${GET_ECONOMIC_RESOURCES}
`;
const UPDATE_RESOURCE_MUTATION = gql`
	${UPDATE_ECONOMIC_RESOURCE}
`;

// Additional mutations that may not exist yet
const CREATE_RESOURCE = gql`
	mutation CreateEconomicResource($resource: EconomicResourceCreateParams!) {
		createEconomicResource(resource: $resource) {
			economicResource {
				id
				name
				note
				trackingIdentifier
				currentLocation
				primaryAccountable {
					id
					name
				}
				custodian {
					id
					name
				}
				conformsTo {
					id
					name
				}
				accountingQuantity {
					hasNumericalValue
					hasUnit {
						id
						label
						symbol
					}
				}
				onhandQuantity {
					hasNumericalValue
					hasUnit {
						id
						label
						symbol
					}
				}
			}
		}
	}
`;

const DELETE_RESOURCE = gql`
	mutation DeleteEconomicResource($id: ID!) {
		deleteEconomicResource(id: $id)
	}
`;

/**
 * Creates an economic resources store that manages resource-related state and operations.
 * Uses the hREA service to perform GraphQL operations with existing fragments.
 *
 * @returns An object with resource state and methods
 */
function createEconomicResourcesStore(): EconomicResourcesStore {
	// State
	let resources: EconomicResource[] = $state([]);
	let loading: boolean = $state(false);
	let error: string | null = $state(null);

	/**
	 * Fetches all economic resources from the hREA system.
	 */
	async function fetchAllResources(): Promise<void> {
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

			const result = await hreaService.apolloClient.query<GetEconomicResourcesResponse>({
				query: GET_ALL_RESOURCES,
				fetchPolicy: 'cache-first'
			});

			resources = (result.data.economicResources?.edges || []).map((edge) => edge.node);
			console.log(`Fetched ${resources.length} economic resources`);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error = `Failed to fetch economic resources: ${errorMessage}`;
			console.error(error, err);
		} finally {
			loading = false;
		}
	}

	/**
	 * Creates a new economic resource in the hREA system.
	 * Falls back to mock creation for testing if GraphQL fails.
	 */
	async function createResource(
		resourceData: Partial<EconomicResource>
	): Promise<EconomicResource> {
		if (loading) {
			throw new Error('Another operation is in progress');
		}

		loading = true;
		error = null;

		try {
			// Try to create via GraphQL first
			if (hreaService.isInitialized && hreaService.apolloClient) {
				const result = await hreaService.apolloClient.mutate({
					mutation: CREATE_RESOURCE,
					variables: {
						resource: resourceData
					}
				});

				const newResource = result.data?.createEconomicResource.economicResource;
				if (newResource) {
					resources = [...resources, newResource];
					console.log('Created new economic resource via GraphQL:', newResource.id);
					return newResource;
				}
			}

			// Fallback: Create mock resource for testing
			const mockResource: EconomicResource = {
				id: `mock-resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				name: resourceData.name || 'Untitled Resource',
				note: resourceData.note,
				trackingIdentifier: resourceData.trackingIdentifier,
				currentLocation: resourceData.currentLocation,
				primaryAccountable: resourceData.primaryAccountable,
				custodian: resourceData.custodian,
				conformsTo: resourceData.conformsTo,
				accountingQuantity: resourceData.accountingQuantity || {
					hasNumericalValue: 1,
					hasUnit: { id: 'one', label: 'Each', symbol: 'ea' }
				},
				onhandQuantity: resourceData.onhandQuantity,
				unitOfEffort: resourceData.unitOfEffort,
				// True Commons specific fields
				tags: resourceData.tags,
				license: resourceData.license,
				resourceType: resourceData.resourceType,
				contentHash: resourceData.contentHash,
				content: resourceData.content,
				version: resourceData.version || '1.0.0',
				fork_count: 0,
				usage_count: 0,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			};

			resources = [...resources, mockResource];
			console.log('Created mock economic resource:', mockResource.id);

			return mockResource;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error = `Failed to create economic resource: ${errorMessage}`;
			console.error(error, err);
			throw err;
		} finally {
			loading = false;
		}
	}

	/**
	 * Updates an existing economic resource in the hREA system.
	 */
	async function updateResource(
		id: string,
		resourceData: Partial<EconomicResource>
	): Promise<EconomicResource> {
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

			const result = await hreaService.apolloClient.mutate<UpdateEconomicResourceResponse>({
				mutation: UPDATE_RESOURCE_MUTATION,
				variables: {
					resource: { ...resourceData, id }
				}
			});

			const updatedResource = result.data?.updateEconomicResource.economicResource;
			if (!updatedResource) {
				throw new Error('Failed to update resource - no data returned');
			}

			resources = resources.map((resource) => (resource.id === id ? updatedResource : resource));
			console.log('Updated economic resource:', id);

			return updatedResource;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error = `Failed to update economic resource: ${errorMessage}`;
			console.error(error, err);
			throw err;
		} finally {
			loading = false;
		}
	}

	/**
	 * Deletes an economic resource from the hREA system.
	 */
	async function deleteResource(id: string): Promise<void> {
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
				mutation: DELETE_RESOURCE,
				variables: { id }
			});

			resources = resources.filter((resource) => resource.id !== id);
			console.log('Deleted economic resource:', id);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error = `Failed to delete economic resource: ${errorMessage}`;
			console.error(error, err);
			throw err;
		} finally {
			loading = false;
		}
	}

	/**
	 * Searches resources by tag (case-insensitive)
	 */
	function searchResourcesByTag(tag: string): EconomicResource[] {
		const searchTerm = tag.toLowerCase();
		return resources.filter(
			(resource) =>
				resource.tags?.some((t) => t.toLowerCase().includes(searchTerm)) ||
				resource.name?.toLowerCase().includes(searchTerm) ||
				resource.note?.toLowerCase().includes(searchTerm)
		);
	}

	/**
	 * Gets resources by type
	 */
	function getResourcesByType(type: string): EconomicResource[] {
		return resources.filter((resource) => resource.resourceType === type);
	}

	/**
	 * Adds a mock resource for testing (bypasses GraphQL)
	 */
	function addMockResource(resource: EconomicResource): void {
		resources = [...resources, resource];
		console.log('Added mock resource:', resource.id);
	}

	/**
	 * Clears all mock resources for testing
	 */
	function clearMockResources(): void {
		resources = [];
		console.log('Cleared all resources');
	}

	return {
		// Getters
		get resources() {
			return resources;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},

		// Methods
		fetchAllResources,
		createResource,
		updateResource,
		deleteResource,

		// True Commons specific methods
		searchResourcesByTag,
		getResourcesByType,

		// Testing helpers
		addMockResource,
		clearMockResources
	};
}

const economicResourcesStore = createEconomicResourcesStore();
export default economicResourcesStore;
