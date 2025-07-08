import { gql } from '@apollo/client/core';

export const GET_ECONOMIC_EVENTS = gql`
	query GetEconomicEvents {
		economicEvents {
			edges {
				node {
					id
					action {
						id
						label
						resourceEffect
					}
					provider {
						id
						name
					}
					receiver {
						id
						name
					}
					resourceInventoriedAs {
						id
						name
					}
					resourceQuantity {
						hasNumericalValue
						hasUnit {
							id
							label
							symbol
						}
					}
					effortQuantity {
						hasNumericalValue
						hasUnit {
							id
							label
							symbol
						}
					}
					hasPointInTime
					hasBeginning
					hasEnd
					note
					inScopeOf {
						id
						name
					}
				}
			}
		}
	}
`;
