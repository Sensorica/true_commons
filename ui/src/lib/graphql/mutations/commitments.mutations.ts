export const CREATE_COMMITMENT = `
	mutation CreateCommitment($commitment: CommitmentCreateParams!) {
		createCommitment(commitment: $commitment) {
			commitment {
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
				plannedWithin {
					id
					name
				}
			}
		}
	}
`;

export const UPDATE_COMMITMENT = `
	mutation UpdateCommitment($id: ID!, $commitment: CommitmentUpdateParams!) {
		updateCommitment(id: $id, commitment: $commitment) {
			commitment {
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
				plannedWithin {
					id
					name
				}
			}
		}
	}
`;

export const DELETE_COMMITMENT = `
	mutation DeleteCommitment($id: ID!) {
		deleteCommitment(id: $id)
	}
`;

export const FULFILL_COMMITMENT = `
	mutation FulfillCommitment($commitmentId: ID!, $eventId: ID!) {
		fulfillCommitment(commitmentId: $commitmentId, eventId: $eventId) {
			commitment {
				id
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
			}
		}
	}
`;

export const SATISFY_INTENT = `
	mutation SatisfyIntent($commitmentId: ID!, $intentId: ID!) {
		satisfyIntent(commitmentId: $commitmentId, intentId: $intentId) {
			commitment {
				id
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
			}
			intent {
				id
				satisfiedBy {
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
			}
		}
	}
`; 