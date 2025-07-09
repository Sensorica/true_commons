import { gql } from '@apollo/client/core';

export const CREATE_ACTION = gql`
	mutation CreateAction($action: ActionCreateParams!) {
		createAction(action: $action) {
			action {
				id
				label
				resourceEffect
			}
		}
	}
`;

export const UPDATE_ACTION = gql`
	mutation UpdateAction($id: ID!, $action: ActionUpdateParams!) {
		updateAction(id: $id, action: $action) {
			action {
				id
				label
				resourceEffect
			}
		}
	}
`;

export const DELETE_ACTION = gql`
	mutation DeleteAction($id: ID!) {
		deleteAction(id: $id)
	}
`; 