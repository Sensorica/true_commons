import { gql } from '@apollo/client/core';
import { UNIT_FIELDS } from '../fragments';

export const GET_UNITS = gql`
	${UNIT_FIELDS}
	query GetUnits {
		units {
			...UnitFields
		}
	}
`;

export const GET_UNIT = gql`
	${UNIT_FIELDS}
	query GetUnit($id: ID!) {
		unit(id: $id) {
			...UnitFields
		}
	}
`;
