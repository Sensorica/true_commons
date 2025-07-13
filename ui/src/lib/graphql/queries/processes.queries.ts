import { gql } from '@apollo/client/core';

export const GET_PROCESSES = gql`
	query GetProcesses {
		processes {
			edges {
				node {
					id
					name
					note
					basedOn {
						id
						name
					}
					inScopeOf {
						id
						name
					}
					hasBeginning
					hasEnd
					isFinished
					plannedWithin {
						id
						name
					}
				}
			}
		}
	}
`;

export const GET_PROCESS_WITH_EVENTS = gql`
	query GetProcessWithEvents($id: ID!) {
		process(id: $id) {
			id
			name
			note
			basedOn {
				id
				name
			}
			inScopeOf {
				id
				name
			}
			hasBeginning
			hasEnd
			isFinished
			plannedWithin {
				id
				name
			}
			inputs {
				id
				action {
					id
					label
					resourceEffect
				}
				provider {
					id
					name
				}
				receiver {
					id
					name
				}
				resourceInventoriedAs {
					id
					name
				}
				resourceQuantity {
					hasNumericalValue
					hasUnit {
						id
						label
						symbol
					}
				}
				effortQuantity {
					hasNumericalValue
					hasUnit {
						id
						label
						symbol
					}
				}
				hasPointInTime
				hasBeginning
				hasEnd
				note
			}
			outputs {
				id
				action {
					id
					label
					resourceEffect
				}
				provider {
					id
					name
				}
				receiver {
					id
					name
				}
				resourceInventoriedAs {
					id
					name
				}
				resourceQuantity {
					hasNumericalValue
					hasUnit {
						id
						label
						symbol
					}
				}
				effortQuantity {
					hasNumericalValue
					hasUnit {
						id
						label
						symbol
					}
				}
				hasPointInTime
				hasBeginning
				hasEnd
				note
			}
		}
	}
`;

export const GET_PROCESS_INPUTS = gql`
	query GetProcessInputs($id: ID!) {
		process(id: $id) {
			id
			name
			inputs {
				id
				action {
					id
					label
					resourceEffect
				}
				provider {
					id
					name
				}
				receiver {
					id
					name
				}
				resourceInventoriedAs {
					id
					name
				}
				resourceQuantity {
					hasNumericalValue
					hasUnit {
						id
						label
						symbol
					}
				}
				effortQuantity {
					hasNumericalValue
					hasUnit {
						id
						label
						symbol
					}
				}
				hasPointInTime
				hasBeginning
				hasEnd
				note
			}
		}
	}
`;

export const GET_PROCESS_OUTPUTS = gql`
	query GetProcessOutputs($id: ID!) {
		process(id: $id) {
			id
			name
			outputs {
				id
				action {
					id
					label
					resourceEffect
				}
				provider {
					id
					name
				}
				receiver {
					id
					name
				}
				resourceInventoriedAs {
					id
					name
				}
				resourceQuantity {
					hasNumericalValue
					hasUnit {
						id
						label
						symbol
					}
				}
				effortQuantity {
					hasNumericalValue
					hasUnit {
						id
						label
						symbol
					}
				}
				hasPointInTime
				hasBeginning
				hasEnd
				note
			}
		}
	}
`;
