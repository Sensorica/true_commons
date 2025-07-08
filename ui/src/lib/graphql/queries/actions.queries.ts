import { gql } from '@apollo/client/core';

export const GET_ACTIONS = gql`
	query GetActions {
		actions {
			id
			label
			resourceEffect
		}
	}
`;
