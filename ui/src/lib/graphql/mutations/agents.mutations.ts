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
