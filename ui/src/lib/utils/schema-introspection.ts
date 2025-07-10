import { getIntrospectionQuery, buildClientSchema, printSchema } from 'graphql';
import { gql } from '@apollo/client/core';
import hreaService from '../services/hrea.service.svelte';

export interface SchemaMutation {
	name: string;
	description?: string;
	args: Array<{
		name: string;
		type: string;
		description?: string;
		defaultValue?: unknown;
	}>;
	returnType: string;
}

export interface SchemaIntrospectionResult {
	mutations: SchemaMutation[];
	unitMutations: SchemaMutation[];
	fullSchema: string;
}

/**
 * Introspects the GraphQL schema to extract mutation information
 */
export async function introspectSchema(): Promise<SchemaIntrospectionResult> {
	// Ensure hREA service is initialized
	if (!hreaService.isInitialized) {
		await hreaService.initialize();
	}

	if (!hreaService.apolloClient) {
		throw new Error('Apollo client is not available');
	}

	// Get the introspection query
	const introspectionQuery = gql(getIntrospectionQuery());

	// Execute introspection
	const result = await hreaService.apolloClient.query({
		query: introspectionQuery,
		fetchPolicy: 'network-only'
	});

	// Build client schema from introspection result
	const schema = buildClientSchema(result.data);

	// Get the full schema SDL
	const fullSchema = printSchema(schema);

	// Extract mutation information
	const mutationType = schema.getMutationType();
	const mutations: SchemaMutation[] = [];
	const unitMutations: SchemaMutation[] = [];

	if (mutationType) {
		const fields = mutationType.getFields();

		for (const [fieldName, field] of Object.entries(fields)) {
			const mutation: SchemaMutation = {
				name: fieldName,
				description: field.description || undefined,
				args: field.args.map((arg) => ({
					name: arg.name,
					type: arg.type.toString(),
					description: arg.description || undefined,
					defaultValue: arg.defaultValue
				})),
				returnType: field.type.toString()
			};

			mutations.push(mutation);

			// Check if this is a unit-related mutation
			if (
				fieldName.toLowerCase().includes('unit') ||
				mutation.args.some((arg) => arg.type.toLowerCase().includes('unit'))
			) {
				unitMutations.push(mutation);
			}
		}
	}

	return {
		mutations,
		unitMutations,
		fullSchema
	};
}

/**
 * Prints the schema introspection results in a readable format
 */
export function printSchemaInfo(result: SchemaIntrospectionResult): void {
	console.log('=== GraphQL Schema Introspection ===\n');

	console.log('=== UNIT-RELATED MUTATIONS ===');
	if (result.unitMutations.length === 0) {
		console.log('No unit-related mutations found.');
	} else {
		result.unitMutations.forEach((mutation) => {
			console.log(`\n${mutation.name}:`);
			if (mutation.description) {
				console.log(`  Description: ${mutation.description}`);
			}
			console.log(`  Return Type: ${mutation.returnType}`);
			if (mutation.args.length > 0) {
				console.log('  Arguments:');
				mutation.args.forEach((arg) => {
					console.log(`    ${arg.name}: ${arg.type}`);
					if (arg.description) {
						console.log(`      Description: ${arg.description}`);
					}
					if (arg.defaultValue !== undefined) {
						console.log(`      Default: ${arg.defaultValue}`);
					}
				});
			}
		});
	}

	console.log('\n=== ALL MUTATIONS ===');
	result.mutations.forEach((mutation) => {
		console.log(`\n${mutation.name}:`);
		if (mutation.description) {
			console.log(`  Description: ${mutation.description}`);
		}
		console.log(`  Return Type: ${mutation.returnType}`);
		if (mutation.args.length > 0) {
			console.log('  Arguments:');
			mutation.args.forEach((arg) => {
				console.log(`    ${arg.name}: ${arg.type}`);
				if (arg.description) {
					console.log(`      Description: ${arg.description}`);
				}
			});
		}
	});

	console.log('\n=== FULL SCHEMA SDL ===');
	console.log(result.fullSchema);
}

/**
 * Gets schema information and logs it to console
 */
export async function getSchemaReference(): Promise<SchemaIntrospectionResult> {
	try {
		console.log('🔍 Introspecting GraphQL schema...');
		const result = await introspectSchema();
		printSchemaInfo(result);
		console.log('✅ Schema introspection completed');
		return result;
	} catch (error) {
		console.error('❌ Schema introspection failed:', error);
		throw error;
	}
}
