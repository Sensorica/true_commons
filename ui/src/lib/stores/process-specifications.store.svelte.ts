import hreaService from '$lib/services/hrea.service.svelte';
import {
	CREATE_PROCESS_SPECIFICATION,
	UPDATE_PROCESS_SPECIFICATION,
	DELETE_PROCESS_SPECIFICATION
} from '$lib/graphql/mutations';
import { GET_PROCESS_SPECIFICATIONS } from '$lib/graphql/queries';
import type {
	ProcessSpecification,
	ProcessSpecificationCreateParams,
	ProcessSpecificationUpdateParams,
	GetProcessSpecificationsResponse,
	CreateProcessSpecificationResponse,
	UpdateProcessSpecificationResponse,
	DeleteProcessSpecificationResponse
} from '$lib/graphql/types';
import { DEFAULT_PROCESS_SPECIFICATIONS } from '$lib/data';

export interface ProcessSpecificationsStore {
	readonly processSpecifications: ProcessSpecification[];
	readonly isLoading: boolean;
	readonly error: string | null;
	readonly isInitialized: boolean;
	fetchAllProcessSpecifications(forceRefetch?: boolean): Promise<ProcessSpecification[]>;
	createProcessSpecification(
		processSpecification: ProcessSpecificationCreateParams
	): Promise<ProcessSpecification>;
	updateProcessSpecification(
		processSpecification: ProcessSpecificationUpdateParams & { revisionId: string }
	): Promise<ProcessSpecification>;
	deleteProcessSpecification(revisionId: string): Promise<boolean>;
	getProcessSpecification(id: string): ProcessSpecification | null;
	initializeDefaultProcessSpecifications(): Promise<void>;
}

function createProcessSpecificationsStore(): ProcessSpecificationsStore {
	let processSpecifications: ProcessSpecification[] = $state([]);
	let isLoading: boolean = $state(false);
	let error: string | null = $state(null);
	let isInitialized: boolean = $state(false);
	let hasFetched: boolean = false;

	async function fetchAllProcessSpecifications(
		forceRefetch = false
	): Promise<ProcessSpecification[]> {
		if (isLoading) return processSpecifications;
		if (hasFetched && !forceRefetch) return processSpecifications;

		isLoading = true;
		error = null;

		if (!hreaService.isInitialized || !hreaService.apolloClient) {
			await hreaService.initialize();
		}

		try {
			const result = await hreaService.apolloClient!.query<GetProcessSpecificationsResponse>({
				query: GET_PROCESS_SPECIFICATIONS,
				fetchPolicy: forceRefetch ? 'network-only' : 'cache-first'
			});
			const specs = result.data.processSpecifications?.edges.map((edge) => edge.node) || [];
			processSpecifications = [...specs];
			hasFetched = true;
			console.log(`Fetched ${specs.length} process specifications`);
			return processSpecifications;
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			error = `Failed to fetch process specifications: ${message}`;
			console.error(error, e);
			throw new Error(error);
		} finally {
			isLoading = false;
		}
	}

	async function createProcessSpecification(
		processSpecData: ProcessSpecificationCreateParams
	): Promise<ProcessSpecification> {
		if (isLoading) throw new Error('Another operation is in progress.');
		isLoading = true;
		error = null;

		if (!hreaService.isInitialized || !hreaService.apolloClient) {
			await hreaService.initialize();
		}

		try {
			const result = await hreaService.apolloClient!.mutate<CreateProcessSpecificationResponse>({
				mutation: CREATE_PROCESS_SPECIFICATION,
				variables: {
					processSpecification: processSpecData
				}
			});

			const newSpec = result.data?.createProcessSpecification.processSpecification;
			if (!newSpec) {
				throw new Error('Failed to create process specification');
			}
			await fetchAllProcessSpecifications(true);
			return newSpec;
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			error = `Failed to create process specification: ${message}`;
			console.error(error, e);
			throw new Error(error);
		} finally {
			isLoading = false;
		}
	}

	async function updateProcessSpecification(
		processSpecData: ProcessSpecificationUpdateParams & { revisionId: string }
	): Promise<ProcessSpecification> {
		if (isLoading) throw new Error('Another operation is in progress.');
		isLoading = true;
		error = null;

		if (!hreaService.isInitialized || !hreaService.apolloClient) {
			await hreaService.initialize();
		}

		try {
			const result = await hreaService.apolloClient!.mutate<UpdateProcessSpecificationResponse>({
				mutation: UPDATE_PROCESS_SPECIFICATION,
				variables: {
					processSpecification: processSpecData
				}
			});

			const updatedSpec = result.data?.updateProcessSpecification.processSpecification;
			if (!updatedSpec) {
				throw new Error('Failed to update process specification');
			}
			await fetchAllProcessSpecifications(true);
			return updatedSpec;
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			error = `Failed to update process specification: ${message}`;
			console.error(error, e);
			throw new Error(error);
		} finally {
			isLoading = false;
		}
	}

	async function deleteProcessSpecification(revisionId: string): Promise<boolean> {
		if (isLoading) throw new Error('Another operation is in progress.');
		isLoading = true;
		error = null;

		if (!hreaService.isInitialized || !hreaService.apolloClient) {
			await hreaService.initialize();
		}

		try {
			const result = await hreaService.apolloClient!.mutate<DeleteProcessSpecificationResponse>({
				mutation: DELETE_PROCESS_SPECIFICATION,
				variables: { revisionId }
			});

			const success = !!result.data?.deleteProcessSpecification;
			if (success) {
				await fetchAllProcessSpecifications(true);
			}
			return success;
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			error = `Failed to delete process specification: ${message}`;
			console.error(error, e);
			throw new Error(error);
		} finally {
			isLoading = false;
		}
	}

	async function initializeDefaultProcessSpecifications(): Promise<void> {
		if (isLoading) {
			console.warn('Initialization already in progress, skipping.');
			return;
		}
		console.log('🔄 Initializing default process specifications...');
		await fetchAllProcessSpecifications(true);
		const existingSpecNames = processSpecifications.map((ps) => ps.name);

		for (const specConfig of DEFAULT_PROCESS_SPECIFICATIONS) {
			if (!existingSpecNames.includes(specConfig.name)) {
				try {
					console.log(`⚙️ Creating process specification: ${specConfig.name}`);
					await createProcessSpecification({
						name: specConfig.name,
						note: specConfig.note
					});
				} catch (e: unknown) {
					const message = e instanceof Error ? e.message : 'Unknown error';
					console.warn(
						`⚠️ Failed to create default process specification ${specConfig.name}:`,
						message
					);
				}
			} else {
				console.log(`⏭️ Process specification ${specConfig.name} already exists, skipping...`);
			}
		}
		console.log('✅ Default process specifications initialization complete.');
	}

	function getProcessSpecification(id: string): ProcessSpecification | null {
		return processSpecifications.find((spec) => spec.id === id) || null;
	}

	async function initialize() {
		if (isInitialized) return;
		await fetchAllProcessSpecifications();
		isInitialized = true;
	}

	if (typeof window !== 'undefined') {
		// Avoid initializing during SSR to prevent Holochain connection errors
		initialize();
	}

	return {
		get processSpecifications() {
			return processSpecifications;
		},
		get isLoading() {
			return isLoading;
		},
		get error() {
			return error;
		},
		get isInitialized() {
			return isInitialized;
		},
		fetchAllProcessSpecifications,
		createProcessSpecification,
		updateProcessSpecification,
		deleteProcessSpecification,
		getProcessSpecification,
		initializeDefaultProcessSpecifications
	};
}

const processSpecificationsStore = createProcessSpecificationsStore();
export default processSpecificationsStore;
