import { gql } from '@apollo/client/core';
import hreaService from '../services/hrea.service.svelte';
import type { Agent, GetAgentsResponse, CreatePersonResponse } from '../graphql/types';
import { GET_AGENTS, GET_MY_AGENT } from '../graphql/queries';
import { CREATE_PERSON } from '../graphql/mutations';

export interface AgentsStore {
	readonly agents: Agent[];
	readonly myAgent: Agent | null;
	readonly loading: boolean;
	readonly error: string | null;
	fetchAllAgents(): Promise<void>;
	fetchMyAgent(): Promise<void>;
	createAgent(agent: Partial<Agent>): Promise<Agent>;
	updateAgent(id: string, agent: Partial<Agent>): Promise<Agent>;
	deleteAgent(id: string): Promise<void>;
}

// Convert string queries to gql documents
const GET_ALL_AGENTS = gql`
	${GET_AGENTS}
`;
const GET_MY_AGENT_QUERY = gql`
	${GET_MY_AGENT}
`;
const CREATE_PERSON_MUTATION = gql`
	${CREATE_PERSON}
`;

// Additional mutations that may not exist yet
const UPDATE_AGENT = gql`
	mutation UpdateAgent($id: ID!, $agent: AgentUpdateParams!) {
		updateAgent(id: $id, agent: $agent) {
			agent {
				id
				name
				note
				primaryLocation
				canonicalUrl
			}
		}
	}
`;

const DELETE_AGENT = gql`
	mutation DeleteAgent($id: ID!) {
		deleteAgent(id: $id)
	}
`;

/**
 * Creates an agents store that manages agent-related state and operations.
 * Uses the hREA service to perform GraphQL operations with existing fragments.
 *
 * @returns An object with agent state and methods
 */
function createAgentsStore(): AgentsStore {
	// State
	let agents: Agent[] = $state([]);
	let myAgent: Agent | null = $state(null);
	let loading: boolean = $state(false);
	let error: string | null = $state(null);

	/**
	 * Fetches all agents from the hREA system.
	 */
	async function fetchAllAgents(): Promise<void> {
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

			const result = await hreaService.apolloClient.query<GetAgentsResponse>({
				query: GET_ALL_AGENTS,
				fetchPolicy: 'cache-first'
			});

			agents = (result.data.agents?.edges || []).map((edge) => edge.node);
			console.log(`Fetched ${agents.length} agents`);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error = `Failed to fetch agents: ${errorMessage}`;
			console.error(error, err);
		} finally {
			loading = false;
		}
	}

	/**
	 * Fetches the current user's agent profile.
	 */
	async function fetchMyAgent(): Promise<void> {
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

			const result = await hreaService.apolloClient.query({
				query: GET_MY_AGENT_QUERY,
				fetchPolicy: 'cache-first'
			});

			myAgent = result.data.myAgent || null;
			console.log('Fetched my agent profile:', myAgent?.id);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error = `Failed to fetch my agent: ${errorMessage}`;
			console.error(error, err);
		} finally {
			loading = false;
		}
	}

	/**
	 * Creates a new agent (person) in the hREA system.
	 */
	async function createAgent(agentData: Partial<Agent>): Promise<Agent> {
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

			const result = await hreaService.apolloClient.mutate<CreatePersonResponse>({
				mutation: CREATE_PERSON_MUTATION,
				variables: {
					person: agentData
				}
			});

			const newAgent = result.data?.createPerson.agent;
			if (!newAgent) {
				throw new Error('Failed to create agent - no data returned');
			}

			agents = [...agents, newAgent];
			console.log('Created new agent:', newAgent.id);

			return newAgent;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error = `Failed to create agent: ${errorMessage}`;
			console.error(error, err);
			throw err;
		} finally {
			loading = false;
		}
	}

	/**
	 * Updates an existing agent in the hREA system.
	 */
	async function updateAgent(id: string, agentData: Partial<Agent>): Promise<Agent> {
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
				mutation: UPDATE_AGENT,
				variables: {
					id,
					agent: agentData
				}
			});

			const updatedAgent = result.data.updateAgent.agent;
			agents = agents.map((agent) => (agent.id === id ? updatedAgent : agent));

			// Update myAgent if it's the same agent
			if (myAgent?.id === id) {
				myAgent = updatedAgent;
			}

			console.log('Updated agent:', id);

			return updatedAgent;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error = `Failed to update agent: ${errorMessage}`;
			console.error(error, err);
			throw err;
		} finally {
			loading = false;
		}
	}

	/**
	 * Deletes an agent from the hREA system.
	 */
	async function deleteAgent(id: string): Promise<void> {
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
				mutation: DELETE_AGENT,
				variables: { id }
			});

			agents = agents.filter((agent) => agent.id !== id);

			// Clear myAgent if it's the deleted agent
			if (myAgent?.id === id) {
				myAgent = null;
			}

			console.log('Deleted agent:', id);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			error = `Failed to delete agent: ${errorMessage}`;
			console.error(error, err);
			throw err;
		} finally {
			loading = false;
		}
	}

	return {
		// Getters
		get agents() {
			return agents;
		},
		get myAgent() {
			return myAgent;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},

		// Methods
		fetchAllAgents,
		fetchMyAgent,
		createAgent,
		updateAgent,
		deleteAgent
	};
}

const agentsStore = createAgentsStore();
export default agentsStore;
