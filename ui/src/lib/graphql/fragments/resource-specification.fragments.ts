import { gql } from '@apollo/client/core';
import { UNIT_FIELDS } from './unit.fragments';

/**
 * Basic resource specification fields fragment
 */
export const RESOURCE_SPECIFICATION_FIELDS = gql`
	fragment ResourceSpecificationFields on ResourceSpecification {
		id
		name
		note
	}
`;

/**
 * Resource specification fields with unit relationships
 */
export const RESOURCE_SPECIFICATION_FIELDS_EXTENDED = gql`
	${UNIT_FIELDS}
	fragment ResourceSpecificationFieldsExtended on ResourceSpecification {
		id
		name
		note
		defaultUnitOfEffort {
			...UnitFields
		}
		defaultUnitOfResource {
			...UnitFields
		}
	}
`;
