/**
 * Default resource specifications for True Commons platform.
 * These define the basic types of resources that can be managed in the system.
 */
export interface ResourceSpecificationConfig {
	id: string;
	name: string;
	note: string;
	defaultUnitOfResourceId: string;
	defaultUnitOfEffortId: string;
}

export const DEFAULT_RESOURCE_SPECIFICATIONS: ResourceSpecificationConfig[] = [
	{
		id: 'document-spec',
		name: 'Document',
		note: 'General document resource specification for text-based content, reports, and documentation',
		defaultUnitOfResourceId: 'one',
		defaultUnitOfEffortId: 'hour'
	},
	{
		id: 'software-spec',
		name: 'Software',
		note: 'Software resource specification for code, applications, and digital tools',
		defaultUnitOfResourceId: 'one',
		defaultUnitOfEffortId: 'hour'
	},
	{
		id: 'design-spec',
		name: 'Design',
		note: 'Design resource specification for visual designs, mockups, and creative assets',
		defaultUnitOfResourceId: 'one',
		defaultUnitOfEffortId: 'hour'
	},
	{
		id: 'knowledge-spec',
		name: 'Knowledge',
		note: 'Knowledge resource specification for expertise, skills, and intellectual resources',
		defaultUnitOfResourceId: 'one',
		defaultUnitOfEffortId: 'hour'
	},
	{
		id: 'dataset-spec',
		name: 'Dataset',
		note: 'Dataset resource specification for structured data, databases, and information collections',
		defaultUnitOfResourceId: 'one',
		defaultUnitOfEffortId: 'hour'
	},
	{
		id: 'hardware-spec',
		name: 'Hardware',
		note: 'Hardware resource specification for physical devices, equipment, and infrastructure',
		defaultUnitOfResourceId: 'piece',
		defaultUnitOfEffortId: 'hour'
	},
	{
		id: 'service-spec',
		name: 'Service',
		note: 'Service resource specification for digital and professional services',
		defaultUnitOfResourceId: 'hour',
		defaultUnitOfEffortId: 'hour'
	},
	{
		id: 'material-spec',
		name: 'Material',
		note: 'Material resource specification for physical materials and supplies',
		defaultUnitOfResourceId: 'kilogram',
		defaultUnitOfEffortId: 'hour'
	}
];

/**
 * Required resource specifications that must be present for basic system operation.
 */
export const REQUIRED_RESOURCE_SPECIFICATIONS = ['document-spec', 'software-spec'] as const;

/**
 * Resource specification categories for organization
 */
export const RESOURCE_SPEC_CATEGORIES = {
	DIGITAL: ['document-spec', 'software-spec', 'dataset-spec', 'design-spec'],
	KNOWLEDGE: ['knowledge-spec', 'service-spec'],
	PHYSICAL: ['hardware-spec', 'material-spec']
} as const;

/**
 * Get resource specifications by category
 */
export function getResourceSpecsByCategory(
	category: keyof typeof RESOURCE_SPEC_CATEGORIES
): ResourceSpecificationConfig[] {
	const specIds = RESOURCE_SPEC_CATEGORIES[category] as readonly string[];
	return DEFAULT_RESOURCE_SPECIFICATIONS.filter((spec) => specIds.includes(spec.id));
}

/**
 * Get resource specifications that use a specific unit
 */
export function getResourceSpecsByUnit(unitId: string): ResourceSpecificationConfig[] {
	return DEFAULT_RESOURCE_SPECIFICATIONS.filter(
		(spec) => spec.defaultUnitOfResourceId === unitId || spec.defaultUnitOfEffortId === unitId
	);
}
