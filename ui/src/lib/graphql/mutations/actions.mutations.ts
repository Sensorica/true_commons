import { gql } from '@apollo/client/core';

export const CREATE_ACTION_MUTATION = gql`
	mutation CreateAction($action: ActionCreateParams!) {
		createAction(action: $action) {
			action {
				id
				label
				resourceEffect
				inputOutput
			}
		}
	}
`;

export const UPDATE_ACTION_MUTATION = gql`
	mutation UpdateAction($id: ID!, $action: ActionUpdateParams!) {
		updateAction(id: $id, action: $action) {
			action {
				id
				label
				resourceEffect
				inputOutput
			}
		}
	}
`;

export const DELETE_ACTION_MUTATION = gql`
	mutation DeleteAction($id: ID!) {
		deleteAction(id: $id)
	}
`; 