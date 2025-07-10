import type { UnitCreateParams } from '../graphql/types';

/**
 * Default units required by ValueFlows foundation.
 * These units are essential for proper operation of the system.
 */
export const DEFAULT_UNITS: UnitCreateParams[] = [
	{
		omUnitIdentifier: 'one',
		label: 'Each',
		symbol: 'ea'
	},
	{
		omUnitIdentifier: 'hour',
		label: 'Hour',
		symbol: 'h'
	},
	{
		omUnitIdentifier: 'kilogram',
		label: 'Kilogram',
		symbol: 'kg'
	},
	{
		omUnitIdentifier: 'meter',
		label: 'Meter',
		symbol: 'm'
	},
	{
		omUnitIdentifier: 'piece',
		label: 'Piece',
		symbol: 'pc'
	},
	{
		omUnitIdentifier: 'minute',
		label: 'Minute',
		symbol: 'min'
	},
	{
		omUnitIdentifier: 'second',
		label: 'Second',
		symbol: 's'
	},
	{
		omUnitIdentifier: 'liter',
		label: 'Liter',
		symbol: 'L'
	},
	{
		omUnitIdentifier: 'gram',
		label: 'Gram',
		symbol: 'g'
	},
	{
		omUnitIdentifier: 'day',
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
	return DEFAULT_UNITS.filter((unit) => unitIds.includes(unit.omUnitIdentifier));
}
