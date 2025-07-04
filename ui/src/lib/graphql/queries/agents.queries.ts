export const GET_AGENTS = `
  query GetAgents {
    agents {
      edges {
        node {
          id
          name
          note
          primaryLocation
          canonicalUrl
        }
      }
    }
  }
`;

export const GET_MY_AGENT = `
  query GetMyAgent {
    myAgent {
      id
      name
      note
      primaryLocation
      canonicalUrl
    }
  }
`;
