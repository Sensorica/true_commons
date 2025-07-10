import { gql } from '@apollo/client/core';
import hreaService from '../services/hrea.service.svelte';
import type {
	Action,
	GetActionsResponse,
	CreateActionResponse,
	UpdateActionResponse,
	ActionCreateParams,
	ActionUpdateParams
} from '../graphql/types';
import { GET_ACTIONS } from '../graphql/queries';
import {
	CREATE_ACTION_MUTATION,
	UPDATE_ACTION_MUTATION,
	DELETE_ACTION_MUTATION
} from '../graphql/mutations';
import { DEFAULT_ACTIONS } from '../data';

export interface ActionsStore {
	readonly actions: Action[];
	readonly loading: boolean;
	readonly error: string | null;
	fetchAllActions(): Promise<void>;
	createAction(action: ActionCreateParams): Promise<Action>;
	updateAction(id: string, action: ActionUpdateParams): Promise<Action>;
	deleteAction(id: string): Promise<void>;
	initializeDefaultActions(): Promise<void>;
	getActionById(id: string): Action | null;
}

// Convert string queries to gql documents
const GET_ALL_ACTIONS = gql`
	${GET_ACTIONS}
`;

/**
 * Creates an actions store that manages Action-related state and operations.
 * Uses the hREA service to perform GraphQL operations with foundation Actions.
 *
 * @returns An object with actions state and methods
 */
function createActionsStore(): ActionsStore {
	// State
	let actions: Action[] = $state([]);
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
			console.error('Actions store operation failed:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	}

	/**
	 * Fetches all actions from the hREA system.
	 */
	async function fetchAllActions(): Promise<void> {
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

					const result = await hreaService.apolloClient.query<GetActionsResponse>({
						query: GET_ALL_ACTIONS,
						fetchPolicy: 'cache-first'
					});

					// Defensive handling of GraphQL query result
					if (result.data && result.data.actions) {
						actions = Array.isArray(result.data.actions) ? result.data.actions : [];
					} else {
						// If no actions found, initialize as empty array
						actions = [];
						console.warn('No actions found in GraphQL response, initializing empty array');
					}

					console.log(`Fetched ${actions.length} actions`);
				} catch (err) {
					console.error('Failed to fetch actions from GraphQL:', err);
					// On GraphQL failure, initialize empty array to prevent .map() errors
					actions = [];
					// Re-throw to trigger error handling
					throw err;
				}
			},
			(value) => (loading = value),
			(value) => (error = value)
		);
	}

	/**
	 * Creates a new action in the hREA system.
	 */
	async function createAction(actionData: ActionCreateParams): Promise<Action> {
		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				const result = await hreaService.apolloClient.mutate<CreateActionResponse>({
					mutation: CREATE_ACTION_MUTATION,
					variables: {
						id: actionData.id,
						label: actionData.label,
						resourceEffect: actionData.resourceEffect
					}
				});

				const newAction = result.data?.createAction.action;
				if (!newAction) {
					throw new Error('Failed to create action - no data returned');
				}

				actions = [...actions, newAction];
				console.log('Created new action:', newAction.id);

				return newAction;
			},
			(value) => (loading = value),
			(value) => (error = value)
		);
	}

	/**
	 * Updates an existing action in the hREA system.
	 */
	async function updateAction(id: string, actionData: ActionUpdateParams): Promise<Action> {
		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				const result = await hreaService.apolloClient.mutate<UpdateActionResponse>({
					mutation: UPDATE_ACTION_MUTATION,
					variables: {
						id,
						label: actionData.label,
						resourceEffect: actionData.resourceEffect
					}
				});

				const updatedAction = result.data?.updateAction.action;
				if (!updatedAction) {
					throw new Error('Failed to update action - no data returned');
				}

				// Update in local store
				const index = actions.findIndex((a) => a.id === id);
				if (index !== -1) {
					actions[index] = updatedAction;
				}

				console.log('Updated action:', id);
				return updatedAction;
			},
			(value) => (loading = value),
			(value) => (error = value)
		);
	}

	/**
	 * Deletes an action from the hREA system.
	 */
	async function deleteAction(id: string): Promise<void> {
		return withLoadingState(
			async () => {
				if (!hreaService.isInitialized) {
					await hreaService.initialize();
				}

				if (!hreaService.apolloClient) {
					throw new Error('Apollo client is not available');
				}

				await hreaService.apolloClient.mutate({
					mutation: DELETE_ACTION_MUTATION,
					variables: { id }
				});

				// Remove from local store
				actions = actions.filter((a) => a.id !== id);
				console.log('Deleted action:', id);
			},
			(value) => (loading = value),
			(value) => (error = value)
		);
	}

	/**
	 * Initializes the default actions required by ValueFlows.
	 * This creates the foundation actions needed for proper operation.
	 */
	async function initializeDefaultActions(): Promise<void> {
		console.log('Initializing default actions...');

		// First fetch existing actions to check what we already have
		await fetchAllActions();

		const existingActionIds = new Set(actions.map((a) => a.id));

		// Create only the actions that don't exist yet
		for (const defaultAction of DEFAULT_ACTIONS) {
			if (!existingActionIds.has(defaultAction.id)) {
				try {
					await createAction(defaultAction);
					console.log(`Created default action: ${defaultAction.label}`);
				} catch (err) {
					console.warn(`Failed to create default action ${defaultAction.label}:`, err);
					// Continue with other actions even if one fails
				}
			} else {
				console.log(`Action ${defaultAction.label} already exists, skipping...`);
			}
		}

		console.log('Default actions initialization completed');
	}

	/**
	 * Gets an action by its ID.
	 */
	function getActionById(id: string): Action | null {
		return actions.find((a) => a.id === id) || null;
	}

	return {
		// Getters
		get actions() {
			return actions;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},

		// Methods
		fetchAllActions,
		createAction,
		updateAction,
		deleteAction,
		initializeDefaultActions,
		getActionById
	};
}

const actionsStore = createActionsStore();
export default actionsStore;
