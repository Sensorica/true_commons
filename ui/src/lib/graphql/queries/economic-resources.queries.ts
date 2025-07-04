export const GET_ECONOMIC_RESOURCES = `
  query GetEconomicResources {
    economicResources {
      edges {
        node {
          id
          name
          note
          trackingIdentifier
          currentLocation
          primaryAccountable {
            id
            name
          }
          custodian {
            id
            name
          }
          conformsTo {
            id
            name
          }
          accountingQuantity {
            hasNumericalValue
            hasUnit {
              id
              label
              symbol
            }
          }
          onhandQuantity {
            hasNumericalValue
            hasUnit {
              id
              label
              symbol
            }
          }
        }
      }
    }
  }
`;
