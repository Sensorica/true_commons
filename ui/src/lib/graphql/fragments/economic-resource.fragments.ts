import { gql } from '@apollo/client/core';
import { AGENT_FIELDS } from './agent.fragments';
import { MEASURE_FIELDS } from './measure.fragments';
import { RESOURCE_SPECIFICATION_FIELDS } from './resource-specification.fragments';

/**
 * Fragment for essential EconomicResource fields.
 */
export const ECONOMIC_RESOURCE_FIELDS = gql`
	${AGENT_FIELDS}
	${MEASURE_FIELDS}
	${RESOURCE_SPECIFICATION_FIELDS}
	fragment EconomicResourceFields on EconomicResource {
		id
		name
		note
		trackingIdentifier
		currentLocation
		primaryAccountable {
			...AgentFields
		}
		custodian {
			...AgentFields
		}
		providedBy {
			...AgentFields
		}
		conformsTo {
			...ResourceSpecificationFields
		}
		accountingQuantity {
			...MeasureFields
		}
		onhandQuantity {
			...MeasureFields
		}
		# Note: 'currentQuantity' is often an application-level concept,
		# derived from accountingQuantity or onhandQuantity.
		# We will alias accountingQuantity as currentQuantity for now.
		currentQuantity: accountingQuantity {
			...MeasureFields
		}
	}
`;
