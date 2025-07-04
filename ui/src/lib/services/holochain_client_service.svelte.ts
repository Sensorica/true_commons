import { AppWebsocket, type AppInfoResponse } from '@holochain/client';

export type ZomeName = 'hrea';

export type RoleName = 'true_commons' | 'hrea';

export interface HolochainClientService {
	readonly appId: string;
	readonly client: AppWebsocket | null;
	readonly isConnected: boolean;
	readonly isConnecting: boolean;
	readonly connectionError: string | null;
	connectClient(): Promise<void>;
	disconnect(): Promise<void>;
	getAppInfo(): Promise<AppInfoResponse>;
	callZome(
		zomeName: ZomeName,
		fnName: string,
		payload: unknown,
		capSecret?: Uint8Array | undefined,
		roleName?: RoleName
	): Promise<unknown>;
}

/**
 * Creates a Holochain client service that manages the connection to the Holochain conductor
 * and provides methods to interact with it.
 *
 * @returns An object with methods to interact with the Holochain conductor
 */
function createHolochainClientService(): HolochainClientService {
	// State
	const appId: string = 'true_commons';
	let client: AppWebsocket | null = $state(null);
	let isConnected: boolean = $state(false);
	let isConnecting: boolean = $state(false);
	let connectionError: string | null = $state(null);

	/**
	 * Connects the client to the Holochain conductor.
	 * Handles connection errors and updates state accordingly.
	 */
	async function connectClient(): Promise<void> {
		if (isConnecting || isConnected) {
			return;
		}

		isConnecting = true;
		connectionError = null;

		try {
			client = await AppWebsocket.connect();
			isConnected = true;
			console.log('Successfully connected to Holochain conductor');
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
			connectionError = `Failed to connect to Holochain conductor: ${errorMessage}`;
			console.error(connectionError, error);
			client = null;
			isConnected = false;
			throw error;
		} finally {
			isConnecting = false;
		}
	}

	/**
	 * Disconnects the client from the Holochain conductor.
	 */
	async function disconnect(): Promise<void> {
		if (client) {
			try {
				await client.client.close();
				console.log('Disconnected from Holochain conductor');
			} catch (error) {
				console.error('Error during disconnect:', error);
			}
		}

		client = null;
		isConnected = false;
		isConnecting = false;
		connectionError = null;
	}

	/**
	 * Retrieves application information from the Holochain client.
	 * @returns {Promise<AppInfoResponse>} - The application information.
	 */
	async function getAppInfo(): Promise<AppInfoResponse> {
		if (!client || !isConnected) {
			throw new Error('Client not connected. Call connectClient() first.');
		}

		try {
			return await client.appInfo();
		} catch (error) {
			console.error('Error getting app info:', error);
			throw error;
		}
	}

	/**
	 * Calls a zome function on the Holochain client.
	 * @param {ZomeName} zomeName - The name of the zome.
	 * @param {string} fnName - The name of the function within the zome.
	 * @param {unknown} payload - The payload to send with the function call.
	 * @param {Uint8Array | undefined} capSecret - The capability secret for authorization.
	 * @param {RoleName} roleName - The name of the role to call the function on. Defaults to 'hrea'.
	 * @returns {Promise<unknown>} - The result of the zome function call.
	 */
	async function callZome(
		zomeName: ZomeName,
		fnName: string,
		payload: unknown,
		capSecret: Uint8Array | undefined = undefined,
		roleName: RoleName = 'hrea'
	): Promise<unknown> {
		if (!client || !isConnected) {
			throw new Error('Client not connected. Call connectClient() first.');
		}

		try {
			const record = await client.callZome({
				cap_secret: capSecret,
				zome_name: zomeName,
				fn_name: fnName,
				payload,
				role_name: roleName
			});

			return record;
		} catch (error) {
			console.error(`Error calling zome function ${zomeName}.${fnName}:`, error);

			// If we get a connection error, mark as disconnected
			if (error instanceof Error && error.message.includes('connection')) {
				isConnected = false;
				client = null;
			}

			throw error;
		}
	}

	return {
		// Getters
		get appId() {
			return appId;
		},
		get client() {
			return client;
		},
		get isConnected() {
			return isConnected;
		},
		get isConnecting() {
			return isConnecting;
		},
		get connectionError() {
			return connectionError;
		},

		// Methods
		connectClient,
		disconnect,
		getAppInfo,
		callZome
	};
}

const holochainClientService = createHolochainClientService();
export default holochainClientService;
