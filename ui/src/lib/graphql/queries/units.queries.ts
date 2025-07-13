import { gql } from '@apollo/client/core';
import { UNIT_FIELDS_EXTENDED } from '../fragments';

export const GET_UNITS = gql`
	${UNIT_FIELDS_EXTENDED}
	query GetUnits {
		units {
			edges {
				node {
					...UnitFieldsExtended
				}
			}
		}
	}
`;

export const GET_UNIT = gql`
	${UNIT_FIELDS_EXTENDED}
	query GetUnit($id: ID!) {
		unit(id: $id) {
			...UnitFieldsExtended
		}
	}
`;
