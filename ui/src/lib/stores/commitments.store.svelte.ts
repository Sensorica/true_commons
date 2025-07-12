import { gql } from '@apollo/client/core';
import hreaService from '../services/hrea.service.svelte';
import foundationService from '../services/foundation.service.svelte';
import agentsStore from './agents.store.svelte';
import actionsStore from './actions.store.svelte';
import resourcesStore from './resources.store.svelte';
import unitsStore from './units.store.svelte';
import type {
    Commitment,
    CommitmentCreateParams,
    CommitmentUpdateParams,
    GetCommitmentsResponse,
    CreateCommitmentResponse,
    UpdateCommitmentResponse,
    DeleteCommitmentResponse,
    Intent,
    EconomicEvent
} from '../graphql/types';
import {
    GET_COMMITMENTS,
    GET_COMMITMENT,
    GET_COMMITMENTS_BY_PROVIDER,
    GET_COMMITMENTS_BY_RECEIVER,
    GET_UNFULFILLED_COMMITMENTS
} from '../graphql/queries';
import {
    CREATE_COMMITMENT,
    UPDATE_COMMITMENT,
    DELETE_COMMITMENT,
    FULFILL_COMMITMENT,
    SATISFY_INTENT
} from '../graphql/mutations';

export interface CommitmentsStore {
    readonly commitments: Commitment[];
    readonly loading: boolean;
    readonly error: string | null;
    fetchAllCommitments(): Promise<void>;
    createCommitment(commitment: CommitmentCreateParams): Promise<Commitment>;
    updateCommitment(id: string, commitment: CommitmentUpdateParams): Promise<Commitment>;
    deleteCommitment(id: string): Promise<void>;
    getCommitmentById(id: string): Commitment | undefined;
    getCommitmentsByProvider(providerId: string): Commitment[];
    getCommitmentsByReceiver(receiverId: string): Commitment[];
    getUnfulfilledCommitments(): Commitment[];
    fulfillCommitment(commitmentId: string, eventId: string): Promise<Commitment>;
    satisfyIntent(commitmentId: string, intentId: string): Promise<{ commitment: Commitment; intent: Intent }>;
    validateCommitmentData(commitment: CommitmentCreateParams): Promise<string[]>;
    getCommitmentStatsByAgent(agentId: string): {
        total: number;
        provided: number;
        received: number;
        fulfilled: number;
        unfulfilled: number;
    };
}

// Convert string queries to gql documents
const GET_ALL_COMMITMENTS = gql`
	${GET_COMMITMENTS}
`;

const GET_COMMITMENT_QUERY = gql`
	${GET_COMMITMENT}
`;

const GET_COMMITMENTS_BY_PROVIDER_QUERY = gql`
	${GET_COMMITMENTS_BY_PROVIDER}
`;

const GET_COMMITMENTS_BY_RECEIVER_QUERY = gql`
	${GET_COMMITMENTS_BY_RECEIVER}
`;

const GET_UNFULFILLED_COMMITMENTS_QUERY = gql`
	${GET_UNFULFILLED_COMMITMENTS}
`;

const CREATE_COMMITMENT_MUTATION = gql`
	${CREATE_COMMITMENT}
`;

const UPDATE_COMMITMENT_MUTATION = gql`
	${UPDATE_COMMITMENT}
`;

const DELETE_COMMITMENT_MUTATION = gql`
	${DELETE_COMMITMENT}
`;

const FULFILL_COMMITMENT_MUTATION = gql`
	${FULFILL_COMMITMENT}
`;

const SATISFY_INTENT_MUTATION = gql`
	${SATISFY_INTENT}
`;

/**
 * Creates a commitments store that manages commitment-related state and operations.
 * Uses the hREA service to perform GraphQL operations with proper validation.
 *
 * @returns An object with commitment state and methods
 */
function createCommitmentsStore(): CommitmentsStore {
    // State
    let commitments: Commitment[] = $state([]);
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
            console.error('Commitments store operation failed:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    /**
     * Validates commitment data to ensure all required foundation components exist
     */
    async function validateCommitmentData(commitment: CommitmentCreateParams): Promise<string[]> {
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
        if (!actionsStore.getActionById(commitment.action)) {
            errors.push(
                `Action "${commitment.action}" not found. Available actions: ${actionsStore.actions.map((a) => a.id).join(', ')}`
            );
        }

        // Validate Provider Agent exists (if provided)
        if (commitment.provider && !agentsStore.getAgentById(commitment.provider)) {
            errors.push(`Provider agent "${commitment.provider}" not found`);
        }

        // Validate Receiver Agent exists (if provided)
        if (commitment.receiver && !agentsStore.getAgentById(commitment.receiver)) {
            errors.push(`Receiver agent "${commitment.receiver}" not found`);
        }

        // Validate ResourceSpecification exists (if provided)
        if (
            commitment.resourceConformsTo &&
            !resourcesStore.getResourceSpecificationById(commitment.resourceConformsTo)
        ) {
            errors.push(`Resource specification "${commitment.resourceConformsTo}" not found`);
        }

        // Validate Resource exists (if provided)
        if (
            commitment.resourceInventoriedAs &&
            !resourcesStore.getResourceById(commitment.resourceInventoriedAs)
        ) {
            errors.push(`Resource "${commitment.resourceInventoriedAs}" not found`);
        }

        // Validate Units in quantities (if provided)
        if (
            commitment.resourceQuantity?.hasUnit &&
            !unitsStore.getUnitById(commitment.resourceQuantity.hasUnit)
        ) {
            errors.push(`Unit "${commitment.resourceQuantity.hasUnit}" not found for resource quantity`);
        }

        if (
            commitment.effortQuantity?.hasUnit &&
            !unitsStore.getUnitById(commitment.effortQuantity.hasUnit)
        ) {
            errors.push(`Unit "${commitment.effortQuantity.hasUnit}" not found for effort quantity`);
        }

        // Validate datetime fields
        if (commitment.hasBeginning && commitment.hasEnd) {
            const beginning = new Date(commitment.hasBeginning);
            const end = new Date(commitment.hasEnd);
            if (beginning >= end) {
                errors.push('Commitment beginning time must be before end time');
            }
        }

        // Validate due date
        if (commitment.due) {
            const due = new Date(commitment.due);
            const now = new Date();
            if (due < now) {
                errors.push('Commitment due date cannot be in the past');
            }
        }

        return errors;
    }

    /**
     * Fetches all commitments from the hREA system.
     */
    async function fetchAllCommitments(): Promise<void> {
        if (loading) return;

        return withLoadingState(
            async () => {
                if (!hreaService.isInitialized) {
                    await hreaService.initialize();
                }

                if (!hreaService.apolloClient) {
                    throw new Error('Apollo client is not available');
                }

                const result = await hreaService.apolloClient.query<GetCommitmentsResponse>({
                    query: GET_ALL_COMMITMENTS,
                    fetchPolicy: 'cache-first'
                });

                commitments = (result.data.commitments?.edges || []).map((edge) => edge.node);
                console.log(`Fetched ${commitments.length} commitments`);
            },
            (value) => (loading = value),
            (value) => (error = value)
        );
    }

    /**
     * Creates a new commitment in the hREA system with proper validation.
     */
    async function createCommitment(commitmentData: CommitmentCreateParams): Promise<Commitment> {
        return withLoadingState(
            async () => {
                // Validate commitment data first
                const validationErrors = await validateCommitmentData(commitmentData);
                if (validationErrors.length > 0) {
                    throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
                }

                if (!hreaService.isInitialized) {
                    await hreaService.initialize();
                }

                if (!hreaService.apolloClient) {
                    throw new Error('Apollo client is not available');
                }

                const result = await hreaService.apolloClient.mutate<CreateCommitmentResponse>({
                    mutation: CREATE_COMMITMENT_MUTATION,
                    variables: {
                        commitment: commitmentData
                    }
                });

                const newCommitment = result.data?.createCommitment.commitment;
                if (!newCommitment) {
                    throw new Error('Failed to create commitment - no data returned');
                }

                commitments = [...commitments, newCommitment];
                console.log('Created new commitment:', newCommitment);
                return newCommitment;
            },
            (value) => (loading = value),
            (value) => (error = value)
        );
    }

    /**
     * Updates an existing commitment in the hREA system.
     */
    async function updateCommitment(id: string, commitmentData: CommitmentUpdateParams): Promise<Commitment> {
        return withLoadingState(
            async () => {
                if (!hreaService.isInitialized) {
                    await hreaService.initialize();
                }

                if (!hreaService.apolloClient) {
                    throw new Error('Apollo client is not available');
                }

                const result = await hreaService.apolloClient.mutate<UpdateCommitmentResponse>({
                    mutation: UPDATE_COMMITMENT_MUTATION,
                    variables: {
                        id,
                        commitment: commitmentData
                    }
                });

                const updatedCommitment = result.data?.updateCommitment.commitment;
                if (!updatedCommitment) {
                    throw new Error('Failed to update commitment - no data returned');
                }

                commitments = commitments.map((commitment) =>
                    commitment.id === id ? updatedCommitment : commitment
                );
                console.log('Updated commitment:', updatedCommitment);
                return updatedCommitment;
            },
            (value) => (loading = value),
            (value) => (error = value)
        );
    }

    /**
     * Deletes a commitment from the hREA system.
     */
    async function deleteCommitment(id: string): Promise<void> {
        return withLoadingState(
            async () => {
                if (!hreaService.isInitialized) {
                    await hreaService.initialize();
                }

                if (!hreaService.apolloClient) {
                    throw new Error('Apollo client is not available');
                }

                const result = await hreaService.apolloClient.mutate<DeleteCommitmentResponse>({
                    mutation: DELETE_COMMITMENT_MUTATION,
                    variables: { id }
                });

                if (!result.data?.deleteCommitment) {
                    throw new Error('Failed to delete commitment');
                }

                commitments = commitments.filter((commitment) => commitment.id !== id);
                console.log('Deleted commitment:', id);
            },
            (value) => (loading = value),
            (value) => (error = value)
        );
    }

    /**
     * Gets a commitment by its ID.
     */
    function getCommitmentById(id: string): Commitment | undefined {
        return commitments.find((commitment) => commitment.id === id);
    }

    /**
     * Gets commitments by provider agent ID.
     */
    function getCommitmentsByProvider(providerId: string): Commitment[] {
        return commitments.filter((commitment) => commitment.provider?.id === providerId);
    }

    /**
     * Gets commitments by receiver agent ID.
     */
    function getCommitmentsByReceiver(receiverId: string): Commitment[] {
        return commitments.filter((commitment) => commitment.receiver?.id === receiverId);
    }

    /**
     * Gets unfulfilled commitments.
     */
    function getUnfulfilledCommitments(): Commitment[] {
        return commitments.filter((commitment) =>
            !commitment.fulfilledBy || commitment.fulfilledBy.length === 0
        );
    }

    /**
     * Fulfills a commitment by linking it to an economic event.
     */
    async function fulfillCommitment(commitmentId: string, eventId: string): Promise<Commitment> {
        return withLoadingState(
            async () => {
                if (!hreaService.isInitialized) {
                    await hreaService.initialize();
                }

                if (!hreaService.apolloClient) {
                    throw new Error('Apollo client is not available');
                }

                const result = await hreaService.apolloClient.mutate({
                    mutation: FULFILL_COMMITMENT_MUTATION,
                    variables: {
                        commitmentId,
                        eventId
                    }
                });

                const updatedCommitment = result.data?.fulfillCommitment.commitment;
                if (!updatedCommitment) {
                    throw new Error('Failed to fulfill commitment - no data returned');
                }

                commitments = commitments.map((commitment) =>
                    commitment.id === commitmentId ? updatedCommitment : commitment
                );
                console.log('Fulfilled commitment:', updatedCommitment);
                return updatedCommitment;
            },
            (value) => (loading = value),
            (value) => (error = value)
        );
    }

    /**
     * Links a commitment to an intent (commitment satisfies the intent).
     */
    async function satisfyIntent(commitmentId: string, intentId: string): Promise<{ commitment: Commitment; intent: Intent }> {
        return withLoadingState(
            async () => {
                if (!hreaService.isInitialized) {
                    await hreaService.initialize();
                }

                if (!hreaService.apolloClient) {
                    throw new Error('Apollo client is not available');
                }

                const result = await hreaService.apolloClient.mutate({
                    mutation: SATISFY_INTENT_MUTATION,
                    variables: {
                        commitmentId,
                        intentId
                    }
                });

                const updatedCommitment = result.data?.satisfyIntent.commitment;
                const updatedIntent = result.data?.satisfyIntent.intent;

                if (!updatedCommitment || !updatedIntent) {
                    throw new Error('Failed to satisfy intent - no data returned');
                }

                commitments = commitments.map((commitment) =>
                    commitment.id === commitmentId ? updatedCommitment : commitment
                );

                console.log('Satisfied intent:', { commitment: updatedCommitment, intent: updatedIntent });
                return { commitment: updatedCommitment, intent: updatedIntent };
            },
            (value) => (loading = value),
            (value) => (error = value)
        );
    }

    /**
     * Gets commitment statistics for a specific agent.
     */
    function getCommitmentStatsByAgent(agentId: string) {
        const provided = commitments.filter((commitment) => commitment.provider?.id === agentId);
        const received = commitments.filter((commitment) => commitment.receiver?.id === agentId);
        const fulfilled = commitments.filter((commitment) =>
            (commitment.provider?.id === agentId || commitment.receiver?.id === agentId) &&
            commitment.fulfilledBy && commitment.fulfilledBy.length > 0
        );
        const unfulfilled = commitments.filter((commitment) =>
            (commitment.provider?.id === agentId || commitment.receiver?.id === agentId) &&
            (!commitment.fulfilledBy || commitment.fulfilledBy.length === 0)
        );

        return {
            total: provided.length + received.length,
            provided: provided.length,
            received: received.length,
            fulfilled: fulfilled.length,
            unfulfilled: unfulfilled.length
        };
    }

    return {
        // Getters
        get commitments() {
            return commitments;
        },
        get loading() {
            return loading;
        },
        get error() {
            return error;
        },

        // Methods
        fetchAllCommitments,
        createCommitment,
        updateCommitment,
        deleteCommitment,
        getCommitmentById,
        getCommitmentsByProvider,
        getCommitmentsByReceiver,
        getUnfulfilledCommitments,
        fulfillCommitment,
        satisfyIntent,
        validateCommitmentData,
        getCommitmentStatsByAgent
    };
}

const commitmentsStore = createCommitmentsStore();
export default commitmentsStore; 