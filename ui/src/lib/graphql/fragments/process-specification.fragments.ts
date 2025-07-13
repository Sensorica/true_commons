import { gql } from '@apollo/client/core';

export const PROCESS_SPECIFICATION_FRAGMENT = gql`
	fragment ProcessSpecificationFragment on ProcessSpecification {
		id
		revisionId
		name
		note
	}
`;
