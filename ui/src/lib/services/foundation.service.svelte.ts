import hreaService from './hrea.service.svelte';
import unitsStore from '../stores/units.store.svelte';
import actionsStore from '../stores/actions.store.svelte';
import resourcesStore from '../stores/resources.store.svelte';
import processSpecificationsStore from '../stores/process-specifications.store.svelte';
import type { ResourceSpecification, ProcessSpecificationCreateParams } from '../graphql/types';
import {
	REQUIRED_UNITS,
	REQUIRED_ACTIONS,
	REQUIRED_RESOURCE_SPECIFICATIONS,
	DEFAULT_RESOURCE_SPECIFICATIONS,
	DEFAULT_PROCESS_SPECIFICATIONS,
	REQUIRED_PROCESS_SPECIFICATIONS
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
	processSpecificationsReady: boolean;
	allReady: boolean;
	missing: {
		units: string[];
		actions: string[];
		resourceSpecifications: string[];
		processSpecifications: string[];
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
		total: 5,
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
			total: 5,
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

			// Test basic queries
			try {
				await unitsStore.fetchAllUnits();
				capabilities.availableQueries.push('units');
				console.log('✅ Units query supported');
			} catch {
				console.log('❌ Units query not supported');
			}

			try {
				await actionsStore.fetchAllActions();
				capabilities.availableQueries.push('actions');
				console.log('✅ Actions query supported');
			} catch {
				console.log('❌ Actions query not supported');
			}

			try {
				await resourcesStore.fetchAllResourceSpecifications();
				capabilities.availableQueries.push('resourceSpecifications');
				console.log('✅ Resource specifications query supported');
			} catch {
				console.log('❌ Resource specifications query not supported');
			}

			// Test unit mutations
			console.log('🧪 Testing unit mutation capabilities...');
			try {
				const testUnit = await unitsStore.createUnit({
					omUnitIdentifier: 'test-unit-schema-check',
					label: 'Test Unit',
					symbol: 'TEST'
				});
				capabilities.supportsUnitMutations = true;
				capabilities.availableMutations.push('createUnit');
				console.log('✅ Unit mutations supported');

				// Clean up test unit
				try {
					if (testUnit.revisionId) {
						await unitsStore.deleteUnit(testUnit.id, testUnit.revisionId);
					}
				} catch {
					// Ignore cleanup errors
				}
			} catch (err) {
				console.log('❌ Unit mutations failed:', err);
				if (err instanceof Error) {
					if (
						err.message.includes('Cannot query field "createUnit"') ||
						err.message.includes('Unknown argument "unit"') ||
						err.message.includes('mutation not supported')
					) {
						console.log('🔍 Unit mutations not supported by schema');
						capabilities.supportsUnitMutations = false;
					} else {
						console.log('🤔 Unit mutations might be supported but failed for other reasons');
						capabilities.supportsUnitMutations = true;
						capabilities.availableMutations.push('createUnit');
					}
				}
			}

			// Determine schema type
			if (capabilities.availableQueries.length >= 3) {
				if (capabilities.supportsUnitMutations || capabilities.supportsActionMutations) {
					capabilities.schemaType = 'full-hrea';
				} else {
					capabilities.schemaType = 'read-only';
				}
			}

			console.log('📊 Schema capabilities:', capabilities);
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
				unitsStore.fetchAllUnits(true),
				actionsStore.fetchAllActions(true),
				resourcesStore.fetchAllResourceSpecifications(true),
				processSpecificationsStore.fetchAllProcessSpecifications(true)
			]);

			// Check for required units by omUnitIdentifier
			const availableUnitOmIds = Array.isArray(unitsStore.units)
				? unitsStore.units.map((u) => u.omUnitIdentifier)
				: [];
			const missingUnits = REQUIRED_UNITS.filter((omId) => !availableUnitOmIds.includes(omId));
			const unitsReady = missingUnits.length === 0;

			// Check for required actions - more lenient since actions are read-only in hREA
			const availableActions = Array.isArray(actionsStore.actions)
				? actionsStore.actions.map((a) => a.id)
				: [];
			const missingActions = REQUIRED_ACTIONS.filter((id) => !availableActions.includes(id));
			// Consider actions ready if we have at least the core ValueFlows actions
			const coreActions = ['produce', 'consume', 'use', 'transfer'];
			const hasCoreActions = coreActions.every((id) => availableActions.includes(id));
			const actionsReady = hasCoreActions; // More lenient check

			// Check for basic resource specifications
			const availableResourceSpecs = Array.isArray(resourcesStore.resourceSpecifications)
				? resourcesStore.resourceSpecifications.map((rs) => rs.name)
				: [];
			const requiredResourceSpecNames = REQUIRED_RESOURCE_SPECIFICATIONS.map(
				(id) => DEFAULT_RESOURCE_SPECIFICATIONS.find((spec) => spec.id === id)?.name
			).filter((name): name is string => name !== undefined);
			const missingResourceSpecs = requiredResourceSpecNames.filter(
				(name) => !availableResourceSpecs.includes(name)
			);
			const resourceSpecificationsReady = missingResourceSpecs.length === 0;

			// Check for basic process specifications
			const availableProcessSpecs = Array.isArray(processSpecificationsStore.processSpecifications)
				? processSpecificationsStore.processSpecifications.map((ps) => ps.name)
				: [];
			const requiredProcessSpecNames = REQUIRED_PROCESS_SPECIFICATIONS.map(
				(id) => DEFAULT_PROCESS_SPECIFICATIONS.find((spec) => spec.id === id)?.name
			).filter((name): name is string => name !== undefined);
			const missingProcessSpecs = requiredProcessSpecNames.filter(
				(name) => !availableProcessSpecs.includes(name)
			);
			const processSpecificationsReady = missingProcessSpecs.length === 0;

			const allReady =
				unitsReady && actionsReady && resourceSpecificationsReady && processSpecificationsReady;

			const status: FoundationStatus = {
				unitsReady,
				actionsReady,
				resourceSpecificationsReady,
				processSpecificationsReady,
				allReady,
				missing: {
					units: missingUnits,
					actions: missingActions,
					resourceSpecifications: missingResourceSpecs,
					processSpecifications: missingProcessSpecs
				}
			};

			console.log('📊 Foundation status:', {
				unitsReady: `${unitsReady} (${missingUnits.length} missing)`,
				actionsReady: `${actionsReady} (${missingActions.length} missing)`,
				resourceSpecsReady: `${resourceSpecificationsReady} (${missingResourceSpecs.length} missing)`,
				processSpecsReady: `${processSpecificationsReady} (${missingProcessSpecs.length} missing)`
			});

			if (!allReady) {
				if (missingUnits.length > 0) {
					console.log(`📏 Missing units: ${missingUnits.join(', ')}`);
				}
				if (missingActions.length > 0) {
					console.log(`⚡ Missing actions: ${missingActions.join(', ')}`);
				}
				if (missingResourceSpecs.length > 0) {
					console.log(`📦 Missing resource specs: ${missingResourceSpecs.join(', ')}`);
				}
				if (missingProcessSpecs.length > 0) {
					console.log(`📜 Missing process specs: ${missingProcessSpecs.join(', ')}`);
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
				processSpecificationsReady: false,
				allReady: false,
				missing: {
					units: [...REQUIRED_UNITS],
					actions: [...REQUIRED_ACTIONS],
					resourceSpecifications: [...DEFAULT_RESOURCE_SPECIFICATIONS.map((s) => s.name)],
					processSpecifications: [...DEFAULT_PROCESS_SPECIFICATIONS.map((s) => s.name)]
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

			console.log('🔧 Foundation data incomplete, initializing missing components...');

			// Test schema capabilities first
			let capabilities: SchemaCapabilities;
			try {
				capabilities = await testSchemaCapabilities();
			} catch {
				console.warn('⚠️ Could not test schema capabilities, proceeding with best effort');
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
						console.warn('🔍 Unit mutations not supported by schema');
						if (capabilities.schemaType === 'read-only') {
							console.log('📖 Detected read-only schema, proceeding with available units');
						} else {
							console.error('💥 UNITS CREATION FAILED - this will prevent proper functionality');
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
						console.warn('🔍 Action mutations not supported by schema');
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
						console.warn('🔍 Resource specification mutations not supported by schema');
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

			// Step 4: Ensure ProcessSpecifications
			if (!status.processSpecificationsReady) {
				updateProgress(
					'Initializing Process Specifications',
					4,
					'Creating basic process specifications...'
				);
				try {
					await initializeDefaultProcessSpecs();
					console.log('✅ Process specifications initialization completed');
				} catch (processSpecError) {
					console.error('❌ Process specifications initialization failed:', processSpecError);
					throw processSpecError;
				}
			}

			// Final verification
			updateProgress('Verifying Foundation', 5, 'Checking all components...');
			const finalStatus = await checkFoundationRequirements();

			if (finalStatus.allReady) {
				console.log('🎉 Foundation initialization completed successfully');
				return true;
			} else {
				console.warn('⚠️ Foundation initialization incomplete');
				console.log(
					`Units: ${finalStatus.unitsReady ? '✅' : '❌'}, Actions: ${finalStatus.actionsReady ? '✅' : '❌'}, Resource Specs: ${finalStatus.resourceSpecificationsReady ? '✅' : '❌'}, Process Specs: ${finalStatus.processSpecificationsReady ? '✅' : '❌'}`
				);

				// For read-only schemas, this might be acceptable
				if (capabilities.schemaType === 'read-only') {
					console.log(
						'📖 Read-only schema detected - working with available foundation components'
					);
					return true;
				} else {
					throw new Error('Foundation initialization incomplete after setup');
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
		// Check which resource specs already exist by name
		const existingSpecNames = resourcesStore.resourceSpecifications.map((rs) => rs.name);

		for (const specConfig of DEFAULT_RESOURCE_SPECIFICATIONS) {
			if (!existingSpecNames.includes(specConfig.name)) {
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
	 * Initializes default process specifications
	 */
	async function initializeDefaultProcessSpecs(): Promise<void> {
		const existingSpecNames = processSpecificationsStore.processSpecifications.map((ps) => ps.name);

		for (const specConfig of DEFAULT_PROCESS_SPECIFICATIONS) {
			if (!existingSpecNames.includes(specConfig.name)) {
				try {
					const spec: ProcessSpecificationCreateParams = {
						name: specConfig.name,
						note: specConfig.note
					};
					await processSpecificationsStore.createProcessSpecification(spec);
					console.log(`✅ Created default process specification: ${specConfig.name}`);
				} catch (err) {
					console.warn(
						`⚠️ Failed to create default process specification ${specConfig.name}:`,
						err
					);
				}
			} else {
				console.log(`⏭️ Process specification ${specConfig.name} already exists, skipping...`);
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

			updateProgress('Complete', 5, 'Foundation service ready');
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
