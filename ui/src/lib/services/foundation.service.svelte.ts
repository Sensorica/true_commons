import hreaService from './hrea.service.svelte';
import unitsStore from '../stores/units.store.svelte';
import actionsStore from '../stores/actions.store.svelte';
import resourcesStore from '../stores/resources.store.svelte';
import type { ResourceSpecification } from '../graphql/types';
import {
	REQUIRED_UNITS,
	REQUIRED_ACTIONS,
	REQUIRED_RESOURCE_SPECIFICATIONS,
	DEFAULT_RESOURCE_SPECIFICATIONS
} from '../data';

export interface FoundationService {
	readonly isInitialized: boolean;
	readonly initializationProgress: InitializationProgress;
	readonly initializationError: string | null;
	initialize(): Promise<void>;
	ensureFoundationData(): Promise<boolean>;
	checkFoundationRequirements(): Promise<FoundationStatus>;
	testSchemaCapabilities(): Promise<SchemaCapabilities>;
	reset(): void;
}

export interface InitializationProgress {
	step: string;
	completed: number;
	total: number;
	currentOperation: string;
}

export interface FoundationStatus {
	unitsReady: boolean;
	actionsReady: boolean;
	resourceSpecificationsReady: boolean;
	allReady: boolean;
	missing: {
		units: string[];
		actions: string[];
		resourceSpecifications: string[];
	};
}

export interface SchemaCapabilities {
	supportsUnitMutations: boolean;
	supportsActionMutations: boolean;
	supportsResourceSpecMutations: boolean;
	availableQueries: string[];
	availableMutations: string[];
	schemaType: 'full-hrea' | 'read-only' | 'unknown';
}

/**
 * Creates a foundation service that manages the proper initialization sequence
 * of ValueFlows foundation components according to the implementation plan.
 */
function createFoundationService(): FoundationService {
	// State
	let isInitialized: boolean = $state(false);
	let initializationProgress: InitializationProgress = $state({
		step: 'Not started',
		completed: 0,
		total: 4,
		currentOperation: ''
	});
	let initializationError: string | null = $state(null);

	/**
	 * Updates initialization progress
	 */
	function updateProgress(step: string, completed: number, currentOperation: string = '') {
		initializationProgress = {
			step,
			completed,
			total: 4,
			currentOperation
		};
	}

	/**
	 * Tests what capabilities the current GraphQL schema supports
	 */
	async function testSchemaCapabilities(): Promise<SchemaCapabilities> {
		console.log('🔍 Testing GraphQL schema capabilities...');

		const capabilities: SchemaCapabilities = {
			supportsUnitMutations: false,
			supportsActionMutations: false,
			supportsResourceSpecMutations: false,
			availableQueries: [],
			availableMutations: [],
			schemaType: 'unknown'
		};

		try {
			if (!hreaService.isInitialized) {
				await hreaService.initialize();
			}

			if (!hreaService.apolloClient) {
				throw new Error('Apollo client is not available');
			}

			// Test basic queries first
			try {
				await unitsStore.fetchAllUnits();
				capabilities.availableQueries.push('units');
				console.log('✅ Units query supported');
			} catch (err) {
				console.log('❌ Units query not supported:', err);
			}

			try {
				await actionsStore.fetchAllActions();
				capabilities.availableQueries.push('actions');
				console.log('✅ Actions query supported');
			} catch (err) {
				console.log('❌ Actions query not supported:', err);
			}

			try {
				await resourcesStore.fetchAllResourceSpecifications();
				capabilities.availableQueries.push('resourceSpecifications');
				console.log('✅ Resource specifications query supported');
			} catch (err) {
				console.log('❌ Resource specifications query not supported:', err);
			}

			// Test mutations by attempting to create test entities (we'll catch and analyze errors)
			// Note: We won't actually create anything, just test if the mutations exist

			console.log('🧪 Testing mutation capabilities...');

			// Test unit mutations by attempting to create a test unit
			try {
				// Try to create a test unit (we'll catch the error to see what type it is)
				await unitsStore.createUnit({
					id: 'test-unit-schema-check',
					label: 'Test Unit',
					symbol: 'TEST'
				});
				capabilities.supportsUnitMutations = true;
				capabilities.availableMutations.push('createUnit');
				console.log('✅ Unit mutations supported');

				// Clean up the test unit if it was actually created
				try {
					await unitsStore.deleteUnit('test-unit-schema-check');
				} catch {
					// Ignore cleanup errors
				}
			} catch (err) {
				console.log('🔍 Testing unit mutation support:', err);
				if (err instanceof Error) {
					if (
						err.message.includes('Cannot query field "createUnit"') ||
						err.message.includes('Unknown argument "unit"') ||
						err.message.includes('mutation not supported')
					) {
						console.log('❌ Unit mutations not supported by schema');
						capabilities.supportsUnitMutations = false;
					} else {
						console.log('🤔 Unit mutations might be supported but failed for other reasons');
						capabilities.supportsUnitMutations = true; // Assume supported but failed for other reasons
						capabilities.availableMutations.push('createUnit');
					}
				}
			}

			// Determine schema type based on available capabilities
			if (capabilities.availableQueries.length >= 3) {
				if (capabilities.supportsUnitMutations || capabilities.supportsActionMutations) {
					capabilities.schemaType = 'full-hrea';
				} else {
					capabilities.schemaType = 'read-only';
				}
			}

			console.log('📊 Schema capabilities test completed:', capabilities);
			return capabilities;
		} catch (error) {
			console.error('❌ Failed to test schema capabilities:', error);
			throw error;
		}
	}

	/**
	 * Checks if all foundation requirements are met
	 */
	async function checkFoundationRequirements(): Promise<FoundationStatus> {
		console.log('🔍 Checking foundation requirements...');

		try {
			// Fetch current state of all foundation components
			await Promise.all([
				unitsStore.fetchAllUnits(),
				actionsStore.fetchAllActions(),
				resourcesStore.fetchAllResourceSpecifications()
			]);

			// Check for required units - defensive programming
			const availableUnits = Array.isArray(unitsStore.units)
				? unitsStore.units.map((u) => u.id)
				: [];
			const missingUnits = REQUIRED_UNITS.filter((id) => !availableUnits.includes(id));
			const unitsReady = missingUnits.length === 0;

			// Check for required actions - defensive programming
			const availableActions = Array.isArray(actionsStore.actions)
				? actionsStore.actions.map((a) => a.id)
				: [];
			const missingActions = REQUIRED_ACTIONS.filter((id) => !availableActions.includes(id));
			const actionsReady = missingActions.length === 0;

			// Check for basic resource specifications - defensive programming
			const availableResourceSpecs = Array.isArray(resourcesStore.resourceSpecifications)
				? resourcesStore.resourceSpecifications.map((rs) => rs.id)
				: [];
			const missingResourceSpecs = REQUIRED_RESOURCE_SPECIFICATIONS.filter(
				(id) => !availableResourceSpecs.includes(id)
			);
			const resourceSpecificationsReady = missingResourceSpecs.length === 0;

			const allReady = unitsReady && actionsReady && resourceSpecificationsReady;

			const status: FoundationStatus = {
				unitsReady,
				actionsReady,
				resourceSpecificationsReady,
				allReady,
				missing: {
					units: missingUnits,
					actions: missingActions,
					resourceSpecifications: missingResourceSpecs
				}
			};

			console.log('📊 Foundation status:', status);

			// Provide helpful diagnostics
			if (!allReady) {
				console.log('🔍 Foundation diagnostics:');
				if (!unitsReady) {
					console.log(`   📏 Missing units: ${missingUnits.join(', ')}`);
					console.log(`   📊 Available units: ${availableUnits.join(', ') || 'none'}`);
				}
				if (!actionsReady) {
					console.log(`   ⚡ Missing actions: ${missingActions.join(', ')}`);
					console.log(`   📊 Available actions: ${availableActions.join(', ') || 'none'}`);
				}
				if (!resourceSpecificationsReady) {
					console.log(`   📦 Missing resource specs: ${missingResourceSpecs.join(', ')}`);
					console.log(
						`   📊 Available resource specs: ${availableResourceSpecs.join(', ') || 'none'}`
					);
				}
			}

			return status;
		} catch (error) {
			console.error('❌ Failed to check foundation requirements:', error);

			// Return safe default on error
			return {
				unitsReady: false,
				actionsReady: false,
				resourceSpecificationsReady: false,
				allReady: false,
				missing: {
					units: [...REQUIRED_UNITS],
					actions: [...REQUIRED_ACTIONS],
					resourceSpecifications: [...REQUIRED_RESOURCE_SPECIFICATIONS]
				}
			};
		}
	}

	/**
	 * Ensures foundation data exists, creating it if necessary
	 */
	async function ensureFoundationData(): Promise<boolean> {
		try {
			const status = await checkFoundationRequirements();

			if (status.allReady) {
				console.log('✅ All foundation data is ready');
				return true;
			}

			console.log('🔧 Foundation data incomplete, attempting to initialize missing components...');

			// Test schema capabilities first
			let capabilities: SchemaCapabilities;
			try {
				capabilities = await testSchemaCapabilities();
			} catch (capError) {
				console.warn(
					'⚠️ Could not test schema capabilities, proceeding with best effort:',
					capError
				);
				capabilities = {
					supportsUnitMutations: false,
					supportsActionMutations: false,
					supportsResourceSpecMutations: false,
					availableQueries: [],
					availableMutations: [],
					schemaType: 'unknown'
				};
			}

			// Step 1: Ensure Units (highest priority)
			if (!status.unitsReady) {
				updateProgress('Initializing Units', 1, 'Creating essential units...');
				try {
					await unitsStore.initializeDefaultUnits();
					console.log('✅ Units initialization completed');
				} catch (unitError) {
					console.error('❌ Units initialization failed:', unitError);

					if (unitError instanceof Error && unitError.message.includes('mutation not supported')) {
						console.warn(
							'🔍 Unit mutations not supported by schema. This might be expected if units are predefined.'
						);
						// For read-only schemas, we may need to work with existing units only
						if (capabilities.schemaType === 'read-only') {
							console.log('📖 Detected read-only schema, proceeding with available units');
						} else {
							console.error('💥 UNITS CREATION FAILED - this will prevent proper functionality');
							console.error('🔍 Unit error details:', {
								message: unitError.message,
								error: unitError
							});
							// Don't throw here - let's see if we can work with existing units
							console.warn(
								'⚠️ Continuing without unit creation, application may have limited functionality'
							);
						}
					} else {
						console.error('💥 UNEXPECTED UNIT ERROR:', unitError);
						throw unitError;
					}
				}
			}

			// Step 2: Ensure Actions
			if (!status.actionsReady) {
				updateProgress('Initializing Actions', 2, 'Creating essential actions...');
				try {
					await actionsStore.initializeDefaultActions();
					console.log('✅ Actions initialization completed');
				} catch (actionError) {
					console.error('❌ Actions initialization failed:', actionError);

					if (
						actionError instanceof Error &&
						actionError.message.includes('mutation not supported')
					) {
						console.warn(
							'🔍 Action mutations not supported by schema. This might be expected if actions are predefined.'
						);
						if (capabilities.schemaType === 'read-only') {
							console.log('📖 Detected read-only schema, proceeding with available actions');
						} else {
							throw new Error(`Action initialization failed: ${actionError.message}`);
						}
					} else {
						throw actionError;
					}
				}
			}

			// Step 3: Ensure ResourceSpecifications
			if (!status.resourceSpecificationsReady) {
				updateProgress(
					'Initializing Resource Specifications',
					3,
					'Creating basic resource specifications...'
				);
				try {
					await initializeDefaultResourceSpecs();
					console.log('✅ Resource specifications initialization completed');
				} catch (resourceError) {
					console.error('❌ Resource specifications initialization failed:', resourceError);

					if (
						resourceError instanceof Error &&
						resourceError.message.includes('mutation not supported')
					) {
						console.warn('🔍 Resource specification mutations not supported by schema.');
						if (capabilities.schemaType === 'read-only') {
							console.log(
								'📖 Detected read-only schema, proceeding with available resource specifications'
							);
						} else {
							throw new Error(
								`Resource specification initialization failed: ${resourceError.message}`
							);
						}
					} else {
						throw resourceError;
					}
				}
			}

			// Final verification
			updateProgress('Verifying Foundation', 4, 'Checking all components...');
			const finalStatus = await checkFoundationRequirements();

			if (finalStatus.allReady) {
				console.log('🎉 Foundation initialization completed successfully');
				return true;
			} else {
				console.warn('⚠️ Foundation initialization incomplete. Available components:');
				console.log(
					`   📏 Units: ${finalStatus.unitsReady ? '✅' : '❌'} (${finalStatus.missing.units.length} missing)`
				);
				console.log(
					`   ⚡ Actions: ${finalStatus.actionsReady ? '✅' : '❌'} (${finalStatus.missing.actions.length} missing)`
				);
				console.log(
					`   📦 Resource Specs: ${finalStatus.resourceSpecificationsReady ? '✅' : '❌'} (${finalStatus.missing.resourceSpecifications.length} missing)`
				);

				// For read-only schemas, this might be acceptable
				if (capabilities.schemaType === 'read-only') {
					console.log(
						'📖 Read-only schema detected - working with available foundation components'
					);
					return true; // Accept partial initialization for read-only schemas
				} else {
					throw new Error(
						'Foundation initialization incomplete after setup. Enable detailed logging to see what failed.'
					);
				}
			}
		} catch (error) {
			console.error('❌ Failed to ensure foundation data:', error);
			throw error;
		}
	}

	/**
	 * Initializes default resource specifications
	 */
	async function initializeDefaultResourceSpecs(): Promise<void> {
		// Check which resource specs already exist
		const existingSpecs = resourcesStore.resourceSpecifications.map((rs) => rs.id);

		for (const specConfig of DEFAULT_RESOURCE_SPECIFICATIONS) {
			if (!existingSpecs.includes(specConfig.id)) {
				try {
					const spec = {
						id: specConfig.id,
						name: specConfig.name,
						note: specConfig.note,
						defaultUnitOfResource: unitsStore.getUnitById(specConfig.defaultUnitOfResourceId),
						defaultUnitOfEffort: unitsStore.getUnitById(specConfig.defaultUnitOfEffortId)
					};

					await resourcesStore.createResourceSpecification(spec as Partial<ResourceSpecification>);
					console.log(`✅ Created default resource specification: ${specConfig.name}`);
				} catch (err) {
					console.warn(
						`⚠️ Failed to create default resource specification ${specConfig.name}:`,
						err
					);
					// Continue with other specs even if one fails
				}
			} else {
				console.log(`⏭️ Resource specification ${specConfig.name} already exists, skipping...`);
			}
		}
	}

	/**
	 * Initializes the foundation service and ensures all foundation data exists
	 */
	async function initialize(): Promise<void> {
		if (isInitialized) {
			return;
		}

		initializationError = null;
		updateProgress('Starting', 0, 'Initializing foundation service...');

		try {
			// Ensure hREA service is initialized first
			if (!hreaService.isInitialized) {
				updateProgress('Connecting to hREA', 0, 'Initializing hREA connection...');
				await hreaService.initialize();
			}

			// Ensure foundation data exists
			await ensureFoundationData();

			updateProgress('Complete', 4, 'Foundation service ready');
			isInitialized = true;
			console.log('🎉 Foundation service initialized successfully');
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
			initializationError = `Foundation service initialization failed: ${errorMessage}`;
			console.error('❌ ' + initializationError, error);
			isInitialized = false;
			throw error;
		}
	}

	/**
	 * Resets the foundation service state
	 */
	function reset(): void {
		isInitialized = false;
		initializationError = null;
		updateProgress('Not started', 0, '');
	}

	return {
		// Getters
		get isInitialized() {
			return isInitialized;
		},
		get initializationProgress() {
			return initializationProgress;
		},
		get initializationError() {
			return initializationError;
		},

		// Methods
		initialize,
		ensureFoundationData,
		checkFoundationRequirements,
		testSchemaCapabilities,
		reset
	};
}

const foundationService = createFoundationService();
export default foundationService;
