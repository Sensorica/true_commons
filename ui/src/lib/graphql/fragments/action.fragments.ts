import { gql } from '@apollo/client/core';

/**
 * Basic action fields fragment
 */
export const ACTION_FIELDS = gql`
	fragment ActionFields on Action {
		id
		label
		resourceEffect
	}
`;

/**
 * Action fields with additional metadata
 */
export const ACTION_FIELDS_EXTENDED = gql`
	fragment ActionFieldsExtended on Action {
		id
		label
		resourceEffect
		inputOutput
	}
`;
