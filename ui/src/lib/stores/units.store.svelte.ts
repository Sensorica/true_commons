import { gql } from '@apollo/client/core';
import hreaService from '../services/hrea.service.svelte';
import type { Unit, GetUnitsResponse, UnitCreateParams, UnitUpdateParams } from '../graphql/types';
import { GET_UNITS } from '../graphql/queries';
import {
	CREATE_UNIT_MUTATION,
	UPDATE_UNIT_MUTATION,
	DELETE_UNIT_MUTATION
} from '../graphql/mutations';
import { DEFAULT_UNITS } from '../data';

export interface UnitsStore {
	readonly units: Unit[];
	readonly loading: boolean;
	readonly error: string | null;
	fetchAllUnits(forceRefetch?: boolean): Promise<void>;
	createUnit(unit: UnitCreateParams): Promise<Unit>;
	updateUnit(id: string, revisionId: string, unit: UnitUpdateParams): Promise<Unit>;
	deleteUnit(id: string, revisionId: string): Promise<void>;
	initializeDefaultUnits(): Promise<void>;
	getUnitById(id: string): Unit | null;
}

// Using imported mutations from ../graphql/mutations that match the hREA schema

// Convert string queries to gql documents
const GET_ALL_UNITS = gql`
	${GET_UNITS}
`;

/**
 * Creates a units store that manages Unit-related state and operations.
 * Uses the hREA service to perform GraphQL operations with foundation Units.
 *
 * @returns An object with units state and methods
 */
function createUnitsStore(): UnitsStore {
	// State - ensure units is always an array
	let units: Unit[] = $state([]);
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
			console.error('Units store operation failed:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	}

	/**
	 * Fetches all units from the hREA system.
	 */
	async function fetchAllUnits(forceRefetch: boolean = false): Promise<void> {
		if (loading) return;

		// Avoid refetching if we already have data, unless forced
		if (units.length > 0 && !forceRefetch) {
			return;
		}

		return withLoadingState(
			async () => {
				try {
					if (!hreaService.isInitialized) {
						await hreaService.initialize();
					}

					if (!hreaService.apolloClient) {
						throw new Error('Apollo client is not available');
					}

					const result = await hreaService.apolloClient.query<GetUnitsResponse>({
						query: GET_ALL_UNITS,
						fetchPolicy: 'no-cache' // Always fetch fresh data for units
					});

					console.log('all units:', result.data);

					// Defensive handling of GraphQL query result
					if (result.data && result.data.units) {
						// Handle GraphQL connection-style responses (edges/nodes)
						if (result.data.units.edges && Array.isArray(result.data.units.edges)) {
							units = result.data.units.edges.map((edge) => edge.node);
						} else {
							// If no units are returned, the edges array might be null or missing.
							units = [];
						}
					} else {
						// If no units found, initialize as empty array
						units = [];
						console.warn('No units found in GraphQL response, initializing empty array');
					}

					console.log(`Fetched ${units.length} units`);
				} catch (err) {
					console.error('Failed to fetch units from GraphQL:', err);
					// On GraphQL failure, initialize empty array to prevent .map() errors
					units = [];
					// Re-throw to trigger error handling
					throw err;
				}
			},
			(value) => (loading = value),
			(value) => (error = value)
		);
	}

	/**
	 * Creates a new unit in the hREA system.
	 */
	async function createUnit(unitData: UnitCreateParams): Promise<Unit> {
		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				console.log('Creating unit:', unitData);

				try {
					const result = await hreaService.apolloClient.mutate({
						mutation: CREATE_UNIT_MUTATION,
						variables: {
							unit: unitData
						}
					});

					// Handle different possible response structures
					let newUnit: Unit | null = null;

					if (result.data?.createUnit?.unit) {
						newUnit = result.data.createUnit.unit;
					} else if (result.data?.createUnit) {
						newUnit = result.data.createUnit;
					} else {
						throw new Error('Failed to create unit - unexpected response structure');
					}

					if (!newUnit) {
						throw new Error('Failed to create unit - no data returned');
					}

					// Add to local store
					units.push(newUnit);
					console.log('✅ Created unit:', newUnit.id);
					return newUnit;
				} catch (mutationError) {
					console.error('❌ Unit creation failed:', mutationError);
					throw mutationError;
				}
			},
			(value) => (loading = value),
			(value) => (error = value)
		);
	}

	/**
	 * Updates an existing unit in the hREA system.
	 */
	async function updateUnit(
		id: string,
		revisionId: string,
		unitData: UnitUpdateParams
	): Promise<Unit> {
		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				try {
					const result = await hreaService.apolloClient.mutate({
						mutation: UPDATE_UNIT_MUTATION,
						variables: {
							id,
							revisionId,
							unit: unitData
						}
					});

					// Handle different possible response structures
					let updatedUnit: Unit | null = null;

					if (result.data?.updateUnit?.unit) {
						updatedUnit = result.data.updateUnit.unit;
					} else if (result.data?.updateUnit) {
						updatedUnit = result.data.updateUnit;
					} else {
						throw new Error('Failed to update unit - unexpected response structure');
					}

					if (!updatedUnit) {
						throw new Error('Failed to update unit - no data returned');
					}

					// Update in local store
					const index = units.findIndex((u) => u.id === id);
					if (index !== -1) {
						units[index] = updatedUnit;
					}

					console.log('Updated unit:', id);
					return updatedUnit;
				} catch (mutationError) {
					console.error('Unit update mutation failed:', mutationError);
					throw mutationError;
				}
			},
			(value) => (loading = value),
			(value) => (error = value)
		);
	}

	/**
	 * Deletes a unit from the hREA system.
	 */
	async function deleteUnit(id: string, revisionId: string): Promise<void> {
		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				try {
					await hreaService.apolloClient.mutate({
						mutation: DELETE_UNIT_MUTATION,
						variables: { id, revisionId }
					});

					// Remove from local store
					units = units.filter((u) => u.id !== id);
					console.log('Deleted unit:', id);
				} catch (mutationError) {
					console.error('Unit deletion mutation failed:', mutationError);
					throw mutationError;
				}
			},
			(value) => (loading = value),
			(value) => (error = value)
		);
	}

	/**
	 * Initializes the default units required by ValueFlows.
	 * This creates the foundation units needed for proper operation.
	 */
	async function initializeDefaultUnits(): Promise<void> {
		console.log('🔄 Initializing default units...');

		try {
			// First fetch existing units to check what we already have
			await fetchAllUnits();

			console.log(`📊 Found ${units.length} existing units`);
			console.log('🎯 Required units:', DEFAULT_UNITS);

			let created = 0;
			let skipped = 0;
			let failed = 0;

			// Create only the units that don't exist yet - check by omUnitIdentifier
			const existingOmIds = new Set(units.map((u) => u.omUnitIdentifier));
			for (const defaultUnit of DEFAULT_UNITS) {
				if (!existingOmIds.has(defaultUnit.omUnitIdentifier)) {
					try {
						console.log(`⚙️ Creating unit: ${defaultUnit.label}`);
						await createUnit(defaultUnit);
						created++;
					} catch (err) {
						failed++;
						console.warn(`⚠️ Failed to create unit ${defaultUnit.label}:`, err);

						// If the mutation isn't supported, throw a clear error
						if (err instanceof Error && err.message.includes('mutation not supported')) {
							throw new Error(
								`Unit creation not supported by hREA schema. Original error: ${err.message}`
							);
						}

						// For GraphQL schema errors, provide more details
						if (
							err instanceof Error &&
							(err.message.includes('Cannot query field') ||
								err.message.includes('Unknown argument') ||
								err.message.includes('Field "createUnit" must not have a selection'))
						) {
							throw new Error(`GraphQL schema error: ${err.message}`);
						}

						// Continue with other units for other types of errors
						console.warn(`⏭️ Continuing with other units despite error`);
					}
				} else {
					skipped++;
					console.log(`⏭️ Unit ${defaultUnit.label} already exists`);
				}
			}

			console.log(
				`✅ Units initialization completed: ${created} created, ${skipped} skipped, ${failed} failed`
			);

			if (failed > 0 && created === 0) {
				console.error('💥 NO UNITS WERE CREATED - this will cause application issues');
			}
		} catch (error) {
			console.error('❌ Failed to initialize default units:', error);
			throw error;
		}
	}

	/**
	 * Gets a unit by its ID.
	 */
	function getUnitById(id: string): Unit | null {
		return units.find((u) => u.id === id) || null;
	}

	return {
		// Getters
		get units() {
			return units;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},

		// Methods
		fetchAllUnits,
		createUnit,
		updateUnit,
		deleteUnit,
		initializeDefaultUnits,
		getUnitById
	};
}

const unitsStore = createUnitsStore();
export default unitsStore;
