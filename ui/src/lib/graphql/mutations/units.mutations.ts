import { gql } from '@apollo/client/core';

export const CREATE_UNIT = gql`
	mutation CreateUnit($unit: UnitCreateParams!) {
		createUnit(unit: $unit) {
			unit {
				id
				label
				symbol
			}
		}
	}
`;

export const UPDATE_UNIT = gql`
	mutation UpdateUnit($id: ID!, $unit: UnitUpdateParams!) {
		updateUnit(id: $id, unit: $unit) {
			unit {
				id
				label
				symbol
			}
		}
	}
`;

export const DELETE_UNIT = gql`
	mutation DeleteUnit($id: ID!) {
		deleteUnit(id: $id)
	}
`; 