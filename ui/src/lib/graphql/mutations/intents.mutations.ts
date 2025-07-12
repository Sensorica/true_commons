export const CREATE_INTENT = `
	mutation CreateIntent($intent: IntentCreateParams!) {
		createIntent(intent: $intent) {
			intent {
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
				plannedWithin {
					id
					name
				}
			}
		}
	}
`;

export const UPDATE_INTENT = `
	mutation UpdateIntent($id: ID!, $intent: IntentUpdateParams!) {
		updateIntent(id: $id, intent: $intent) {
			intent {
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
				plannedWithin {
					id
					name
				}
			}
		}
	}
`;

export const DELETE_INTENT = `
	mutation DeleteIntent($id: ID!) {
		deleteIntent(id: $id)
	}
`;

export const PROPOSE_INTENT = `
	mutation ProposeIntent($intentId: ID!, $note: String) {
		proposeIntent(intentId: $intentId, note: $note) {
			intent {
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
`; 