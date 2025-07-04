export const UPDATE_ECONOMIC_RESOURCE = `
  mutation UpdateEconomicResource($resource: EconomicResourceUpdateParams!) {
    updateEconomicResource(resource: $resource) {
      economicResource {
        id
      }
    }
  }
`;
