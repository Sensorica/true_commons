export const CREATE_PROCESS = `
	mutation CreateProcess($process: ProcessCreateParams!) {
		createProcess(process: $process) {
			process {
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
`;

export const UPDATE_PROCESS = `
	mutation UpdateProcess($id: ID!, $process: ProcessUpdateParams!) {
		updateProcess(id: $id, process: $process) {
			process {
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
`;

export const DELETE_PROCESS = `
	mutation DeleteProcess($id: ID!) {
		deleteProcess(id: $id)
	}
`;

export const CREATE_PROCESS_SPECIFICATION = `
	mutation CreateProcessSpecification($processSpecification: ProcessSpecificationCreateParams!) {
		createProcessSpecification(processSpecification: $processSpecification) {
			processSpecification {
				id
				name
				note
				classifiedAs
			}
		}
	}
`;

export const UPDATE_PROCESS_SPECIFICATION = `
	mutation UpdateProcessSpecification($id: ID!, $processSpecification: ProcessSpecificationUpdateParams!) {
		updateProcessSpecification(id: $id, processSpecification: $processSpecification) {
			processSpecification {
				id
				name
				note
				classifiedAs
			}
		}
	}
`;

export const DELETE_PROCESS_SPECIFICATION = `
	mutation DeleteProcessSpecification($id: ID!) {
		deleteProcessSpecification(id: $id)
	}
`; 