import { gql } from '@apollo/client/core';
import hreaService from '../services/hrea.service.svelte';
import foundationService from '../services/foundation.service.svelte';
import agentsStore from './agents.store.svelte';
import type {
    Process,
    ProcessCreateParams,
    ProcessUpdateParams,
    GetProcessesResponse,
    CreateProcessResponse,
    UpdateProcessResponse,
    DeleteProcessResponse,
    EconomicEvent
} from '../graphql/types';
import { GET_PROCESSES, GET_PROCESS_WITH_EVENTS } from '../graphql/queries';
import { CREATE_PROCESS, UPDATE_PROCESS, DELETE_PROCESS } from '../graphql/mutations';

export interface ProcessesStore {
    readonly processes: Process[];
    readonly loading: boolean;
    readonly error: string | null;
    fetchAllProcesses(): Promise<void>;
    createProcess(process: ProcessCreateParams): Promise<Process>;
    updateProcess(id: string, process: ProcessUpdateParams): Promise<Process>;
    deleteProcess(id: string): Promise<void>;
    getProcessById(id: string): Process | undefined;
    getProcessInputs(id: string): Promise<EconomicEvent[]>;
    getProcessOutputs(id: string): Promise<EconomicEvent[]>;
    getProcessWithEvents(id: string): Promise<Process & { inputs: EconomicEvent[]; outputs: EconomicEvent[] }>;
    validateProcessData(process: ProcessCreateParams): Promise<string[]>;
}

// Convert string queries to gql documents
const GET_ALL_PROCESSES = gql`
	${GET_PROCESSES}
`;

const GET_PROCESS_WITH_EVENTS_QUERY = gql`
	${GET_PROCESS_WITH_EVENTS}
`;

const CREATE_PROCESS_MUTATION = gql`
	${CREATE_PROCESS}
`;

const UPDATE_PROCESS_MUTATION = gql`
	${UPDATE_PROCESS}
`;

const DELETE_PROCESS_MUTATION = gql`
	${DELETE_PROCESS}
`;

/**
 * Creates a processes store that manages process-related state and operations.
 * Uses the hREA service to perform GraphQL operations with proper validation.
 *
 * @returns An object with process state and methods
 */
function createProcessesStore(): ProcessesStore {
    // State
    let processes: Process[] = $state([]);
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
            console.error('Processes store operation failed:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    /**
     * Validates process data to ensure all required foundation components exist
     */
    async function validateProcessData(process: ProcessCreateParams): Promise<string[]> {
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

        // Validate name is provided
        if (!process.name?.trim()) {
            errors.push('Process name is required');
        }

        // Validate In Scope Of Agent exists (if provided)
        if (process.inScopeOf && !agentsStore.getAgentById(process.inScopeOf)) {
            errors.push(`Scope agent "${process.inScopeOf}" not found`);
        }

        // Validate datetime fields
        if (process.hasBeginning && process.hasEnd) {
            const beginning = new Date(process.hasBeginning);
            const end = new Date(process.hasEnd);
            if (beginning >= end) {
                errors.push('Process beginning time must be before end time');
            }
        }

        return errors;
    }

    /**
     * Fetches all processes from the hREA system.
     */
    async function fetchAllProcesses(): Promise<void> {
        if (loading) return;

        return withLoadingState(
            async () => {
                if (!hreaService.isInitialized) {
                    await hreaService.initialize();
                }

                if (!hreaService.apolloClient) {
                    throw new Error('Apollo client is not available');
                }

                const result = await hreaService.apolloClient.query<GetProcessesResponse>({
                    query: GET_ALL_PROCESSES,
                    fetchPolicy: 'cache-first'
                });

                processes = (result.data.processes?.edges || []).map((edge) => edge.node);
                console.log(`Fetched ${processes.length} processes`);
            },
            (value) => (loading = value),
            (value) => (error = value)
        );
    }

    /**
     * Creates a new process in the hREA system with proper validation.
     */
    async function createProcess(processData: ProcessCreateParams): Promise<Process> {
        return withLoadingState(
            async () => {
                // Validate process data first
                const validationErrors = await validateProcessData(processData);
                if (validationErrors.length > 0) {
                    throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
                }

                if (!hreaService.isInitialized) {
                    await hreaService.initialize();
                }

                if (!hreaService.apolloClient) {
                    throw new Error('Apollo client is not available');
                }

                const result = await hreaService.apolloClient.mutate<CreateProcessResponse>({
                    mutation: CREATE_PROCESS_MUTATION,
                    variables: {
                        process: processData
                    }
                });

                const newProcess = result.data?.createProcess.process;
                if (!newProcess) {
                    throw new Error('Failed to create process - no data returned');
                }

                processes = [...processes, newProcess];
                console.log('Created new process:', newProcess.id);

                return newProcess;
            },
            (value) => (loading = value),
            (value) => (error = value)
        );
    }

    /**
     * Updates an existing process in the hREA system.
     */
    async function updateProcess(id: string, processData: ProcessUpdateParams): Promise<Process> {
        return withLoadingState(
            async () => {
                if (!hreaService.isInitialized) {
                    await hreaService.initialize();
                }

                if (!hreaService.apolloClient) {
                    throw new Error('Apollo client is not available');
                }

                const result = await hreaService.apolloClient.mutate<UpdateProcessResponse>({
                    mutation: UPDATE_PROCESS_MUTATION,
                    variables: {
                        id,
                        process: processData
                    }
                });

                const updatedProcess = result.data?.updateProcess.process;
                if (!updatedProcess) {
                    throw new Error('Failed to update process - no data returned');
                }

                // Update in local store
                const index = processes.findIndex((p) => p.id === id);
                if (index !== -1) {
                    processes[index] = updatedProcess;
                }

                console.log('Updated process:', id);
                return updatedProcess;
            },
            (value) => (loading = value),
            (value) => (error = value)
        );
    }

    /**
     * Deletes a process from the hREA system.
     */
    async function deleteProcess(id: string): Promise<void> {
        return withLoadingState(
            async () => {
                if (!hreaService.isInitialized) {
                    await hreaService.initialize();
                }

                if (!hreaService.apolloClient) {
                    throw new Error('Apollo client is not available');
                }

                await hreaService.apolloClient.mutate<DeleteProcessResponse>({
                    mutation: DELETE_PROCESS_MUTATION,
                    variables: { id }
                });

                // Remove from local store
                processes = processes.filter((p) => p.id !== id);
                console.log('Deleted process:', id);
            },
            (value) => (loading = value),
            (value) => (error = value)
        );
    }

    /**
     * Gets a process by ID from the local store
     */
    function getProcessById(id: string): Process | undefined {
        return processes.find(process => process.id === id);
    }

    /**
     * Gets a process with its input and output events
     */
    async function getProcessWithEvents(id: string): Promise<Process & { inputs: EconomicEvent[]; outputs: EconomicEvent[] }> {
        return withLoadingState(
            async () => {
                if (!hreaService.isInitialized) {
                    await hreaService.initialize();
                }

                if (!hreaService.apolloClient) {
                    throw new Error('Apollo client is not available');
                }

                const result = await hreaService.apolloClient.query({
                    query: GET_PROCESS_WITH_EVENTS_QUERY,
                    variables: { id },
                    fetchPolicy: 'cache-first'
                });

                const processWithEvents = result.data?.process;
                if (!processWithEvents) {
                    throw new Error('Process not found');
                }

                return processWithEvents;
            },
            (value) => (loading = value),
            (value) => (error = value)
        );
    }

    /**
     * Gets the input events for a process
     */
    async function getProcessInputs(id: string): Promise<EconomicEvent[]> {
        const processWithEvents = await getProcessWithEvents(id);
        return processWithEvents.inputs || [];
    }

    /**
     * Gets the output events for a process
     */
    async function getProcessOutputs(id: string): Promise<EconomicEvent[]> {
        const processWithEvents = await getProcessWithEvents(id);
        return processWithEvents.outputs || [];
    }

    /**
     * Gets processes by agent ID (processes where the agent is in scope or involved)
     */
    function getProcessesByAgent(agentId: string): Process[] {
        return processes.filter(process =>
            process.inScopeOf?.id === agentId
        );
    }

    /**
     * Gets processes by agent ID with additional filtering
     */
    function getProcessesByAgentWithFilter(agentId: string, options: {
        includeFinished?: boolean;
        includeInProgress?: boolean;
        processSpecificationId?: string;
    } = {}): Process[] {
        const { includeFinished = true, includeInProgress = true, processSpecificationId } = options;

        return processes.filter(process => {
            // Agent filter
            if (process.inScopeOf?.id !== agentId) {
                return false;
            }

            // Status filter
            if (process.isFinished && !includeFinished) {
                return false;
            }
            if (!process.isFinished && !includeInProgress) {
                return false;
            }

            // Process specification filter
            if (processSpecificationId && process.basedOn?.id !== processSpecificationId) {
                return false;
            }

            return true;
        });
    }

    /**
     * Gets process statistics for an agent
     */
    function getProcessStatsByAgent(agentId: string) {
        const agentProcesses = getProcessesByAgent(agentId);

        return {
            total: agentProcesses.length,
            finished: agentProcesses.filter(p => p.isFinished).length,
            inProgress: agentProcesses.filter(p => !p.isFinished).length,
            bySpecification: agentProcesses.reduce((acc, process) => {
                const specId = process.basedOn?.id || 'unknown';
                acc[specId] = (acc[specId] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        };
    }

    return {
        // Getters
        get processes() {
            return processes;
        },
        get loading() {
            return loading;
        },
        get error() {
            return error;
        },

        // Methods
        fetchAllProcesses,
        createProcess,
        updateProcess,
        deleteProcess,
        getProcessById,
        getProcessInputs,
        getProcessOutputs,
        getProcessWithEvents,
        validateProcessData,
        getProcessesByAgent,
        getProcessesByAgentWithFilter,
        getProcessStatsByAgent
    };
}

const processesStore = createProcessesStore();
export default processesStore; 