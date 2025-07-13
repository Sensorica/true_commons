import { gql } from '@apollo/client/core';

export const CREATE_PERSON = gql`
	mutation CreatePerson($person: AgentCreateParams!) {
		createPerson(person: $person) {
			agent {
				id
				name
				note
				image
			}
		}
	}
`;

export const UPDATE_AGENT = gql`
	mutation UpdateAgent($id: ID!, $agent: AgentUpdateParams!) {
		updateAgent(id: $id, agent: $agent) {
			agent {
				id
				name
				note
				image
			}
		}
	}
`;

export const DELETE_AGENT = gql`
	mutation DeleteAgent($id: ID!) {
		deleteAgent(id: $id) {
			id
		}
	}
`;
