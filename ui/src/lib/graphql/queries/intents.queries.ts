export const GET_INTENTS = `
	query GetIntents {
		intents {
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
					satisfiedBy {
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

export const GET_INTENT = `
	query GetIntent($id: ID!) {
		intent(id: $id) {
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
			plannedWithin {
				id
				name
			}
		}
	}
`;

export const GET_INTENTS_BY_PROVIDER = `
	query GetIntentsByProvider($providerId: ID!) {
		intents(filter: { provider: $providerId }) {
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
					satisfiedBy {
						id
						note
					}
				}
			}
		}
	}
`;

export const GET_INTENTS_BY_RECEIVER = `
	query GetIntentsByReceiver($receiverId: ID!) {
		intents(filter: { receiver: $receiverId }) {
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
					satisfiedBy {
						id
						note
					}
				}
			}
		}
	}
`;

export const GET_UNSATISFIED_INTENTS = `
	query GetUnsatisfiedIntents {
		intents(filter: { satisfied: false }) {
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
				}
			}
		}
	}
`;

export const GET_INTENTS_FOR_MATCHING = `
	query GetIntentsForMatching($action: String, $resourceConformsTo: String) {
		intents(filter: { action: $action, resourceConformsTo: $resourceConformsTo, satisfied: false }) {
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
				}
			}
		}
	}
`; 