import { gql } from '@apollo/client/core';

export const GET_UNITS = gql`
	query GetUnits {
		units {
			id
			label
			symbol
		}
	}
`;

export const GET_UNIT = gql`
	query GetUnit($id: ID!) {
		unit(id: $id) {
			id
			label
			symbol
		}
	}
`; 