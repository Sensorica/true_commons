import { getSchemaReference } from './schema-introspection';

/**
 * Simple function to get schema info with focus on Create Unit Mutation
 * Usage: In browser console or add to a component, call getSchema()
 */
export async function getSchema() {
	try {
		const result = await getSchemaReference();

		console.log('\n🎯 === CREATE UNIT MUTATION ANALYSIS ===');

		if (result.createUnitInfo.isSupported && result.createUnitInfo.mutation) {
			console.log('✅ createUnit mutation is SUPPORTED in the schema!');
			console.log('\n📊 CREATE UNIT MUTATION DETAILS:');
			console.log(`  Name: ${result.createUnitInfo.mutation.name}`);
			console.log(`  Return Type: ${result.createUnitInfo.mutation.returnType}`);

			console.log('\n🔧 UNITCREATEPARAMS FIELDS:');
			result.createUnitInfo.unitCreateParamsFields.forEach((field) => {
				const requiredFlag = field.isRequired ? '✓ REQUIRED' : '○ Optional';
				console.log(`  ${field.name}: ${field.type} [${requiredFlag}]`);
			});

			console.log('\n📤 RESPONSE UNIT FIELDS:');
			result.createUnitInfo.unitFieldsInResponse.forEach((field) => {
				console.log(`  ${field.name}: ${field.type}`);
			});

			console.log('\n📋 TYPESCRIPT INTERFACE (Expected):');
			console.log('  interface UnitCreateParams {');
			result.createUnitInfo.unitCreateParamsFields.forEach((field) => {
				const optional = field.isRequired ? '' : '?';
				const cleanType = field.type.replace(/[!]/g, '');
				console.log(`    ${field.name}${optional}: ${cleanType};`);
			});
			console.log('  }');
		} else {
			console.log('❌ createUnit mutation is NOT SUPPORTED in the current schema');
		}

		console.log('\n📈 SUMMARY:');
		console.log(`  • Total mutations found: ${result.mutations.length}`);
		console.log(`  • Unit-related mutations: ${result.unitMutations.length}`);
		console.log(`  • createUnit supported: ${result.createUnitInfo.isSupported ? 'YES' : 'NO'}`);

		if (result.unitMutations.length > 0) {
			console.log('  • Available unit mutations:');
			result.unitMutations.forEach((mutation) => {
				console.log(`    - ${mutation.name}`);
			});
		}

		return result;
	} catch (error) {
		console.error('Failed to get schema:', error);
		throw error;
	}
}

// Make it globally available
if (typeof window !== 'undefined') {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(window as any).getSchema = getSchema;
}
