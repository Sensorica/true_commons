import { gql } from '@apollo/client/core';
import hreaService from '../services/hrea.service.svelte';
import type {
    Unit,
    GetUnitsResponse,
    CreateUnitResponse,
    UpdateUnitResponse,
    UnitCreateParams,
    UnitUpdateParams
} from '../graphql/types';
import { GET_UNITS } from '../graphql/queries';
import { CREATE_UNIT, UPDATE_UNIT, DELETE_UNIT } from '../graphql/mutations';

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

// Convert string queries to gql documents
const GET_ALL_UNITS = gql`
	${GET_UNITS}
`;

const CREATE_UNIT_MUTATION = gql`
	${CREATE_UNIT}
`;

const UPDATE_UNIT_MUTATION = gql`
	${UPDATE_UNIT}
`;

const DELETE_UNIT_MUTATION = gql`
	${DELETE_UNIT}
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

                const result = await hreaService.apolloClient.mutate<CreateUnitResponse>({
                    mutation: CREATE_UNIT_MUTATION,
                    variables: {
                        unit: unitData
                    }
                });

                const newUnit = result.data?.createUnit.unit;
                if (!newUnit) {
                    throw new Error('Failed to create unit - no data returned');
                }

                units = [...units, newUnit];
                console.log('Created new unit:', newUnit.id);

                return newUnit;
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

                const result = await hreaService.apolloClient.mutate<UpdateUnitResponse>({
                    mutation: UPDATE_UNIT_MUTATION,
                    variables: {
                        id,
                        unit: unitData
                    }
                });

                const updatedUnit = result.data?.updateUnit.unit;
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

                await hreaService.apolloClient.mutate({
                    mutation: DELETE_UNIT_MUTATION,
                    variables: { id }
                });

                // Remove from local store
                units = units.filter((u) => u.id !== id);
                console.log('Deleted unit:', id);
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
        console.log('Initializing default units...');

        const defaultUnits: UnitCreateParams[] = [
            { id: 'one', label: 'Each', symbol: 'ea' },
            { id: 'hour', label: 'Hour', symbol: 'h' },
            { id: 'kilogram', label: 'Kilogram', symbol: 'kg' },
            { id: 'meter', label: 'Meter', symbol: 'm' },
            { id: 'piece', label: 'Piece', symbol: 'pc' },
            { id: 'minute', label: 'Minute', symbol: 'min' },
            { id: 'second', label: 'Second', symbol: 's' }
        ];

        // First fetch existing units to check what we already have
        await fetchAllUnits();

        const existingUnitIds = new Set(units.map(u => u.id));

        // Create only the units that don't exist yet
        for (const defaultUnit of defaultUnits) {
            if (!existingUnitIds.has(defaultUnit.id)) {
                try {
                    await createUnit(defaultUnit);
                    console.log(`Created default unit: ${defaultUnit.label}`);
                } catch (err) {
                    console.warn(`Failed to create default unit ${defaultUnit.label}:`, err);
                    // Continue with other units even if one fails
                }
            } else {
                console.log(`Unit ${defaultUnit.label} already exists, skipping...`);
            }
        }

        console.log('Default units initialization completed');
    }

    /**
     * Gets a unit by its ID.
     */
    function getUnitById(id: string): Unit | null {
        return units.find(u => u.id === id) || null;
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