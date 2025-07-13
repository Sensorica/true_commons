import { gql } from '@apollo/client/core';
import hreaService from '../services/hrea.service.svelte';
import type {
	Agent,
	GetAgentsResponse,
	CreatePersonResponse,
	AgentCreateParams
} from '../graphql/types';
import { GET_AGENTS, GET_MY_AGENT } from '../graphql/queries';
import { CREATE_PERSON, UPDATE_AGENT, DELETE_AGENT } from '../graphql/mutations';

export interface AgentsStore {
	readonly agents: Agent[];
	readonly myAgent: Agent | null;
	readonly loading: boolean;
	readonly error: string | null;
	fetchAllAgents(): Promise<void>;
	fetchMyAgent(): Promise<void>;
	createAgent(agent: AgentCreateParams): Promise<Agent>;
	updateAgent(id: string, agent: Partial<Agent>): Promise<Agent>;
	deleteAgent(id: string): Promise<void>;
	getAgentById(id: string): Agent | null;
	// Testing helpers
	setMyAgentFromLocalStorage(agentId: string): void;
	clearMyAgentFromLocalStorage(): void;
	saveMyAgentToLocalStorage(agent: Agent): void;
	loadMyAgentFromStorage(): void;
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
	 * Falls back to empty state if Holochain/GraphQL is not available.
	 */
	async function fetchAllAgents(): Promise<void> {
		if (loading) return;

		loading = true;
		error = null;

		try {
			// Try to ensure hREA service is initialized
			if (!hreaService.isInitialized) {
				await hreaService.initialize();
			}

			if (!hreaService.apolloClient) {
				console.warn('Apollo client is not available - working in offline mode');
				agents = [];
				loadMyAgentFromStorage();
				return;
			}

			const result = await hreaService.apolloClient.query<GetAgentsResponse>({
				query: GET_ALL_AGENTS,
				fetchPolicy: 'cache-first'
			});

			agents = (result.data.agents?.edges || []).map((edge) => edge.node);
			console.log(`Fetched ${agents.length} agents from GraphQL`);

			// Try to restore myAgent from localStorage now that agents are loaded
			loadMyAgentFromStorage();
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			console.warn(`GraphQL unavailable, working in offline mode: ${errorMessage}`);
			console.debug('Full error details:', err);

			// Clear error state and work with empty agents list for development
			error = null;
			agents = [];

			// Still try to restore myAgent from localStorage
			loadMyAgentFromStorage();
		} finally {
			loading = false;
		}
	}

	/**
	 * Loads myAgent from localStorage if available.
	 * This is called synchronously to restore persisted state.
	 */
	function loadMyAgentFromStorage(): void {
		const storedAgentId = localStorage.getItem('true_commons_my_agent_id');
		if (storedAgentId && agents.length > 0) {
			const storedAgent = agents.find((agent) => agent.id === storedAgentId);
			if (storedAgent) {
				myAgent = storedAgent;
				console.log('Loaded myAgent from localStorage:', myAgent.id);
			}
		}
	}

	/**
	 * Fetches the current user's agent profile.
	 * Falls back to localStorage for testing if the GraphQL query fails.
	 */
	async function fetchMyAgent(): Promise<void> {
		// Don't proceed if we're already loading agents
		if (loading) {
			console.log('Skipping fetchMyAgent - agents are currently loading');
			return;
		}

		try {
			// Check localStorage first for immediate restore
			const storedAgentId = localStorage.getItem('true_commons_my_agent_id');
			if (storedAgentId && agents.length > 0) {
				const storedAgent = agents.find((agent) => agent.id === storedAgentId);
				if (storedAgent) {
					myAgent = storedAgent;
					console.log('Using stored agent from localStorage:', myAgent.id);
					return;
				}
			}

			// If we don't have a stored agent or agents aren't loaded yet, try GraphQL
			if (!hreaService.isInitialized) {
				await hreaService.initialize();
			}

			if (!hreaService.apolloClient) {
				console.log('Apollo client not available, using localStorage fallback only');
				return;
			}

			const result = await hreaService.apolloClient.query({
				query: GET_MY_AGENT_QUERY,
				fetchPolicy: 'cache-first'
			});

			myAgent = result.data.myAgent || null;
			if (myAgent) {
				// Save to localStorage for persistence
				localStorage.setItem('true_commons_my_agent_id', myAgent.id);
				console.log('Fetched my agent profile from GraphQL:', myAgent.id);
			}
		} catch (err) {
			// Fallback to localStorage - try again after agents are loaded
			const storedAgentId = localStorage.getItem('true_commons_my_agent_id');
			if (storedAgentId && agents.length > 0) {
				const storedAgent = agents.find((agent) => agent.id === storedAgentId);
				if (storedAgent) {
					myAgent = storedAgent;
					console.log('Fallback: Using stored agent from localStorage:', myAgent.id);
					return;
				}
			}

			const errorMessage = err instanceof Error ? err.message : 'Unknown error';
			console.warn(`Failed to fetch my agent: ${errorMessage}`);
		}
	}

	/**
	 * Creates a new agent (person) in the hREA system.
	 * Falls back to mock agent creation when GraphQL is not available.
	 */
	async function createAgent(agentData: AgentCreateParams): Promise<Agent> {
		if (loading) {
			throw new Error('Another operation is in progress');
		}

		loading = true;
		error = null;

		try {
			// Try to ensure hREA service is initialized
			if (!hreaService.isInitialized) {
				await hreaService.initialize();
			}

			if (!hreaService.apolloClient) {
				console.warn('GraphQL not available - creating mock agent for development');

				// Create mock agent for development
				const mockAgent: Agent = {
					id: `mock-agent-${Date.now()}`,
					name: agentData.name,
					note: agentData.note || '',
					primaryLocation: undefined,
					canonicalUrl: undefined
				};

				agents = [...agents, mockAgent];
				console.log('Created mock agent:', mockAgent.id);

				// Auto-set as myAgent and save to localStorage for testing
				saveMyAgentToLocalStorage(mockAgent);

				return mockAgent;
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
			console.log('Created new agent via GraphQL:', newAgent.id);

			// Auto-set as myAgent and save to localStorage for testing
			saveMyAgentToLocalStorage(newAgent);

			return newAgent;
		} catch {
			console.warn('GraphQL agent creation failed, creating mock agent');

			// Fallback to mock agent creation
			const mockAgent: Agent = {
				id: `mock-agent-${Date.now()}`,
				name: agentData.name,
				note: agentData.note || '',
				primaryLocation: undefined,
				canonicalUrl: undefined
			};

			agents = [...agents, mockAgent];
			console.log('Created fallback mock agent:', mockAgent.id);

			// Auto-set as myAgent and save to localStorage for testing
			saveMyAgentToLocalStorage(mockAgent);

			return mockAgent;
		} finally {
			loading = false;
		}
	}

	/**
	 * Updates an existing agent in the hREA system.
	 * Falls back to mock update when GraphQL is not available.
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
				console.warn('GraphQL not available - updating mock agent for development');

				// Find the agent to update
				const existingAgent = agents.find((agent) => agent.id === id);
				if (!existingAgent) {
					throw new Error(`Agent with id ${id} not found`);
				}

				// Create updated agent
				const updatedAgent: Agent = {
					...existingAgent,
					...agentData
				};

				// Update in local store
				agents = agents.map((agent) => (agent.id === id ? updatedAgent : agent));

				// Update myAgent if it's the same agent
				if (myAgent?.id === id) {
					myAgent = updatedAgent;
				}

				console.log('Updated mock agent:', id);
				return updatedAgent;
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

			console.log('Updated agent via GraphQL:', id);

			return updatedAgent;
		} catch {
			console.warn('GraphQL agent update failed, falling back to mock update');

			// Fallback to mock update
			const existingAgent = agents.find((agent) => agent.id === id);
			if (!existingAgent) {
				throw new Error(`Agent with id ${id} not found`);
			}

			const updatedAgent: Agent = {
				...existingAgent,
				...agentData
			};

			// Update in local store
			agents = agents.map((agent) => (agent.id === id ? updatedAgent : agent));

			// Update myAgent if it's the same agent
			if (myAgent?.id === id) {
				myAgent = updatedAgent;
			}

			console.log('Updated fallback mock agent:', id);
			return updatedAgent;
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

	/**
	 * Gets an agent by ID
	 */
	function getAgentById(id: string): Agent | null {
		return agents.find((agent) => agent.id === id) || null;
	}

	/**
	 * Sets myAgent from localStorage by agent ID (for testing)
	 */
	function setMyAgentFromLocalStorage(agentId: string): void {
		const agent = agents.find((a) => a.id === agentId);
		if (agent) {
			myAgent = agent;
			localStorage.setItem('true_commons_my_agent_id', agentId);
			console.log('Set myAgent from localStorage:', agentId);
		} else {
			console.error('Agent not found in current agents list:', agentId);
		}
	}

	/**
	 * Clears myAgent from localStorage (for testing)
	 */
	function clearMyAgentFromLocalStorage(): void {
		myAgent = null;
		localStorage.removeItem('true_commons_my_agent_id');
		console.log('Cleared myAgent from localStorage');
	}

	/**
	 * Saves an agent as myAgent to localStorage (for testing)
	 */
	function saveMyAgentToLocalStorage(agent: Agent): void {
		myAgent = agent;
		localStorage.setItem('true_commons_my_agent_id', agent.id);
		console.log('Saved myAgent to localStorage:', agent.id);
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
		deleteAgent,
		getAgentById,

		// Testing helpers
		setMyAgentFromLocalStorage,
		clearMyAgentFromLocalStorage,
		saveMyAgentToLocalStorage,
		loadMyAgentFromStorage
	};
}

const agentsStore = createAgentsStore();
export default agentsStore;
