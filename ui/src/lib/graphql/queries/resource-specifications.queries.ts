export const GET_RESOURCE_SPECIFICATION = `
	query GetResourceSpecification($id: ID!) {
		resourceSpecification(id: $id) {
			id
			name
			note
			defaultUnitOfEffort {
				id
				label
				symbol
			}
			defaultUnitOfResource {
				id
				label
				symbol
			}
		}
	}
`;

export const GET_RESOURCE_SPECIFICATIONS = `
	query GetResourceSpecifications {
		resourceSpecifications {
			edges {
				node {
					id
					name
					note
					defaultUnitOfEffort {
						id
						label
						symbol
					}
					defaultUnitOfResource {
						id
						label
						symbol
					}
				}
			}
		}
	}
`;

export const GET_RESOURCE_SPECIFICATIONS_BY_CLASS = `
	query GetResourceSpecificationsByClass($classifiedAs: [String!]!) {
		resourceSpecifications(classifiedAs: $classifiedAs) {
			edges {
				node {
					id
					name
					note
					defaultUnitOfEffort {
						id
						label
						symbol
					}
					defaultUnitOfResource {
						id
						label
						symbol
					}
				}
			}
		}
	}
`;
