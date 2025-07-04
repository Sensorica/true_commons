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
			// Ensure hREA service is initialized
			if (!hreaService.isInitialized) {
				await hreaService.initialize();
			}

			if (!hreaService.apolloClient) {
				throw new Error('Apollo client is not available');
			}

			const result = await hreaService.apolloClient.mutate({
				mutation: CREATE_RESOURCE,
				variables: {
					resource: resourceData
				}
			});

			const newResource = result.data?.createEconomicResource.economicResource;
			if (!newResource) {
				throw new Error('Failed to create resource - no data returned');
			}

			resources = [...resources, newResource];
			console.log('Created new economic resource:', newResource.id);

			return newResource;
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
		deleteResource
	};
}

const economicResourcesStore = createEconomicResourcesStore();
export default economicResourcesStore;
