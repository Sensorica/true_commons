import holochainClientService from './holochain_client_service.svelte';
import graphqlService, {
	GET_AGENTS,
	GET_MY_AGENT,
	GET_ECONOMIC_RESOURCES,
	GET_ECONOMIC_EVENTS,
	GET_ACTIONS,
	CREATE_PERSON,
	CREATE_ECONOMIC_EVENT,
	UPDATE_ECONOMIC_RESOURCE,
	type Agent,
	type EconomicResource,
	type EconomicEvent,
	type Action,
	type GetMyAgentResponse,
	type GetAgentsResponse,
	type GetEconomicResourcesResponse,
	type GetEconomicEventsResponse,
	type GetActionsResponse,
	type CreatePersonResponse,
	type CreateEconomicEventResponse,
	type UpdateEconomicResourceResponse
} from './graphql_service..svelte.js';

// True Commons specific types extending hREA
export interface TrueCommonsResource extends EconomicResource {
	tags?: string[];
	license?: string;
	fork_count?: number;
	usage_count?: number;
	created_at?: string;
	updated_at?: string;
}

export interface TrueCommonsAgent extends Agent {
	agent_type?: 'Person' | 'Organization' | 'EcologicalAgent';
	reputation_score?: number;
	contributions_count?: number;
	joined_at?: string;
}

export interface TrueCommonsEvent extends EconomicEvent {
	context?: 'resource_creation' | 'resource_fork' | 'resource_use' | 'collaboration' | 'governance';
	impact_score?: number;
}

export interface NetworkStats {
	total_agents: number;
	total_resources: number;
	total_events: number;
	total_value_created: number;
	active_collaborations: number;
}

export interface TrueCommonsService {
	isConnected: boolean;

	// Connection methods
	connect(): Promise<void>;

	// Agent methods
	getMyAgent(): Promise<TrueCommonsAgent | null>;
	getAllAgents(): Promise<TrueCommonsAgent[]>;
	createAgent(agent: Partial<TrueCommonsAgent>): Promise<TrueCommonsAgent>;

	// Resource methods
	getAllResources(): Promise<TrueCommonsResource[]>;
	getResource(id: string): Promise<TrueCommonsResource | null>;
	createResource(resource: Partial<TrueCommonsResource>): Promise<TrueCommonsResource>;
	updateResource(id: string, resource: Partial<TrueCommonsResource>): Promise<TrueCommonsResource>;
	forkResource(
		originalId: string,
		newResource: Partial<TrueCommonsResource>
	): Promise<TrueCommonsResource>;
	searchResourcesByTag(tag: string): Promise<TrueCommonsResource[]>;

	// Economic event methods
	getAllEvents(): Promise<TrueCommonsEvent[]>;
	createEvent(event: Partial<TrueCommonsEvent>): Promise<TrueCommonsEvent>;
	getResourceEvents(resourceId: string): Promise<TrueCommonsEvent[]>;
	getAgentEvents(agentId: string): Promise<TrueCommonsEvent[]>;

	// True Commons specific methods
	useResource(resourceId: string, effort?: number, note?: string): Promise<TrueCommonsEvent>;
	getNetworkStats(): Promise<NetworkStats>;
	getAvailableActions(): Promise<Action[]>;

	// Demo data for development
	getDemoData(): {
		agents: TrueCommonsAgent[];
		resources: TrueCommonsResource[];
		events: TrueCommonsEvent[];
		stats: NetworkStats;
	};
}

/**
 * Creates the True Commons service that orchestrates Holochain and GraphQL
 */
function createTrueCommonsService(): TrueCommonsService {
	let isConnected: boolean = $state(false);

	async function connect(): Promise<void> {
		try {
			// Connect to Holochain conductor
			await holochainClientService.connectClient();

			// Connect to GraphQL endpoint (assuming it's running)
			graphqlService.connect('http://localhost:4000/graphql');

			isConnected = true;
			console.log('True Commons service connected successfully');
		} catch (error) {
			console.warn('Could not connect to backend services, running in demo mode:', error);
			isConnected = false;
		}
	}

	async function getMyAgent(): Promise<TrueCommonsAgent | null> {
		if (!isConnected) return null;

		try {
			const result = await graphqlService.query<GetMyAgentResponse>(GET_MY_AGENT);
			return result.myAgent as TrueCommonsAgent;
		} catch (error) {
			console.error('Failed to get my agent:', error);
			return null;
		}
	}

	async function getAllAgents(): Promise<TrueCommonsAgent[]> {
		if (!isConnected) {
			return getDemoData().agents;
		}

		try {
			const result = await graphqlService.query<GetAgentsResponse>(GET_AGENTS);
			return result.agents as TrueCommonsAgent[];
		} catch (error) {
			console.error('Failed to get agents:', error);
			return getDemoData().agents;
		}
	}

	async function createAgent(agent: Partial<TrueCommonsAgent>): Promise<TrueCommonsAgent> {
		if (!isConnected) {
			throw new Error('Cannot create agent in demo mode');
		}

		try {
			const result = await graphqlService.mutation<CreatePersonResponse>(CREATE_PERSON, {
				person: {
					name: agent.name,
					note: agent.note,
					primaryLocation: agent.primaryLocation
				}
			});
			return result.createPerson.agent as TrueCommonsAgent;
		} catch (error) {
			console.error('Failed to create agent:', error);
			throw error;
		}
	}

	async function getAllResources(): Promise<TrueCommonsResource[]> {
		if (!isConnected) {
			return getDemoData().resources;
		}

		try {
			const result =
				await graphqlService.query<GetEconomicResourcesResponse>(GET_ECONOMIC_RESOURCES);
			return result.economicResources as TrueCommonsResource[];
		} catch (error) {
			console.error('Failed to get resources:', error);
			return getDemoData().resources;
		}
	}

	async function getResource(id: string): Promise<TrueCommonsResource | null> {
		const resources = await getAllResources();
		return resources.find((r) => r.id === id) || null;
	}

	async function createResource(
		resource: Partial<TrueCommonsResource>
	): Promise<TrueCommonsResource> {
		if (!isConnected) {
			throw new Error('Cannot create resource in demo mode');
		}

		try {
			const currentAgent = await getMyAgent();
			// Create economic event for resource creation
			const createEvent = {
				action: 'produce', // Standard ValueFlows action for creating resources
				provider: currentAgent?.id,
				resourceQuantity: {
					hasNumericalValue: 1,
					hasUnit: { id: 'one', label: 'Each', symbol: 'ea' }
				},
				hasPointInTime: new Date().toISOString(),
				note: `Created resource: ${resource.name}`
			};

			const result = await graphqlService.mutation<CreateEconomicEventResponse>(
				CREATE_ECONOMIC_EVENT,
				{
					event: createEvent
				}
			);

			return result.createEconomicEvent.economicEvent.resourceInventoriedAs as TrueCommonsResource;
		} catch (error) {
			console.error('Failed to create resource:', error);
			throw error;
		}
	}

	async function updateResource(
		id: string,
		resource: Partial<TrueCommonsResource>
	): Promise<TrueCommonsResource> {
		if (!isConnected) {
			throw new Error('Cannot update resource in demo mode');
		}

		try {
			const result = await graphqlService.mutation<UpdateEconomicResourceResponse>(
				UPDATE_ECONOMIC_RESOURCE,
				{
					resource: {
						id,
						...resource
					}
				}
			);
			return result.updateEconomicResource.economicResource as TrueCommonsResource;
		} catch (error) {
			console.error('Failed to update resource:', error);
			throw error;
		}
	}

	async function forkResource(
		originalId: string,
		newResource: Partial<TrueCommonsResource>
	): Promise<TrueCommonsResource> {
		// Create a new resource based on the original
		const original = await getResource(originalId);
		if (!original) {
			throw new Error('Original resource not found');
		}

		const forkedResource = await createResource({
			...newResource,
			note: `Forked from: ${original.name}. ${newResource.note || ''}`
		});

		// Create a fork event
		const currentAgent = await getMyAgent();
		if (currentAgent) {
			await createEvent({
				action: { id: 'derive-from', label: 'Derive From', resourceEffect: 'increment' },
				provider: currentAgent,
				resourceInventoriedAs: forkedResource,
				note: `Forked resource from ${original.name}`,
				hasPointInTime: new Date().toISOString()
			});
		}

		return forkedResource;
	}

	async function searchResourcesByTag(tag: string): Promise<TrueCommonsResource[]> {
		const allResources = await getAllResources();
		return allResources.filter(
			(resource) =>
				resource.tags?.some((t) => t.toLowerCase().includes(tag.toLowerCase())) ||
				resource.name?.toLowerCase().includes(tag.toLowerCase()) ||
				resource.note?.toLowerCase().includes(tag.toLowerCase())
		);
	}

	async function getAllEvents(): Promise<TrueCommonsEvent[]> {
		if (!isConnected) {
			return getDemoData().events;
		}

		try {
			const result = await graphqlService.query<GetEconomicEventsResponse>(GET_ECONOMIC_EVENTS);
			return result.economicEvents as TrueCommonsEvent[];
		} catch (error) {
			console.error('Failed to get events:', error);
			return getDemoData().events;
		}
	}

	async function createEvent(event: Partial<TrueCommonsEvent>): Promise<TrueCommonsEvent> {
		if (!isConnected) {
			throw new Error('Cannot create event in demo mode');
		}

		try {
			const result = await graphqlService.mutation<CreateEconomicEventResponse>(
				CREATE_ECONOMIC_EVENT,
				{
					event: {
						action: event.action?.id || 'work',
						provider: event.provider?.id,
						receiver: event.receiver?.id,
						resourceInventoriedAs: event.resourceInventoriedAs?.id,
						resourceQuantity: event.resourceQuantity,
						effortQuantity: event.effortQuantity,
						hasPointInTime: event.hasPointInTime || new Date().toISOString(),
						note: event.note
					}
				}
			);
			return result.createEconomicEvent.economicEvent as TrueCommonsEvent;
		} catch (error) {
			console.error('Failed to create event:', error);
			throw error;
		}
	}

	async function getResourceEvents(resourceId: string): Promise<TrueCommonsEvent[]> {
		const allEvents = await getAllEvents();
		return allEvents.filter((event) => event.resourceInventoriedAs?.id === resourceId);
	}

	async function getAgentEvents(agentId: string): Promise<TrueCommonsEvent[]> {
		const allEvents = await getAllEvents();
		return allEvents.filter(
			(event) => event.provider?.id === agentId || event.receiver?.id === agentId
		);
	}

	async function useResource(
		resourceId: string,
		effort?: number,
		note?: string
	): Promise<TrueCommonsEvent> {
		const resource = await getResource(resourceId);
		if (!resource) {
			throw new Error('Resource not found');
		}

		const currentAgent = await getMyAgent();
		if (!currentAgent) {
			throw new Error('No authenticated agent found');
		}

		return await createEvent({
			action: { id: 'use', label: 'Use', resourceEffect: 'no-change' },
			provider: currentAgent,
			resourceInventoriedAs: resource,
			effortQuantity: effort
				? {
						hasNumericalValue: effort,
						hasUnit: { id: 'hour', label: 'Hour', symbol: 'h' }
					}
				: undefined,
			hasPointInTime: new Date().toISOString(),
			note: note || `Used resource: ${resource.name}`,
			context: 'resource_use'
		});
	}

	async function getNetworkStats(): Promise<NetworkStats> {
		if (!isConnected) {
			return getDemoData().stats;
		}

		try {
			const [agents, resources, events] = await Promise.all([
				getAllAgents(),
				getAllResources(),
				getAllEvents()
			]);

			return {
				total_agents: agents.length,
				total_resources: resources.length,
				total_events: events.length,
				total_value_created: events.length * 10, // Simple calculation
				active_collaborations: Math.floor(resources.length / 3)
			};
		} catch (error) {
			console.error('Failed to get network stats:', error);
			return getDemoData().stats;
		}
	}

	async function getAvailableActions(): Promise<Action[]> {
		if (!isConnected) {
			return [
				{ id: 'produce', label: 'Produce', resourceEffect: 'increment' },
				{ id: 'use', label: 'Use', resourceEffect: 'no-change' },
				{ id: 'consume', label: 'Consume', resourceEffect: 'decrement' },
				{ id: 'work', label: 'Work', resourceEffect: 'no-change' },
				{ id: 'derive-from', label: 'Derive From', resourceEffect: 'increment' }
			];
		}

		try {
			const result = await graphqlService.query<GetActionsResponse>(GET_ACTIONS);
			return result.actions as Action[];
		} catch (error) {
			console.error('Failed to get actions:', error);
			return [];
		}
	}

	function getDemoData() {
		const demoAgents: TrueCommonsAgent[] = [
			{
				id: 'agent-1',
				name: 'Bob Martinez',
				note: 'Sustainable farming practitioner',
				primaryLocation: 'Rural California',
				agent_type: 'Person',
				reputation_score: 85,
				contributions_count: 12,
				joined_at: '2024-01-15'
			},
			{
				id: 'agent-2',
				name: 'Lynn Chen',
				note: 'Water systems engineer',
				primaryLocation: 'Portland, Oregon',
				agent_type: 'Person',
				reputation_score: 92,
				contributions_count: 8,
				joined_at: '2024-02-03'
			},
			{
				id: 'agent-3',
				name: 'Community Gardens Collective',
				note: 'Urban agriculture network',
				primaryLocation: 'Global',
				agent_type: 'Organization',
				reputation_score: 78,
				contributions_count: 23,
				joined_at: '2023-11-12'
			}
		];

		const demoResources: TrueCommonsResource[] = [
			{
				id: 'resource-1',
				name: 'Solar Drip Irrigation System',
				note: 'Arduino-controlled irrigation with moisture sensors and solar power',
				trackingIdentifier: 'SOLAR-IRRIG-001',
				primaryAccountable: demoAgents[0],
				custodian: demoAgents[0],
				tags: ['irrigation', 'solar', 'arduino', 'agriculture'],
				license: 'CC BY-SA',
				fork_count: 3,
				usage_count: 17,
				created_at: '2024-01-20'
			},
			{
				id: 'resource-2',
				name: 'Community Water Purification Plans',
				note: 'Low-cost water filtration system using local materials',
				trackingIdentifier: 'WATER-PURIF-001',
				primaryAccountable: demoAgents[1],
				custodian: demoAgents[1],
				tags: ['water', 'filtration', 'community', 'health'],
				license: 'CC0',
				fork_count: 7,
				usage_count: 28,
				created_at: '2024-02-05'
			},
			{
				id: 'resource-3',
				name: 'Permaculture Design Software',
				note: 'Open-source tool for designing sustainable agricultural systems',
				trackingIdentifier: 'PERMA-SOFT-001',
				primaryAccountable: demoAgents[2],
				custodian: demoAgents[2],
				tags: ['permaculture', 'software', 'design', 'sustainability'],
				license: 'GPL-3.0',
				fork_count: 12,
				usage_count: 45,
				created_at: '2024-01-08'
			}
		];

		const demoEvents: TrueCommonsEvent[] = [
			{
				id: 'event-1',
				action: { id: 'produce', label: 'Produce', resourceEffect: 'increment' },
				provider: demoAgents[0],
				resourceInventoriedAs: demoResources[0],
				hasPointInTime: '2024-01-20T10:30:00Z',
				note: 'Created solar irrigation system design',
				context: 'resource_creation',
				impact_score: 85
			},
			{
				id: 'event-2',
				action: { id: 'use', label: 'Use', resourceEffect: 'no-change' },
				provider: demoAgents[1],
				resourceInventoriedAs: demoResources[0],
				hasPointInTime: '2024-02-15T14:20:00Z',
				note: 'Used irrigation system for community garden project',
				context: 'resource_use',
				impact_score: 72
			},
			{
				id: 'event-3',
				action: { id: 'derive-from', label: 'Derive From', resourceEffect: 'increment' },
				provider: demoAgents[2],
				resourceInventoriedAs: demoResources[2],
				hasPointInTime: '2024-02-28T09:15:00Z',
				note: 'Forked water purification plans for urban adaptation',
				context: 'resource_fork',
				impact_score: 78
			}
		];

		const demoStats: NetworkStats = {
			total_agents: 47,
			total_resources: 156,
			total_events: 892,
			total_value_created: 8920,
			active_collaborations: 23
		};

		return {
			agents: demoAgents,
			resources: demoResources,
			events: demoEvents,
			stats: demoStats
		};
	}

	return {
		get isConnected() {
			return isConnected;
		},
		connect,
		getMyAgent,
		getAllAgents,
		createAgent,
		getAllResources,
		getResource,
		createResource,
		updateResource,
		forkResource,
		searchResourcesByTag,
		getAllEvents,
		createEvent,
		getResourceEvents,
		getAgentEvents,
		useResource,
		getNetworkStats,
		getAvailableActions,
		getDemoData
	};
}

const trueCommonsService = createTrueCommonsService();
export default trueCommonsService;
