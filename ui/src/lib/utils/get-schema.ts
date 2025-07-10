import { getSchemaReference } from './schema-introspection';

/**
 * Simple function to get schema info and log to console
 * Usage: In browser console or add to a component, call getSchema()
 */
export async function getSchema() {
	try {
		const result = await getSchemaReference();
		console.log('\n=== UNIT MUTATIONS FOUND ===');
		result.unitMutations.forEach((mutation) => {
			console.log(`${mutation.name}: ${mutation.returnType}`);
			console.log('Arguments:', mutation.args.map((arg) => `${arg.name}: ${arg.type}`).join(', '));
		});
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
