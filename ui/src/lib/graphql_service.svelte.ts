import { ApolloClient, InMemoryCache, type DocumentNode } from '@apollo/client/core';

class GraphQLService {
	private client: ApolloClient<unknown> | null = null;

	connect(uri: string): void {
		this.client = new ApolloClient({
			uri,
			cache: new InMemoryCache(),
			defaultOptions: {
				watchQuery: {
					errorPolicy: 'all'
				},
				query: {
					errorPolicy: 'all'
				}
			}
		});
	}

	async query<T>(query: DocumentNode, variables?: Record<string, unknown>): Promise<T> {
		if (!this.client) {
			throw new Error('GraphQL client not connected. Call connect() first.');
		}

		try {
			const result = await this.client.query({
				query,
				variables,
				fetchPolicy: 'network-only'
			});

			if (result.errors) {
				console.warn('GraphQL query returned errors:', result.errors);
			}

			return result.data as T;
		} catch (error) {
			console.error('GraphQL query failed:', error);
			throw error;
		}
	}

	async mutation<T>(mutation: DocumentNode, variables?: Record<string, unknown>): Promise<T> {
		if (!this.client) {
			throw new Error('GraphQL client not connected. Call connect() first.');
		}

		try {
			const result = await this.client.mutate({
				mutation,
				variables
			});

			if (result.errors) {
				console.warn('GraphQL mutation returned errors:', result.errors);
			}

			return result.data as T;
		} catch (error) {
			console.error('GraphQL mutation failed:', error);
			throw error;
		}
	}

	get isConnected(): boolean {
		return this.client !== null;
	}
}

// Export a singleton instance
const graphqlService = new GraphQLService();
export default graphqlService;
