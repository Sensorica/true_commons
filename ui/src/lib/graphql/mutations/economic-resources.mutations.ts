import { gql } from '@apollo/client/core';

export const UPDATE_ECONOMIC_RESOURCE = gql`
	mutation UpdateEconomicResource($resource: EconomicResourceUpdateParams!) {
		updateEconomicResource(resource: $resource) {
			economicResource {
				id
			}
		}
	}
`;
