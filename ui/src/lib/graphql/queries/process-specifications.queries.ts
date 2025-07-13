import { gql } from '@apollo/client/core';
import { PROCESS_SPECIFICATION_FRAGMENT } from '$lib/graphql/fragments';

export const GET_PROCESS_SPECIFICATIONS = gql`
	query getProcessSpecifications {
		processSpecifications {
			edges {
				node {
					...ProcessSpecificationFragment
				}
			}
		}
	}
	${PROCESS_SPECIFICATION_FRAGMENT}
`;

export const GET_PROCESS_SPECIFICATION = gql`
	query getProcessSpecification($id: ID!) {
		processSpecification(id: $id) {
			...ProcessSpecificationFragment
		}
	}
	${PROCESS_SPECIFICATION_FRAGMENT}
`;
