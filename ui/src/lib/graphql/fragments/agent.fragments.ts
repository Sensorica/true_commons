import { gql } from '@apollo/client/core';

/**
 * Basic agent fields fragment
 */
export const AGENT_FIELDS = gql`
	fragment AgentFields on Agent {
		id
		name
	}
`;

/**
 * Agent fields with additional metadata
 */
export const AGENT_FIELDS_EXTENDED = gql`
	fragment AgentFieldsExtended on Agent {
		id
		name
		note
		image
	}
`;
