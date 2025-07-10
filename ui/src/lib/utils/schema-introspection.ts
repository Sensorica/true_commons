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

export interface CreateUnitMutationInfo {
	mutation: SchemaMutation | null;
	unitCreateParamsFields: Array<{
		name: string;
		type: string;
		description?: string;
		isRequired: boolean;
	}>;
	unitFieldsInResponse: Array<{
		name: string;
		type: string;
		description?: string;
	}>;
	isSupported: boolean;
}

export interface SchemaIntrospectionResult {
	mutations: SchemaMutation[];
	unitMutations: SchemaMutation[];
	createUnitInfo: CreateUnitMutationInfo;
	fullSchema: string;
}

/**
 * Extracts detailed information about the createUnit mutation and UnitCreateParams
 */
function extractCreateUnitMutationInfo(schema: any): CreateUnitMutationInfo {
	const result: CreateUnitMutationInfo = {
		mutation: null,
		unitCreateParamsFields: [],
		unitFieldsInResponse: [],
		isSupported: false
	};

	try {
		const mutationType = schema.getMutationType();
		if (!mutationType) {
			return result;
		}

		// Find the createUnit mutation
		const createUnitField = mutationType.getFields()['createUnit'];
		if (!createUnitField) {
			console.log('❌ createUnit mutation not found in schema');
			return result;
		}

		// Extract mutation info
		result.mutation = {
			name: 'createUnit',
			description: createUnitField.description || undefined,
			args: createUnitField.args.map((arg: any) => ({
				name: arg.name,
				type: arg.type.toString(),
				description: arg.description || undefined,
				defaultValue: arg.defaultValue
			})),
			returnType: createUnitField.type.toString()
		};

		// Extract UnitCreateParams fields
		const unitArg = createUnitField.args.find((arg: any) => arg.name === 'unit');
		if (unitArg) {
			let inputType = unitArg.type;
			
			// Unwrap NonNull type if present
			if (inputType.ofType) {
				inputType = inputType.ofType;
			}

			if (inputType.getFields) {
				const fields = inputType.getFields();
				for (const [fieldName, field] of Object.entries(fields)) {
					const fieldInfo = field as any;
					result.unitCreateParamsFields.push({
						name: fieldName,
						type: fieldInfo.type.toString(),
						description: fieldInfo.description || undefined,
						isRequired: fieldInfo.type.toString().includes('!')
					});
				}
			}
		}

		// Extract Unit fields from response type
		try {
			const unitType = schema.getType('Unit');
			if (unitType && unitType.getFields) {
				const fields = unitType.getFields();
				for (const [fieldName, field] of Object.entries(fields)) {
					const fieldInfo = field as any;
					result.unitFieldsInResponse.push({
						name: fieldName,
						type: fieldInfo.type.toString(),
						description: fieldInfo.description || undefined
					});
				}
			}
		} catch (err) {
			console.warn('Could not extract Unit response fields:', err);
		}

		result.isSupported = true;
		console.log('✅ createUnit mutation found and analyzed');

	} catch (error) {
		console.error('❌ Error analyzing createUnit mutation:', error);
	}

	return result;
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

	// Extract detailed createUnit mutation info
	const createUnitInfo = extractCreateUnitMutationInfo(schema);

	return {
		mutations,
		unitMutations,
		createUnitInfo,
		fullSchema
	};
}

/**
 * Prints the schema introspection results with focus on createUnit mutation
 */
export function printSchemaInfo(result: SchemaIntrospectionResult): void {
	console.log('=== GraphQL Schema Introspection ===\n');

	// Focus on createUnit mutation first
	console.log('=== CREATE UNIT MUTATION ANALYSIS ===');
	if (result.createUnitInfo.isSupported && result.createUnitInfo.mutation) {
		const mutation = result.createUnitInfo.mutation;
		console.log(`\n🎯 ${mutation.name}:`);
		if (mutation.description) {
			console.log(`  Description: ${mutation.description}`);
		}
		console.log(`  Return Type: ${mutation.returnType}`);
		
		console.log('\n📝 Mutation Arguments:');
		mutation.args.forEach((arg) => {
			console.log(`    ${arg.name}: ${arg.type}`);
			if (arg.description) {
				console.log(`      Description: ${arg.description}`);
			}
		});

		console.log('\n🔧 UnitCreateParams Fields:');
		if (result.createUnitInfo.unitCreateParamsFields.length > 0) {
			result.createUnitInfo.unitCreateParamsFields.forEach((field) => {
				const requiredFlag = field.isRequired ? ' (required)' : ' (optional)';
				console.log(`    ${field.name}: ${field.type}${requiredFlag}`);
				if (field.description) {
					console.log(`      Description: ${field.description}`);
				}
			});
		} else {
			console.log('    No fields found for UnitCreateParams');
		}

		console.log('\n📤 Unit Response Fields:');
		if (result.createUnitInfo.unitFieldsInResponse.length > 0) {
			result.createUnitInfo.unitFieldsInResponse.forEach((field) => {
				console.log(`    ${field.name}: ${field.type}`);
				if (field.description) {
					console.log(`      Description: ${field.description}`);
				}
			});
		} else {
			console.log('    No fields found for Unit response type');
		}

		console.log('\n💡 Example Usage:');
		console.log('    mutation CreateUnit($unit: UnitCreateParams!) {');
		console.log('      createUnit(unit: $unit) {');
		console.log('        unit {');
		result.createUnitInfo.unitFieldsInResponse.forEach((field) => {
			console.log(`          ${field.name}`);
		});
		console.log('        }');
		console.log('      }');
		console.log('    }');

		console.log('\n📋 Sample Variables:');
		console.log('    {');
		console.log('      "unit": {');
		console.log('        "omUnitIdentifier": "kg",');
		console.log('        "label": "Kilogram",');
		console.log('        "symbol": "kg",');
		console.log('        "classifiedAs": ["mass", "weight"]');
		console.log('      }');
		console.log('    }');

	} else {
		console.log('❌ createUnit mutation is not supported in the current schema');
	}

	console.log('\n=== ALL UNIT-RELATED MUTATIONS ===');
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
