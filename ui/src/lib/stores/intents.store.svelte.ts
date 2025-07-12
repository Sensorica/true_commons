import { gql } from '@apollo/client/core';
import hreaService from '../services/hrea.service.svelte';
import foundationService from '../services/foundation.service.svelte';
import agentsStore from './agents.store.svelte';
import actionsStore from './actions.store.svelte';
import resourcesStore from './resources.store.svelte';
import unitsStore from './units.store.svelte';
import type {
    Intent,
    IntentCreateParams,
    IntentUpdateParams,
    GetIntentsResponse,
    CreateIntentResponse,
    UpdateIntentResponse,
    DeleteIntentResponse,
    Commitment
} from '../graphql/types';
import {
    GET_INTENTS,
    GET_INTENT,
    GET_INTENTS_BY_PROVIDER,
    GET_INTENTS_BY_RECEIVER,
    GET_UNSATISFIED_INTENTS,
    GET_INTENTS_FOR_MATCHING
} from '../graphql/queries';
import {
    CREATE_INTENT,
    UPDATE_INTENT,
    DELETE_INTENT,
    PROPOSE_INTENT
} from '../graphql/mutations';

export interface IntentsStore {
    readonly intents: Intent[];
    readonly loading: boolean;
    readonly error: string | null;
    fetchAllIntents(): Promise<void>;
    createIntent(intent: IntentCreateParams): Promise<Intent>;
    updateIntent(id: string, intent: IntentUpdateParams): Promise<Intent>;
    deleteIntent(id: string): Promise<void>;
    getIntentById(id: string): Intent | undefined;
    getIntentsByProvider(providerId: string): Intent[];
    getIntentsByReceiver(receiverId: string): Intent[];
    getUnsatisfiedIntents(): Intent[];
    getIntentsForMatching(action?: string, resourceConformsTo?: string): Intent[];
    proposeIntent(intentId: string, note?: string): Promise<Intent>;
    validateIntentData(intent: IntentCreateParams): Promise<string[]>;
    getIntentStatsByAgent(agentId: string): {
        total: number;
        provided: number;
        received: number;
        satisfied: number;
        unsatisfied: number;
    };
}

// Convert string queries to gql documents
const GET_ALL_INTENTS = gql`
	${GET_INTENTS}
`;

const GET_INTENT_QUERY = gql`
	${GET_INTENT}
`;

const GET_INTENTS_BY_PROVIDER_QUERY = gql`
	${GET_INTENTS_BY_PROVIDER}
`;

const GET_INTENTS_BY_RECEIVER_QUERY = gql`
	${GET_INTENTS_BY_RECEIVER}
`;

const GET_UNSATISFIED_INTENTS_QUERY = gql`
	${GET_UNSATISFIED_INTENTS}
`;

const GET_INTENTS_FOR_MATCHING_QUERY = gql`
	${GET_INTENTS_FOR_MATCHING}
`;

const CREATE_INTENT_MUTATION = gql`
	${CREATE_INTENT}
`;

const UPDATE_INTENT_MUTATION = gql`
	${UPDATE_INTENT}
`;

const DELETE_INTENT_MUTATION = gql`
	${DELETE_INTENT}
`;

const PROPOSE_INTENT_MUTATION = gql`
	${PROPOSE_INTENT}
`;

/**
 * Creates an intents store that manages intent-related state and operations.
 * Uses the hREA service to perform GraphQL operations with proper validation.
 *
 * @returns An object with intent state and methods
 */
function createIntentsStore(): IntentsStore {
    // State
    let intents: Intent[] = $state([]);
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
            console.error('Intents store operation failed:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    /**
     * Validates intent data to ensure all required foundation components exist
     */
    async function validateIntentData(intent: IntentCreateParams): Promise<string[]> {
        const errors: string[] = [];

        // Check foundation requirements
        if (!foundationService.isInitialized) {
            try {
                await foundationService.initialize();
            } catch {
                errors.push('Foundation service initialization failed');
                return errors;
            }
        }

        const foundationStatus = await foundationService.checkFoundationRequirements();
        if (!foundationStatus.allReady) {
            errors.push(
                'Foundation components not ready. Please initialize foundation components first.'
            );
            return errors;
        }

        // Validate Action exists
        if (!actionsStore.getActionById(intent.action)) {
            errors.push(
                `Action "${intent.action}" not found. Available actions: ${actionsStore.actions.map((a) => a.id).join(', ')}`
            );
        }

        // Validate Provider Agent exists (if provided)
        if (intent.provider && !agentsStore.getAgentById(intent.provider)) {
            errors.push(`Provider agent "${intent.provider}" not found`);
        }

        // Validate Receiver Agent exists (if provided)
        if (intent.receiver && !agentsStore.getAgentById(intent.receiver)) {
            errors.push(`Receiver agent "${intent.receiver}" not found`);
        }

        // Validate ResourceSpecification exists (if provided)
        if (
            intent.resourceConformsTo &&
            !resourcesStore.getResourceSpecificationById(intent.resourceConformsTo)
        ) {
            errors.push(`Resource specification "${intent.resourceConformsTo}" not found`);
        }

        // Validate Resource exists (if provided)
        if (
            intent.resourceInventoriedAs &&
            !resourcesStore.getResourceById(intent.resourceInventoriedAs)
        ) {
            errors.push(`Resource "${intent.resourceInventoriedAs}" not found`);
        }

        // Validate Units in quantities (if provided)
        if (
            intent.resourceQuantity?.hasUnit &&
            !unitsStore.getUnitById(intent.resourceQuantity.hasUnit)
        ) {
            errors.push(`Unit "${intent.resourceQuantity.hasUnit}" not found for resource quantity`);
        }

        if (
            intent.effortQuantity?.hasUnit &&
            !unitsStore.getUnitById(intent.effortQuantity.hasUnit)
        ) {
            errors.push(`Unit "${intent.effortQuantity.hasUnit}" not found for effort quantity`);
        }

        // Validate datetime fields
        if (intent.hasBeginning && intent.hasEnd) {
            const beginning = new Date(intent.hasBeginning);
            const end = new Date(intent.hasEnd);
            if (beginning >= end) {
                errors.push('Intent beginning time must be before end time');
            }
        }

        // Validate due date
        if (intent.due) {
            const due = new Date(intent.due);
            const now = new Date();
            if (due < now) {
                errors.push('Intent due date cannot be in the past');
            }
        }

        return errors;
    }

    /**
     * Fetches all intents from the hREA system.
     */
    async function fetchAllIntents(): Promise<void> {
        if (loading) return;

        return withLoadingState(
            async () => {
                if (!hreaService.isInitialized) {
                    await hreaService.initialize();
                }

                if (!hreaService.apolloClient) {
                    throw new Error('Apollo client is not available');
                }

                const result = await hreaService.apolloClient.query<GetIntentsResponse>({
                    query: GET_ALL_INTENTS,
                    fetchPolicy: 'cache-first'
                });

                intents = (result.data.intents?.edges || []).map((edge) => edge.node);
                console.log(`Fetched ${intents.length} intents`);
            },
            (value) => (loading = value),
            (value) => (error = value)
        );
    }

    /**
     * Creates a new intent in the hREA system with proper validation.
     */
    async function createIntent(intentData: IntentCreateParams): Promise<Intent> {
        return withLoadingState(
            async () => {
                // Validate intent data first
                const validationErrors = await validateIntentData(intentData);
                if (validationErrors.length > 0) {
                    throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
                }

                if (!hreaService.isInitialized) {
                    await hreaService.initialize();
                }

                if (!hreaService.apolloClient) {
                    throw new Error('Apollo client is not available');
                }

                const result = await hreaService.apolloClient.mutate<CreateIntentResponse>({
                    mutation: CREATE_INTENT_MUTATION,
                    variables: {
                        intent: intentData
                    }
                });

                const newIntent = result.data?.createIntent.intent;
                if (!newIntent) {
                    throw new Error('Failed to create intent - no data returned');
                }

                intents = [...intents, newIntent];
                console.log('Created new intent:', newIntent);
                return newIntent;
            },
            (value) => (loading = value),
            (value) => (error = value)
        );
    }

    /**
     * Updates an existing intent in the hREA system.
     */
    async function updateIntent(id: string, intentData: IntentUpdateParams): Promise<Intent> {
        return withLoadingState(
            async () => {
                if (!hreaService.isInitialized) {
                    await hreaService.initialize();
                }

                if (!hreaService.apolloClient) {
                    throw new Error('Apollo client is not available');
                }

                const result = await hreaService.apolloClient.mutate<UpdateIntentResponse>({
                    mutation: UPDATE_INTENT_MUTATION,
                    variables: {
                        id,
                        intent: intentData
                    }
                });

                const updatedIntent = result.data?.updateIntent.intent;
                if (!updatedIntent) {
                    throw new Error('Failed to update intent - no data returned');
                }

                intents = intents.map((intent) =>
                    intent.id === id ? updatedIntent : intent
                );
                console.log('Updated intent:', updatedIntent);
                return updatedIntent;
            },
            (value) => (loading = value),
            (value) => (error = value)
        );
    }

    /**
     * Deletes an intent from the hREA system.
     */
    async function deleteIntent(id: string): Promise<void> {
        return withLoadingState(
            async () => {
                if (!hreaService.isInitialized) {
                    await hreaService.initialize();
                }

                if (!hreaService.apolloClient) {
                    throw new Error('Apollo client is not available');
                }

                const result = await hreaService.apolloClient.mutate<DeleteIntentResponse>({
                    mutation: DELETE_INTENT_MUTATION,
                    variables: { id }
                });

                if (!result.data?.deleteIntent) {
                    throw new Error('Failed to delete intent');
                }

                intents = intents.filter((intent) => intent.id !== id);
                console.log('Deleted intent:', id);
            },
            (value) => (loading = value),
            (value) => (error = value)
        );
    }

    /**
     * Gets an intent by its ID.
     */
    function getIntentById(id: string): Intent | undefined {
        return intents.find((intent) => intent.id === id);
    }

    /**
     * Gets intents by provider agent ID.
     */
    function getIntentsByProvider(providerId: string): Intent[] {
        return intents.filter((intent) => intent.provider?.id === providerId);
    }

    /**
     * Gets intents by receiver agent ID.
     */
    function getIntentsByReceiver(receiverId: string): Intent[] {
        return intents.filter((intent) => intent.receiver?.id === receiverId);
    }

    /**
     * Gets unsatisfied intents.
     */
    function getUnsatisfiedIntents(): Intent[] {
        return intents.filter((intent) =>
            !intent.satisfiedBy || intent.satisfiedBy.length === 0
        );
    }

    /**
     * Gets intents for matching with commitments.
     */
    function getIntentsForMatching(action?: string, resourceConformsTo?: string): Intent[] {
        return intents.filter((intent) => {
            const isUnsatisfied = !intent.satisfiedBy || intent.satisfiedBy.length === 0;
            const actionMatches = !action || intent.action.id === action;
            const resourceMatches = !resourceConformsTo || intent.resourceConformsTo?.id === resourceConformsTo;

            return isUnsatisfied && actionMatches && resourceMatches;
        });
    }

    /**
     * Proposes an intent (makes it available for matching).
     */
    async function proposeIntent(intentId: string, note?: string): Promise<Intent> {
        return withLoadingState(
            async () => {
                if (!hreaService.isInitialized) {
                    await hreaService.initialize();
                }

                if (!hreaService.apolloClient) {
                    throw new Error('Apollo client is not available');
                }

                const result = await hreaService.apolloClient.mutate({
                    mutation: PROPOSE_INTENT_MUTATION,
                    variables: {
                        intentId,
                        note
                    }
                });

                const updatedIntent = result.data?.proposeIntent.intent;
                if (!updatedIntent) {
                    throw new Error('Failed to propose intent - no data returned');
                }

                intents = intents.map((intent) =>
                    intent.id === intentId ? updatedIntent : intent
                );
                console.log('Proposed intent:', updatedIntent);
                return updatedIntent;
            },
            (value) => (loading = value),
            (value) => (error = value)
        );
    }

    /**
     * Gets intent statistics for a specific agent.
     */
    function getIntentStatsByAgent(agentId: string) {
        const provided = intents.filter((intent) => intent.provider?.id === agentId);
        const received = intents.filter((intent) => intent.receiver?.id === agentId);
        const satisfied = intents.filter((intent) =>
            (intent.provider?.id === agentId || intent.receiver?.id === agentId) &&
            intent.satisfiedBy && intent.satisfiedBy.length > 0
        );
        const unsatisfied = intents.filter((intent) =>
            (intent.provider?.id === agentId || intent.receiver?.id === agentId) &&
            (!intent.satisfiedBy || intent.satisfiedBy.length === 0)
        );

        return {
            total: provided.length + received.length,
            provided: provided.length,
            received: received.length,
            satisfied: satisfied.length,
            unsatisfied: unsatisfied.length
        };
    }

    return {
        // Getters
        get intents() {
            return intents;
        },
        get loading() {
            return loading;
        },
        get error() {
            return error;
        },

        // Methods
        fetchAllIntents,
        createIntent,
        updateIntent,
        deleteIntent,
        getIntentById,
        getIntentsByProvider,
        getIntentsByReceiver,
        getUnsatisfiedIntents,
        getIntentsForMatching,
        proposeIntent,
        validateIntentData,
        getIntentStatsByAgent
    };
}

const intentsStore = createIntentsStore();
export default intentsStore; 