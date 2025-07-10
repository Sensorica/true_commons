import { gql } from '@apollo/client/core';
import { UNIT_FIELDS } from '../fragments';

export const CREATE_UNIT_MUTATION = gql`
	${UNIT_FIELDS}
	mutation CreateUnit($unit: UnitCreateParams!) {
		createUnit(unit: $unit) {
			unit {
				...UnitFields
			}
		}
	}
`;

export const UPDATE_UNIT_MUTATION = gql`
	${UNIT_FIELDS}
	mutation UpdateUnit($id: ID!, $unit: UnitUpdateParams!) {
		updateUnit(id: $id, unit: $unit) {
			unit {
				...UnitFields
			}
		}
	}
`;

export const DELETE_UNIT_MUTATION = gql`
	mutation DeleteUnit($id: ID!) {
		deleteUnit(id: $id) {
			id
		}
	}
`;
