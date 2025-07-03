import { GraphQLClient } from 'graphql-request';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

// hREA ValueFlows Types
export interface Agent {
	id: string;
	name: string;
	note?: string;
	primaryLocation?: string;
	canonicalUrl?: string;
}

export interface EconomicResource {
	id: string;
	name?: string;
	note?: string;
	trackingIdentifier?: string;
	currentLocation?: string;
	primaryAccountable?: Agent;
	custodian?: Agent;
	conformsTo?: ResourceSpecification;
	accountingQuantity?: Measure;
	onhandQuantity?: Measure;
	unitOfEffort?: Unit;
}

export interface EconomicEvent {
	id: string;
	action: Action;
	provider?: Agent;
	receiver?: Agent;
	resourceInventoriedAs?: EconomicResource;
	resourceQuantity?: Measure;
	effortQuantity?: Measure;
	hasPointInTime?: string;
	hasBeginning?: string;
	hasEnd?: string;
	note?: string;
	inScopeOf?: Agent;
}

export interface Action {
	id: string;
	label: string;
	resourceEffect: string;
}

export interface Measure {
	hasNumericalValue: number;
	hasUnit: Unit;
}

export interface Unit {
	id: string;
	label: string;
	symbol: string;
}

export interface ResourceSpecification {
	id: string;
	name: string;
	note?: string;
	defaultUnitOfResource?: Unit;
	defaultUnitOfEffort?: Unit;
}

// GraphQL Response Types
export interface GetMyAgentResponse {
	myAgent: Agent;
}

export interface GetAgentsResponse {
	agents: Agent[];
}

export interface GetEconomicResourcesResponse {
	economicResources: EconomicResource[];
}

export interface GetEconomicEventsResponse {
	economicEvents: EconomicEvent[];
}

export interface GetActionsResponse {
	actions: Action[];
}

export interface CreatePersonResponse {
	createPerson: {
		agent: Agent;
	};
}

export interface CreateEconomicEventResponse {
	createEconomicEvent: {
		economicEvent: EconomicEvent;
	};
}

export interface UpdateEconomicResourceResponse {
	updateEconomicResource: {
		economicResource: EconomicResource;
	};
}

// GraphQL Queries
export const GET_AGENTS = `
  query GetAgents {
    agents {
      id
      name
      note
      primaryLocation
      canonicalUrl
    }
  }
`;

export const GET_MY_AGENT = `
  query GetMyAgent {
    myAgent {
      id
      name
      note
      primaryLocation
      canonicalUrl
    }
  }
`;

export const GET_ECONOMIC_RESOURCES = `
  query GetEconomicResources {
    economicResources {
      id
      name
      note
      trackingIdentifier
      currentLocation
      primaryAccountable {
        id
        name
      }
      custodian {
        id
        name
      }
      conformsTo {
        id
        name
      }
      accountingQuantity {
        hasNumericalValue
        hasUnit {
          id
          label
          symbol
        }
      }
      onhandQuantity {
        hasNumericalValue
        hasUnit {
          id
          label
          symbol
        }
      }
    }
  }
`;

export const GET_ECONOMIC_EVENTS = `
  query GetEconomicEvents {
    economicEvents {
      id
      action {
        id
        label
        resourceEffect
      }
      provider {
        id
        name
      }
      receiver {
        id
        name
      }
      resourceInventoriedAs {
        id
        name
      }
      resourceQuantity {
        hasNumericalValue
        hasUnit {
          id
          label
          symbol
        }
      }
      effortQuantity {
        hasNumericalValue
        hasUnit {
          id
          label
          symbol
        }
      }
      hasPointInTime
      hasBeginning
      hasEnd
      note
      inScopeOf {
        id
        name
      }
    }
  }
`;

export const GET_ACTIONS = `
  query GetActions {
    actions {
      id
      label
      resourceEffect
    }
  }
`;

// Mutations
export const CREATE_PERSON = `
  mutation CreatePerson($person: PersonCreateParams!) {
    createPerson(person: $person) {
      agent {
        id
        name
        note
        primaryLocation
      }
    }
  }
`;

export const CREATE_ECONOMIC_EVENT = `
  mutation CreateEconomicEvent($event: EconomicEventCreateParams!) {
    createEconomicEvent(event: $event) {
      economicEvent {
        id
        action {
          id
          label
        }
        provider {
          id
          name
        }
        receiver {
          id
          name
        }
        resourceInventoriedAs {
          id
          name
        }
        resourceQuantity {
          hasNumericalValue
          hasUnit {
            id
            label
            symbol
          }
        }
        hasPointInTime
        note
      }
    }
  }
`;

export const UPDATE_ECONOMIC_RESOURCE = `
  mutation UpdateEconomicResource($resource: EconomicResourceUpdateParams!) {
    updateEconomicResource(resource: $resource) {
      economicResource {
        id
        name
        note
        trackingIdentifier
        currentLocation
        primaryAccountable {
          id
          name
        }
        custodian {
          id
          name
        }
      }
    }
  }
`;

export interface GraphQLService {
	client: GraphQLClient | null;
	isConnected: boolean;
	connect(endpoint: string): void;
	query<T>(
		query: string | TypedDocumentNode<T, Record<string, unknown>>,
		variables?: Record<string, unknown>
	): Promise<T>;
	mutation<T>(
		mutation: string | TypedDocumentNode<T, Record<string, unknown>>,
		variables?: Record<string, unknown>
	): Promise<T>;
}

/**
 * Creates a GraphQL service for interacting with hREA
 */
function createGraphQLService(): GraphQLService {
	let client: GraphQLClient | null = $state(null);
	let isConnected: boolean = $state(false);

	function connect(endpoint: string = 'http://localhost:4000/graphql'): void {
		client = new GraphQLClient(endpoint, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
		isConnected = true;
	}

	async function query<T>(
		query: string | TypedDocumentNode<T, Record<string, unknown>>,
		variables?: Record<string, unknown>
	): Promise<T> {
		if (!client) {
			throw new Error('GraphQL client not connected');
		}
		return await client.request(query, variables);
	}

	async function mutation<T>(
		mutation: string | TypedDocumentNode<T, Record<string, unknown>>,
		variables?: Record<string, unknown>
	): Promise<T> {
		if (!client) {
			throw new Error('GraphQL client not connected');
		}
		return await client.request(mutation, variables);
	}

	return {
		get client() {
			return client;
		},
		get isConnected() {
			return isConnected;
		},
		connect,
		query,
		mutation
	};
}

const graphqlService = createGraphQLService();
export default graphqlService;
