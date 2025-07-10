import { gql } from '@apollo/client/core';

export const CREATE_ACTION_MUTATION = gql`
	mutation CreateAction($id: String!, $label: String!, $resourceEffect: String!) {
		createAction(id: $id, label: $label, resourceEffect: $resourceEffect) {
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
	mutation UpdateAction($id: ID!, $label: String!, $resourceEffect: String!) {
		updateAction(id: $id, label: $label, resourceEffect: $resourceEffect) {
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
		deleteAction(id: $id) {
			id
		}
	}
`;
