import { gql } from '@apollo/client/core';
import { ECONOMIC_RESOURCE_FIELDS } from '../fragments/economic-resource.fragments';

export const GET_ECONOMIC_RESOURCES = gql`
	${ECONOMIC_RESOURCE_FIELDS}
	query GetEconomicResources {
		economicResources {
			edges {
				node {
					...EconomicResourceFields
				}
			}
		}
	}
`;
