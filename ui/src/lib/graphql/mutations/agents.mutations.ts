export const CREATE_PERSON = `
  mutation CreatePerson($person: AgentCreateParams!) {
    createPerson(person: $person) {
      agent {
        id
        name
        note
        image
      }
    }
  }
`;
