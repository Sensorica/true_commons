import { gql } from '@apollo/client/core';

export const GET_AGENTS = gql`
	query GetAgents {
		agents {
			edges {
				node {
					id
					name
					note
				}
			}
		}
	}
`;

export const GET_MY_AGENT = gql`
	query GetMyAgent {
		myAgent {
			id
			name
			note
		}
	}
`;
