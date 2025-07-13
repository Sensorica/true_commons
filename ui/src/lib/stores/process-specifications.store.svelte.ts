import { gql } from '@apollo/client/core';
import hreaService from '../services/hrea.service.svelte';
import foundationService from '../services/foundation.service.svelte';
import type {
	ProcessSpecification,
	ProcessSpecificationCreateParams,
	ProcessSpecificationUpdateParams,
	GetProcessSpecificationsResponse,
	CreateProcessSpecificationResponse,
	UpdateProcessSpecificationResponse,
	DeleteProcessSpecificationResponse
} from '../graphql/types';
import { GET_PROCESS_SPECIFICATIONS } from '../graphql/queries';
import {
	CREATE_PROCESS_SPECIFICATION,
	UPDATE_PROCESS_SPECIFICATION,
	DELETE_PROCESS_SPECIFICATION
} from '../graphql/mutations';

export interface ProcessSpecificationsStore {
	readonly processSpecifications: ProcessSpecification[];
	readonly loading: boolean;
	readonly error: string | null;
	fetchAllProcessSpecifications(): Promise<void>;
	createProcessSpecification(
		processSpec: ProcessSpecificationCreateParams
	): Promise<ProcessSpecification>;
	updateProcessSpecification(
		id: string,
		processSpec: ProcessSpecificationUpdateParams
	): Promise<ProcessSpecification>;
	deleteProcessSpecification(id: string): Promise<void>;
	getProcessSpecificationById(id: string): ProcessSpecification | undefined;
	validateProcessSpecificationData(
		processSpec: ProcessSpecificationCreateParams
	): Promise<string[]>;
}

// Convert string queries to gql documents
const GET_ALL_PROCESS_SPECIFICATIONS = gql`
	${GET_PROCESS_SPECIFICATIONS}
`;

const CREATE_PROCESS_SPECIFICATION_MUTATION = gql`
	${CREATE_PROCESS_SPECIFICATION}
`;

const UPDATE_PROCESS_SPECIFICATION_MUTATION = gql`
	${UPDATE_PROCESS_SPECIFICATION}
`;

const DELETE_PROCESS_SPECIFICATION_MUTATION = gql`
	${DELETE_PROCESS_SPECIFICATION}
`;

/**
 * Creates a process specifications store that manages process specification-related state and operations.
 * Uses the hREA service to perform GraphQL operations with proper validation.
 *
 * @returns An object with process specification state and methods
 */
function createProcessSpecificationsStore(): ProcessSpecificationsStore {
	// State
	let processSpecifications: ProcessSpecification[] = $state([]);
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
			console.error('Process specifications store operation failed:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	}

	/**
	 * Validates process specification data
	 */
	async function validateProcessSpecificationData(
		processSpec: ProcessSpecificationCreateParams
	): Promise<string[]> {
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
		if (!processSpec.name?.trim()) {
			errors.push('Process specification name is required');
		}

		// Check for duplicate names
		const existingSpec = processSpecifications.find(
			(spec) => spec.name.toLowerCase() === processSpec.name.toLowerCase()
		);
		if (existingSpec) {
			errors.push(`Process specification "${processSpec.name}" already exists`);
		}

		return errors;
	}

	/**
	 * Fetches all process specifications from the hREA system.
	 */
	async function fetchAllProcessSpecifications(): Promise<void> {
		if (loading) return;

		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				const result = await hreaService.apolloClient.query<GetProcessSpecificationsResponse>({
					query: GET_ALL_PROCESS_SPECIFICATIONS,
					fetchPolicy: 'cache-first'
				});

				processSpecifications = (result.data.processSpecifications?.edges || []).map(
					(edge) => edge.node
				);
				console.log(`Fetched ${processSpecifications.length} process specifications`);
			},
			(value) => (loading = value),
			(value) => (error = value)
		);
	}

	/**
	 * Creates a new process specification in the hREA system with proper validation.
	 */
	async function createProcessSpecification(
		processSpecData: ProcessSpecificationCreateParams
	): Promise<ProcessSpecification> {
		return withLoadingState(
			async () => {
				// Validate process specification data first
				const validationErrors = await validateProcessSpecificationData(processSpecData);
				if (validationErrors.length > 0) {
					throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
				}

				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				const result = await hreaService.apolloClient.mutate<CreateProcessSpecificationResponse>({
					mutation: CREATE_PROCESS_SPECIFICATION_MUTATION,
					variables: {
						processSpecification: processSpecData
					}
				});

				const newProcessSpec = result.data?.createProcessSpecification.processSpecification;
				if (!newProcessSpec) {
					throw new Error('Failed to create process specification - no data returned');
				}

				processSpecifications = [...processSpecifications, newProcessSpec];
				console.log('Created new process specification:', newProcessSpec.id);

				return newProcessSpec;
			},
			(value) => (loading = value),
			(value) => (error = value)
		);
	}

	/**
	 * Updates an existing process specification in the hREA system.
	 */
	async function updateProcessSpecification(
		id: string,
		processSpecData: ProcessSpecificationUpdateParams
	): Promise<ProcessSpecification> {
		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				const result = await hreaService.apolloClient.mutate<UpdateProcessSpecificationResponse>({
					mutation: UPDATE_PROCESS_SPECIFICATION_MUTATION,
					variables: {
						id,
						processSpecification: processSpecData
					}
				});

				const updatedProcessSpec = result.data?.updateProcessSpecification.processSpecification;
				if (!updatedProcessSpec) {
					throw new Error('Failed to update process specification - no data returned');
				}

				// Update in local store
				const index = processSpecifications.findIndex((spec) => spec.id === id);
				if (index !== -1) {
					processSpecifications[index] = updatedProcessSpec;
				}

				console.log('Updated process specification:', id);
				return updatedProcessSpec;
			},
			(value) => (loading = value),
			(value) => (error = value)
		);
	}

	/**
	 * Deletes a process specification from the hREA system.
	 */
	async function deleteProcessSpecification(id: string): Promise<void> {
		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				await hreaService.apolloClient.mutate<DeleteProcessSpecificationResponse>({
					mutation: DELETE_PROCESS_SPECIFICATION_MUTATION,
					variables: { id }
				});

				// Remove from local store
				processSpecifications = processSpecifications.filter((spec) => spec.id !== id);
				console.log('Deleted process specification:', id);
			},
			(value) => (loading = value),
			(value) => (error = value)
		);
	}

	/**
	 * Gets a process specification by ID from the local store
	 */
	function getProcessSpecificationById(id: string): ProcessSpecification | undefined {
		return processSpecifications.find((spec) => spec.id === id);
	}

	return {
		// Getters
		get processSpecifications() {
			return processSpecifications;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},

		// Methods
		fetchAllProcessSpecifications,
		createProcessSpecification,
		updateProcessSpecification,
		deleteProcessSpecification,
		getProcessSpecificationById,
		validateProcessSpecificationData
	};
}

const processSpecificationsStore = createProcessSpecificationsStore();
export default processSpecificationsStore;
