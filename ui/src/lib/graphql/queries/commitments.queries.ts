export const GET_COMMITMENTS = `
	query GetCommitments {
		commitments {
			edges {
				node {
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
					resourceConformsTo {
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
					hasBeginning
					hasEnd
					due
					note
					inScopeOf {
						id
						name
					}
					inputOf {
						id
						name
					}
					outputOf {
						id
						name
					}
					satisfies {
						id
						note
					}
					fulfilledBy {
						id
						note
					}
					plannedWithin {
						id
						name
					}
				}
			}
		}
	}
`;

export const GET_COMMITMENT = `
	query GetCommitment($id: ID!) {
		commitment(id: $id) {
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
			resourceConformsTo {
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
			hasBeginning
			hasEnd
			due
			note
			inScopeOf {
				id
				name
			}
			inputOf {
				id
				name
			}
			outputOf {
				id
				name
			}
			satisfies {
				id
				note
				action {
					id
					label
				}
				provider {
					id
					name
				}
				receiver {
					id
					name
				}
				resourceConformsTo {
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
				due
			}
			fulfilledBy {
				id
				note
				action {
					id
					label
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
			}
			plannedWithin {
				id
				name
			}
		}
	}
`;

export const GET_COMMITMENTS_BY_PROVIDER = `
	query GetCommitmentsByProvider($providerId: ID!) {
		commitments(filter: { provider: $providerId }) {
			edges {
				node {
					id
					action {
						id
						label
						resourceEffect
					}
					receiver {
						id
						name
					}
					resourceConformsTo {
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
					hasBeginning
					hasEnd
					due
					note
					satisfies {
						id
						note
					}
					fulfilledBy {
						id
						note
					}
				}
			}
		}
	}
`;

export const GET_COMMITMENTS_BY_RECEIVER = `
	query GetCommitmentsByReceiver($receiverId: ID!) {
		commitments(filter: { receiver: $receiverId }) {
			edges {
				node {
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
					resourceConformsTo {
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
					hasBeginning
					hasEnd
					due
					note
					satisfies {
						id
						note
					}
					fulfilledBy {
						id
						note
					}
				}
			}
		}
	}
`;

export const GET_UNFULFILLED_COMMITMENTS = `
	query GetUnfulfilledCommitments {
		commitments(filter: { fulfilled: false }) {
			edges {
				node {
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
					resourceConformsTo {
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
					hasBeginning
					hasEnd
					due
					note
					satisfies {
						id
						note
					}
				}
			}
		}
	}
`;
