import { gql } from '@apollo/client/core';

/**
 * Basic unit fields fragment
 */
export const UNIT_FIELDS = gql`
	fragment UnitFields on Unit {
		id
		label
		symbol
		classifiedAs
	}
`;

/**
 * Unit fields with additional metadata
 */
export const UNIT_FIELDS_EXTENDED = gql`
	fragment UnitFieldsExtended on Unit {
		id
		label
		symbol
		classifiedAs
	}
`;
