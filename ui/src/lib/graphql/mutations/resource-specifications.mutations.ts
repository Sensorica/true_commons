export const CREATE_RESOURCE_SPECIFICATION = `
	mutation CreateResourceSpecification($resourceSpecification: ResourceSpecificationCreateParams!) {
		createResourceSpecification(resourceSpecification: $resourceSpecification) {
			resourceSpecification {
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
`;

export const UPDATE_RESOURCE_SPECIFICATION = `
	mutation UpdateResourceSpecification($id: ID!, $resourceSpecification: ResourceSpecificationUpdateParams!) {
		updateResourceSpecification(id: $id, resourceSpecification: $resourceSpecification) {
			resourceSpecification {
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
`;

export const DELETE_RESOURCE_SPECIFICATION = `
	mutation DeleteResourceSpecification($id: ID!) {
		deleteResourceSpecification(id: $id)
	}
`;
