import { gql } from '@apollo/client/core';
import { ACTION_FIELDS } from '../fragments';

export const GET_ACTIONS = gql`
	${ACTION_FIELDS}
	query GetActions {
		actions {
			...ActionFields
		}
	}
`;
