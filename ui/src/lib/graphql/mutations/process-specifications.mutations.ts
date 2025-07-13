import { gql } from '@apollo/client/core';
import { PROCESS_SPECIFICATION_FRAGMENT } from '../fragments';

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

export const CREATE_PROCESS_SPECIFICATION = gql`
	mutation createProcessSpecification($processSpecification: ProcessSpecificationCreateParams!) {
		createProcessSpecification(processSpecification: $processSpecification) {
			...ProcessSpecificationFragment
		}
	}
	${PROCESS_SPECIFICATION_FRAGMENT}
`;

export const UPDATE_PROCESS_SPECIFICATION = gql`
	mutation updateProcessSpecification($processSpecification: ProcessSpecificationUpdateParams!) {
		updateProcessSpecification(processSpecification: $processSpecification) {
			...ProcessSpecificationFragment
		}
	}
	${PROCESS_SPECIFICATION_FRAGMENT}
`;

export const DELETE_PROCESS_SPECIFICATION = gql`
	mutation deleteProcessSpecification($revisionId: ID!) {
		deleteProcessSpecification(revisionId: $revisionId)
	}
`;
