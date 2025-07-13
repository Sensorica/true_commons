export const GET_PROCESSES = `
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

export const GET_PROCESS_SPECIFICATIONS = `
	query GetProcessSpecifications {
		processSpecifications {
			edges {
				node {
					id
					name
					note
					classifiedAs
				}
			}
		}
	}
`;

export const GET_PROCESS_WITH_EVENTS = `
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

export const GET_PROCESS_INPUTS = `
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

export const GET_PROCESS_OUTPUTS = `
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
