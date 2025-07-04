export const CREATE_ECONOMIC_EVENT = `
  mutation CreateEconomicEvent($event: EconomicEventCreateParams!) {
    createEconomicEvent(event: $event) {
      economicEvent {
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
        note
      }
    }
  }
`;
