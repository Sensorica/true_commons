import type { ActionCreateParams } from '../graphql/types';

/**
 * Default actions required by ValueFlows foundation.
 * These actions define the basic economic operations available in the system.
 */
export const DEFAULT_ACTIONS: ActionCreateParams[] = [
	{
		id: 'produce',
		label: 'Produce',
		resourceEffect: 'increment'
	},
	{
		id: 'consume',
		label: 'Consume',
		resourceEffect: 'decrement'
	},
	{
		id: 'use',
		label: 'Use',
		resourceEffect: 'noEffect'
	},
	{
		id: 'contribute',
		label: 'Contribute',
		resourceEffect: 'increment'
	},
	{
		id: 'transfer',
		label: 'Transfer',
		resourceEffect: 'decrementIncrement'
	},
	{
		id: 'fork',
		label: 'Fork',
		resourceEffect: 'increment'
	},
	{
		id: 'remix',
		label: 'Remix',
		resourceEffect: 'increment'
	},
	{
		id: 'work',
		label: 'Work',
		resourceEffect: 'noEffect'
	},
	{
		id: 'cite',
		label: 'Cite',
		resourceEffect: 'noEffect'
	},
	{
		id: 'accept',
		label: 'Accept',
		resourceEffect: 'noEffect'
	}
];

/**
 * Required actions that must be present for the system to function properly.
 * These are the minimum actions needed for basic ValueFlows operations.
 */
export const REQUIRED_ACTIONS = [
	'produce',
	'consume',
	'use',
	'contribute',
	'transfer',
	'fork',
	'remix'
] as const;

/**
 * Action categories for organization and UI grouping
 */
export const ACTION_CATEGORIES = {
	PRODUCTION: ['produce', 'contribute', 'work'],
	CONSUMPTION: ['consume', 'use'],
	TRANSFER: ['transfer'],
	KNOWLEDGE: ['fork', 'remix', 'cite'],
	WORKFLOW: ['accept']
} as const;

/**
 * Resource effects that actions can have
 */
export const RESOURCE_EFFECTS = {
	INCREMENT: 'increment',
	DECREMENT: 'decrement',
	DECREMENT_INCREMENT: 'decrementIncrement',
	NO_EFFECT: 'noEffect'
} as const;

/**
 * Get actions by category
 */
export function getActionsByCategory(
	category: keyof typeof ACTION_CATEGORIES
): ActionCreateParams[] {
	const actionIds = ACTION_CATEGORIES[category] as readonly string[];
	return DEFAULT_ACTIONS.filter((action) => actionIds.includes(action.id));
}

/**
 * Get actions by resource effect
 */
export function getActionsByEffect(effect: string): ActionCreateParams[] {
	return DEFAULT_ACTIONS.filter((action) => action.resourceEffect === effect);
}
