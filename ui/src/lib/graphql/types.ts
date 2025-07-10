// hREA ValueFlows Types
export interface Agent {
	id: string;
	name: string;
	note?: string;
	image?: string;
	primaryLocation?: string;
	canonicalUrl?: string;
}

// Input types for mutations
export interface AgentCreateParams {
	name: string;
	note?: string;
	image?: string;
}

// Agent Metadata Types - for storing structured metadata as JSON in the note field
export interface AgentMetadata {
	// Basic Information
	description?: string;
	bio?: string;

	// Professional Information
	title?: string;
	organization?: string;
	department?: string;
	position?: string;

	// Contact Information
	email?: string;
	phone?: string;
	website?: string;

	// Social Media & Links
	socialMedia?: {
		twitter?: string;
		linkedin?: string;
		github?: string;
		mastodon?: string;
		orcid?: string;
		[key: string]: string | undefined;
	};

	// Skills & Expertise
	skills?: string[];
	expertise?: string[];
	interests?: string[];

	// Geographic Information
	location?: {
		city?: string;
		country?: string;
		timezone?: string;
	};

	// Professional Background
	experience?: Array<{
		title: string;
		startDate?: string;
		endDate?: string;
		description?: string;
	}>;

	// Education
	education?: Array<{
		degree: string;
		institution: string;
		year?: string;
		field?: string;
	}>;

	// Languages
	languages?: Array<{
		language: string;
		proficiency: 'native' | 'fluent' | 'intermediate' | 'basic';
	}>;

	// Certifications & Awards
	certifications?: Array<{
		name: string;
		issuer: string;
		date?: string;
		expirationDate?: string;
	}>;

	// Publications & Works
	publications?: Array<{
		title: string;
		type: 'article' | 'book' | 'paper' | 'report' | 'other';
		date?: string;
		url?: string;
		description?: string;
	}>;

	// Preferences & Settings
	preferences?: {
		visibility?: 'public' | 'network' | 'private';
		contactPreference?: 'email' | 'phone' | 'message';
		notifications?: boolean;
	};

	// Timestamps
	metadata?: {
		createdAt?: string;
		updatedAt?: string;
		version?: string;
	};
}

// Helper type for agent with parsed metadata
export interface AgentWithMetadata extends Agent {
	parsedMetadata?: AgentMetadata;
}

// Utility functions for metadata handling
export const parseAgentMetadata = (note?: string): AgentMetadata | null => {
	if (!note) return null;

	try {
		// Try to parse as JSON first
		const parsed = JSON.parse(note);
		// If it's an object, treat it as metadata
		if (typeof parsed === 'object' && parsed !== null) {
			return parsed as AgentMetadata;
		}
	} catch {
		// If parsing fails, it's likely plain text
	}

	return null;
};

export const stringifyAgentMetadata = (metadata: AgentMetadata): string => {
	return JSON.stringify(metadata, null, 2);
};

export const isJsonMetadata = (note?: string): boolean => {
	if (!note) return false;

	try {
		const parsed = JSON.parse(note);
		return typeof parsed === 'object' && parsed !== null;
	} catch {
		return false;
	}
};

export interface ResourceMetadata {
	note?: string; // the original note
	currentLocation?: string;
	primaryAccountable?: string; // Agent ID
	custodian?: string; // Agent ID
	tags?: string[];
	license?: string;
	resourceType?: string;
	contentHash?: string;
	content?: string;
}

// Helper type for resource with parsed metadata
export interface ResourceWithMetadata extends EconomicResource {
	parsedMetadata?: ResourceMetadata;
}

// Utility functions for metadata handling
export const parseResourceMetadata = (note?: string): ResourceMetadata | null => {
	if (!note) return null;

	try {
		// Try to parse as JSON first
		const parsed = JSON.parse(note);
		// If it's an object, treat it as metadata
		if (typeof parsed === 'object' && parsed !== null) {
			return parsed as ResourceMetadata;
		}
	} catch {
		// If parsing fails, it's likely plain text
	}

	return null;
};

export const stringifyResourceMetadata = (metadata: ResourceMetadata): string => {
	return JSON.stringify(metadata, null, 2);
};

export interface EconomicResource {
	id: string;
	name?: string;
	note?: string;
	trackingIdentifier?: string;
	currentLocation?: string;
	primaryAccountable?: Agent;
	custodian?: Agent;
	providedBy?: Agent;
	conformsTo?: ResourceSpecification;
	accountingQuantity?: Measure;
	onhandQuantity?: Measure;
	currentQuantity?: Measure;
	unitOfEffort?: Unit;
	// True Commons specific fields
	tags?: string[];
	license?: string;
	resourceType?: string;
	contentHash?: string;
	content?: string;
	version?: string;
	fork_count?: number;
	usage_count?: number;
	created_at?: string;
	updated_at?: string;
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
	// Process relationships
	inputOf?: Process;
	outputOf?: Process;
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

// Resource Specification Response Types
export interface GetResourceSpecificationResponse {
	resourceSpecification: ResourceSpecification;
}

export interface GetResourceSpecificationsResponse {
	resourceSpecifications: {
		edges: {
			node: ResourceSpecification;
		}[];
	};
}

export interface CreateResourceSpecificationResponse {
	createResourceSpecification: {
		resourceSpecification: ResourceSpecification;
	};
}

export interface UpdateResourceSpecificationResponse {
	updateResourceSpecification: {
		resourceSpecification: ResourceSpecification;
	};
}

export interface DeleteResourceSpecificationResponse {
	deleteResourceSpecification: boolean;
}

// Units Response Types
export interface GetUnitsResponse {
	units: Unit[];
}

export interface GetUnitResponse {
	unit: Unit;
}

export interface CreateUnitResponse {
	createUnit: {
		unit: Unit;
	};
}

export interface UpdateUnitResponse {
	updateUnit: {
		unit: Unit;
	};
}

export interface DeleteUnitResponse {
	deleteUnit: boolean;
}

// Units Input Types
export interface UnitCreateParams {
	id: string;
	label: string;
	symbol: string;
}

export interface UnitUpdateParams {
	label?: string;
	symbol?: string;
}

// Actions Response Types
export interface CreateActionResponse {
	createAction: {
		action: Action;
	};
}

export interface UpdateActionResponse {
	updateAction: {
		action: Action;
	};
}

export interface DeleteActionResponse {
	deleteAction: boolean;
}

// Actions Input Types
export interface ActionCreateParams {
	id: string;
	label: string;
	resourceEffect: string;
}

export interface ActionUpdateParams {
	label?: string;
	resourceEffect?: string;
}

// EconomicEvent Response Types
export interface UpdateEconomicEventResponse {
	updateEconomicEvent: {
		economicEvent: EconomicEvent;
	};
}

export interface DeleteEconomicEventResponse {
	deleteEconomicEvent: boolean;
}

// EconomicEvent Input Types
export interface EconomicEventCreateParams {
	action: string; // Action ID
	provider?: string; // Agent ID
	receiver?: string; // Agent ID
	resourceInventoriedAs?: string; // EconomicResource ID
	resourceConformsTo?: string; // ResourceSpecification ID
	resourceQuantity?: MeasureCreateParams;
	effortQuantity?: MeasureCreateParams;
	hasPointInTime?: string;
	hasBeginning?: string;
	hasEnd?: string;
	note?: string;
	inScopeOf?: string; // Agent ID
	// Process relationships
	inputOf?: string; // Process ID
	outputOf?: string; // Process ID
}

export interface EconomicEventUpdateParams {
	action?: string; // Action ID
	provider?: string; // Agent ID
	receiver?: string; // Agent ID
	resourceInventoriedAs?: string; // EconomicResource ID
	resourceConformsTo?: string; // ResourceSpecification ID
	resourceQuantity?: MeasureCreateParams;
	effortQuantity?: MeasureCreateParams;
	hasPointInTime?: string;
	hasBeginning?: string;
	hasEnd?: string;
	note?: string;
	inScopeOf?: string; // Agent ID
	// Process relationships
	inputOf?: string; // Process ID
	outputOf?: string; // Process ID
}

// Measure Input Types
export interface MeasureCreateParams {
	hasNumericalValue: number;
	hasUnit: string; // Unit ID
}

// Process Types
export interface Process {
	id: string;
	name: string;
	note?: string;
	basedOn?: ProcessSpecification;
	inScopeOf?: Agent;
	hasBeginning?: string;
	hasEnd?: string;
	isFinished?: boolean;
	plannedWithin?: Plan;
}

export interface ProcessSpecification {
	id: string;
	name: string;
	note?: string;
	classifiedAs?: string[];
}

// Process Input Types
export interface ProcessCreateParams {
	name: string;
	note?: string;
	basedOn?: string; // ProcessSpecification ID
	inScopeOf?: string; // Agent ID
	hasBeginning?: string;
	hasEnd?: string;
	isFinished?: boolean;
	plannedWithin?: string; // Plan ID
}

export interface ProcessUpdateParams {
	name?: string;
	note?: string;
	basedOn?: string; // ProcessSpecification ID
	inScopeOf?: string; // Agent ID
	hasBeginning?: string;
	hasEnd?: string;
	isFinished?: boolean;
	plannedWithin?: string; // Plan ID
}

export interface ProcessSpecificationCreateParams {
	name: string;
	note?: string;
	classifiedAs?: string[];
}

export interface ProcessSpecificationUpdateParams {
	name?: string;
	note?: string;
	classifiedAs?: string[];
}

// Process Response Types
export interface GetProcessesResponse {
	processes: {
		edges: {
			node: Process;
		}[];
	};
}

export interface GetProcessSpecificationsResponse {
	processSpecifications: {
		edges: {
			node: ProcessSpecification;
		}[];
	};
}

export interface CreateProcessResponse {
	createProcess: {
		process: Process;
	};
}

export interface UpdateProcessResponse {
	updateProcess: {
		process: Process;
	};
}

export interface DeleteProcessResponse {
	deleteProcess: boolean;
}

export interface CreateProcessSpecificationResponse {
	createProcessSpecification: {
		processSpecification: ProcessSpecification;
	};
}

export interface UpdateProcessSpecificationResponse {
	updateProcessSpecification: {
		processSpecification: ProcessSpecification;
	};
}

export interface DeleteProcessSpecificationResponse {
	deleteProcessSpecification: boolean;
}

// Placeholder for Plan type (will be implemented later)
export interface Plan {
	id: string;
	name: string;
	note?: string;
}
