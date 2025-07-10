import { gql } from '@apollo/client/core';
import { UNIT_FIELDS } from './unit.fragments';

/**
 * Basic measure fields fragment
 */
export const MEASURE_FIELDS = gql`
	${UNIT_FIELDS}
	fragment MeasureFields on Measure {
		hasNumericalValue
		hasUnit {
			...UnitFields
		}
	}
`;
