import { gql } from '@apollo/client/core';
import { UNIT_FIELDS } from '../fragments';

export const CREATE_UNIT_MUTATION = gql`
	${UNIT_FIELDS}
	mutation CreateUnit($omUnitIdentifier: String!, $label: String!, $symbol: String!) {
		createUnit(omUnitIdentifier: $omUnitIdentifier, label: $label, symbol: $symbol) {
			unit {
				...UnitFields
			}
		}
	}
`;

export const UPDATE_UNIT_MUTATION = gql`
	${UNIT_FIELDS}
	mutation UpdateUnit($id: ID!, $omUnitIdentifier: String!, $label: String!, $symbol: String!) {
		updateUnit(id: $id, omUnitIdentifier: $omUnitIdentifier, label: $label, symbol: $symbol) {
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
