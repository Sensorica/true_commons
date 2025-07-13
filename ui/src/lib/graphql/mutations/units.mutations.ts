import { gql } from '@apollo/client/core';
import { UNIT_FIELDS_EXTENDED } from '../fragments';

export const CREATE_UNIT_MUTATION = gql`
	${UNIT_FIELDS_EXTENDED}
	mutation CreateUnit($unit: UnitCreateParams!) {
		createUnit(unit: $unit) {
			unit {
				...UnitFieldsExtended
			}
		}
	}
`;

export const UPDATE_UNIT_MUTATION = gql`
	${UNIT_FIELDS_EXTENDED}
	mutation UpdateUnit($id: ID!, $revisionId: ID!, $unit: UnitUpdateParams!) {
		updateUnit(id: $id, revisionId: $revisionId, unit: $unit) {
			unit {
				...UnitFieldsExtended
			}
		}
	}
`;

export const DELETE_UNIT_MUTATION = gql`
	mutation DeleteUnit($id: ID!, $revisionId: ID!) {
		deleteUnit(id: $id, revisionId: $revisionId)
	}
`;
