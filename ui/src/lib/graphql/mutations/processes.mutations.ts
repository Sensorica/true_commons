import { gql } from '@apollo/client/core';

export const CREATE_PROCESS = gql`
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

export const UPDATE_PROCESS = gql`
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

export const DELETE_PROCESS = gql`
	mutation DeleteProcess($id: ID!) {
		deleteProcess(id: $id)
	}
`;
