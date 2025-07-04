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
	agents: {
		edges: {
			node: Agent;
		}[];
	};
}

export interface GetEconomicResourcesResponse {
	economicResources: {
		edges: {
			node: EconomicResource;
		}[];
	};
}

export interface GetEconomicEventsResponse {
	economicEvents: {
		edges: {
			node: EconomicEvent;
		}[];
	};
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
