import type { UnitCreateParams } from '../graphql/types';

/**
 * Default units required by ValueFlows foundation.
 * These units are essential for proper operation of the system.
 */
export const DEFAULT_UNITS: UnitCreateParams[] = [
	{
		id: 'one',
		label: 'Each',
		symbol: 'ea'
	},
	{
		id: 'hour',
		label: 'Hour',
		symbol: 'h'
	},
	{
		id: 'kilogram',
		label: 'Kilogram',
		symbol: 'kg'
	},
	{
		id: 'meter',
		label: 'Meter',
		symbol: 'm'
	},
	{
		id: 'piece',
		label: 'Piece',
		symbol: 'pc'
	},
	{
		id: 'minute',
		label: 'Minute',
		symbol: 'min'
	},
	{
		id: 'second',
		label: 'Second',
		symbol: 's'
	},
	{
		id: 'liter',
		label: 'Liter',
		symbol: 'L'
	},
	{
		id: 'gram',
		label: 'Gram',
		symbol: 'g'
	},
	{
		id: 'day',
		label: 'Day',
		symbol: 'd'
	}
];

/**
 * Required units that must be present for the system to function properly.
 * These are the minimum units needed for ValueFlows operations.
 */
export const REQUIRED_UNITS = ['one', 'hour', 'kilogram', 'meter'] as const;

/**
 * Unit categories for organization and validation
 */
export const UNIT_CATEGORIES = {
	COUNT: ['one', 'piece'],
	TIME: ['hour', 'minute', 'second', 'day'],
	WEIGHT: ['kilogram', 'gram'],
	VOLUME: ['liter'],
	LENGTH: ['meter']
} as const;

/**
 * Get units by category
 */
export function getUnitsByCategory(category: keyof typeof UNIT_CATEGORIES): UnitCreateParams[] {
	const unitIds = UNIT_CATEGORIES[category] as readonly string[];
	return DEFAULT_UNITS.filter((unit) => unitIds.includes(unit.id));
}
