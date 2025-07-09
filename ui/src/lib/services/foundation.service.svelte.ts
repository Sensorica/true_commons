import hreaService from './hrea.service.svelte';
import unitsStore from '../stores/units.store.svelte';
import actionsStore from '../stores/actions.store.svelte';
import resourcesStore from '../stores/resources.store.svelte';
import type { ResourceSpecification, UnitCreateParams, ActionCreateParams } from '../graphql/types';

export interface FoundationService {
    readonly isInitialized: boolean;
    readonly initializationProgress: InitializationProgress;
    readonly initializationError: string | null;
    initialize(): Promise<void>;
    ensureFoundationData(): Promise<boolean>;
    checkFoundationRequirements(): Promise<FoundationStatus>;
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
     * Checks if all foundation requirements are met
     */
    async function checkFoundationRequirements(): Promise<FoundationStatus> {
        console.log('Checking foundation requirements...');

        try {
            // Fetch current state of all foundation components
            await Promise.all([
                unitsStore.fetchAllUnits(),
                actionsStore.fetchAllActions(),
                resourcesStore.fetchAllResourceSpecifications()
            ]);

            // Check for required units - defensive programming
            const requiredUnits = ['one', 'hour', 'kilogram', 'meter'];
            const availableUnits = Array.isArray(unitsStore.units) ? unitsStore.units.map(u => u.id) : [];
            const missingUnits = requiredUnits.filter(id => !availableUnits.includes(id));
            const unitsReady = missingUnits.length === 0;

            // Check for required actions - defensive programming  
            const requiredActions = ['produce', 'consume', 'use', 'work', 'transfer'];
            const availableActions = Array.isArray(actionsStore.actions) ? actionsStore.actions.map(a => a.id) : [];
            const missingActions = requiredActions.filter(id => !availableActions.includes(id));
            const actionsReady = missingActions.length === 0;

            // Check for basic resource specifications - defensive programming
            const requiredResourceSpecs = ['document-spec', 'software-spec'];
            const availableResourceSpecs = Array.isArray(resourcesStore.resourceSpecifications) ? 
                resourcesStore.resourceSpecifications.map(rs => rs.id) : [];
            const missingResourceSpecs = requiredResourceSpecs.filter(id => !availableResourceSpecs.includes(id));
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

            console.log('Foundation status:', status);
            return status;
        } catch (error) {
            console.error('Failed to check foundation requirements:', error);
            
            // Return safe default on error
            return {
                unitsReady: false,
                actionsReady: false,
                resourceSpecificationsReady: false,
                allReady: false,
                missing: {
                    units: ['one', 'hour', 'kilogram', 'meter'],
                    actions: ['produce', 'consume', 'use', 'work', 'transfer'],
                    resourceSpecifications: ['document-spec', 'software-spec']
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
                console.log('All foundation data is ready');
                return true;
            }

            console.log('Foundation data incomplete, initializing missing components...');

            // Step 1: Ensure Units (highest priority)
            if (!status.unitsReady) {
                updateProgress('Initializing Units', 1, 'Creating essential units...');
                await unitsStore.initializeDefaultUnits();
            }

            // Step 2: Ensure Actions 
            if (!status.actionsReady) {
                updateProgress('Initializing Actions', 2, 'Creating essential actions...');
                await actionsStore.initializeDefaultActions();
            }

            // Step 3: Ensure ResourceSpecifications
            if (!status.resourceSpecificationsReady) {
                updateProgress('Initializing Resource Specifications', 3, 'Creating basic resource specifications...');
                await initializeDefaultResourceSpecs();
            }

            // Final verification
            updateProgress('Verifying Foundation', 4, 'Checking all components...');
            const finalStatus = await checkFoundationRequirements();

            if (finalStatus.allReady) {
                console.log('Foundation initialization completed successfully');
                return true;
            } else {
                throw new Error('Foundation initialization incomplete after setup');
            }
        } catch (error) {
            console.error('Failed to ensure foundation data:', error);
            throw error;
        }
    }

    /**
     * Initializes default resource specifications
     */
    async function initializeDefaultResourceSpecs(): Promise<void> {
        const defaultResourceSpecs = [
            {
                id: 'document-spec',
                name: 'Document',
                note: 'General document resource specification',
                defaultUnitOfResource: unitsStore.getUnitById('one'),
                defaultUnitOfEffort: unitsStore.getUnitById('hour')
            },
            {
                id: 'software-spec',
                name: 'Software',
                note: 'Software resource specification',
                defaultUnitOfResource: unitsStore.getUnitById('one'),
                defaultUnitOfEffort: unitsStore.getUnitById('hour')
            },
            {
                id: 'design-spec',
                name: 'Design',
                note: 'Design resource specification',
                defaultUnitOfResource: unitsStore.getUnitById('one'),
                defaultUnitOfEffort: unitsStore.getUnitById('hour')
            },
            {
                id: 'knowledge-spec',
                name: 'Knowledge',
                note: 'Knowledge resource specification',
                defaultUnitOfResource: unitsStore.getUnitById('one'),
                defaultUnitOfEffort: unitsStore.getUnitById('hour')
            }
        ];

        // Check which resource specs already exist
        const existingSpecs = resourcesStore.resourceSpecifications.map(rs => rs.id);

        for (const spec of defaultResourceSpecs) {
            if (!existingSpecs.includes(spec.id)) {
                try {
                    await resourcesStore.createResourceSpecification(spec as Partial<ResourceSpecification>);
                    console.log(`Created default resource specification: ${spec.name}`);
                } catch (err) {
                    console.warn(`Failed to create default resource specification ${spec.name}:`, err);
                    // Continue with other specs even if one fails
                }
            } else {
                console.log(`Resource specification ${spec.name} already exists, skipping...`);
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
            console.log('Foundation service initialized successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
            initializationError = `Foundation service initialization failed: ${errorMessage}`;
            console.error(initializationError, error);
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
        reset
    };
}

const foundationService = createFoundationService();
export default foundationService; 