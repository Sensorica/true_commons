import { gql } from '@apollo/client/core';
import hreaService from '../services/hrea.service.svelte';
import type { Unit, GetUnitsResponse, UnitCreateParams, UnitUpdateParams } from '../graphql/types';
import { GET_UNITS } from '../graphql/queries';
import { DEFAULT_UNITS } from '../data';

export interface UnitsStore {
	readonly units: Unit[];
	readonly loading: boolean;
	readonly error: string | null;
	fetchAllUnits(): Promise<void>;
	createUnit(unit: UnitCreateParams): Promise<Unit>;
	updateUnit(id: string, unit: UnitUpdateParams): Promise<Unit>;
	deleteUnit(id: string): Promise<void>;
	initializeDefaultUnits(): Promise<void>;
	getUnitById(id: string): Unit | null;
}

// Define mutations directly here to ensure they match the hREA schema
const CREATE_UNIT_MUTATION = gql`
	mutation CreateUnit($omUnitIdentifier: String!, $label: String!, $symbol: String!) {
		createUnit(omUnitIdentifier: $omUnitIdentifier, label: $label, symbol: $symbol) {
			unit {
				id
				label
				symbol
			}
		}
	}
`;

const UPDATE_UNIT_MUTATION = gql`
	mutation UpdateUnit($id: ID!, $label: String, $symbol: String) {
		updateUnit(id: $id, label: $label, symbol: $symbol) {
			unit {
				id
				label
				symbol
			}
		}
	}
`;

const DELETE_UNIT_MUTATION = gql`
	mutation DeleteUnit($id: ID!) {
		deleteUnit(id: $id)
	}
`;

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
	async function fetchAllUnits(): Promise<void> {
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

					const result = await hreaService.apolloClient.query<GetUnitsResponse>({
						query: GET_ALL_UNITS,
						fetchPolicy: 'cache-first'
					});

					// Defensive handling of GraphQL query result
					if (result.data && result.data.units) {
						units = Array.isArray(result.data.units) ? result.data.units : [];
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

				console.log('Creating unit with data:', unitData);

				try {
					const result = await hreaService.apolloClient.mutate({
						mutation: CREATE_UNIT_MUTATION,
						variables: {
							omUnitIdentifier: unitData.id,
							label: unitData.label,
							symbol: unitData.symbol
						}
					});

					console.log('Create unit mutation result:', result);

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

					units = [...units, newUnit];
					console.log('Created new unit:', newUnit.id);

					return newUnit;
				} catch (mutationError) {
					console.error('Unit creation mutation failed:', mutationError);

					// Check if it's a GraphQL error
					if (mutationError instanceof Error) {
						if (
							mutationError.message.includes('Cannot query field "createUnit"') ||
							mutationError.message.includes('Unknown argument "unit"')
						) {
							throw new Error(
								'Unit creation mutation not supported by the current schema. Please check the GraphQL schema.'
							);
						}
					}

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
	async function updateUnit(id: string, unitData: UnitUpdateParams): Promise<Unit> {
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
							omUnitIdentifier: id,
							label: unitData.label,
							symbol: unitData.symbol
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
	async function deleteUnit(id: string): Promise<void> {
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
						variables: { id }
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
		console.log('📋 DEFAULT_UNITS configuration:', DEFAULT_UNITS);

		try {
			// First fetch existing units to check what we already have
			console.log('📊 Fetching existing units...');
			await fetchAllUnits();

			const existingUnitIds = new Set(units.map((u) => u.id));

			console.log(`📊 Found ${units.length} existing units:`, Array.from(existingUnitIds));
			console.log(
				'🎯 Required units from DEFAULT_UNITS:',
				DEFAULT_UNITS.map((u) => u.id)
			);

			let created = 0;
			let skipped = 0;
			let failed = 0;

			// Create only the units that don't exist yet
			for (const defaultUnit of DEFAULT_UNITS) {
				if (!existingUnitIds.has(defaultUnit.id)) {
					try {
						console.log(`⚙️ Creating unit: ${defaultUnit.label} (${defaultUnit.id})`);
						console.log('📝 Unit data:', defaultUnit);
						await createUnit(defaultUnit);
						created++;
						console.log(`✅ Created default unit: ${defaultUnit.label}`);
					} catch (err) {
						failed++;
						console.warn(`⚠️ Failed to create default unit ${defaultUnit.label}:`, err);

						// If the mutation isn't supported, throw a clear error
						if (err instanceof Error && err.message.includes('mutation not supported')) {
							console.error('💥 UNIT MUTATION NOT SUPPORTED - This is the core issue!');
							throw new Error(
								`Unit creation is not supported by the current hREA schema. This might be because:\n1. The hREA schema doesn't include unit mutations\n2. Units might be predefined in the system\n3. There might be a different API for managing units\n\nOriginal error: ${err.message}`
							);
						}

						// For GraphQL schema errors, provide more details
						if (
							err instanceof Error &&
							(err.message.includes('Cannot query field') ||
								err.message.includes('Unknown argument') ||
								err.message.includes('Field "createUnit" must not have a selection'))
						) {
							console.error('🔧 GraphQL Schema Issue Details:', {
								message: err.message,
								unitData: defaultUnit,
								errorType: 'GraphQL Schema Mismatch'
							});
							throw new Error(
								`GraphQL schema doesn't support unit creation mutations. Schema error: ${err.message}`
							);
						}

						// Continue with other units for other types of errors
						console.warn(`⏭️ Continuing with other units despite error with ${defaultUnit.label}`);
					}
				} else {
					skipped++;
					console.log(`⏭️ Unit ${defaultUnit.label} already exists, skipping...`);
				}
			}

			console.log(`✅ Default units initialization completed:`);
			console.log(`   📦 Created: ${created} units`);
			console.log(`   ⏭️ Skipped: ${skipped} units (already existed)`);
			console.log(`   ❌ Failed: ${failed} units`);
			console.log(`   📊 Total: ${units.length} units available`);

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
