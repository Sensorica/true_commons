export const CREATE_PERSON = `
  mutation CreatePerson($person: PersonCreateParams!) {
    createPerson(person: $person) {
      agent {
        id
        name
        note
        primaryLocation
      }
    }
  }
`;
