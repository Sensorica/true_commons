// Units configuration
export { DEFAULT_UNITS, REQUIRED_UNITS, UNIT_CATEGORIES, getUnitsByCategory } from './units';

// Actions configuration
export {
	DEFAULT_ACTIONS,
	REQUIRED_ACTIONS,
	ACTION_CATEGORIES,
	RESOURCE_EFFECTS,
	getActionsByCategory,
	getActionsByEffect
} from './actions';

// Resource specifications configuration
export {
	DEFAULT_RESOURCE_SPECIFICATIONS,
	REQUIRED_RESOURCE_SPECIFICATIONS,
	RESOURCE_SPEC_CATEGORIES,
	getResourceSpecsByCategory,
	getResourceSpecsByUnit,
	type ResourceSpecificationConfig
} from './resource-specifications';

// Process specifications configuration
export {
	DEFAULT_PROCESS_SPECIFICATIONS,
	REQUIRED_PROCESS_SPECIFICATIONS
} from './process-specifications';
