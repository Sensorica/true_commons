<script lang="ts">
	import foundationService from '$lib/services/foundation.service.svelte';
	import unitsStore from '$lib/stores/units.store.svelte';
	import actionsStore from '$lib/stores/actions.store.svelte';
	import agentsStore from '$lib/stores/agents.store.svelte';
	import resourcesStore from '$lib/stores/resources.store.svelte';
	import economicEventsStore from '$lib/stores/economic-events.store.svelte';
	import processesStore from '$lib/stores/processes.store.svelte';
	import processSpecificationsStore from '$lib/stores/process-specifications.store.svelte';
	import commitmentsStore from '$lib/stores/commitments.store.svelte';
	import intentsStore from '$lib/stores/intents.store.svelte';
	import { getSchema } from '$lib/utils/get-schema';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	// State for foundation status
	let foundationStatus = $state<any>(null);
	let initializingFoundation = $state(false);
	let introspectingSchema = $state(false);

	// Quick stats for dashboard
	let stats = $derived({
		agents: {
			total: agentsStore.agents.length,
			authenticated: !!agentsStore.myAgent
		},
		resources: {
			total: resourcesStore.resources.length,
			recent: resourcesStore.resources
				.filter((r) => r.created_at)
				.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
				.slice(0, 3)
		},
		byType: ['Document', 'Software', 'Knowledge', 'Hardware'].map((type) => ({
			type,
			count: resourcesStore.resources.filter((r) => r.resourceType === type).length
		})),
		activity: {
			events: economicEventsStore.events.length,
			recentEvents: economicEventsStore.events.slice(0, 5)
		},
		commitments: {
			total: commitmentsStore.commitments.length,
			active: commitmentsStore.commitments.filter(
				(c) => !c.fulfilledBy || c.fulfilledBy.length === 0
			).length,
			fulfilled: commitmentsStore.commitments.filter(
				(c) => c.fulfilledBy && c.fulfilledBy.length > 0
			).length,
			overdue: commitmentsStore.commitments.filter(
				(c) =>
					c.due && new Date(c.due) < new Date() && (!c.fulfilledBy || c.fulfilledBy.length === 0)
			).length
		},
		intents: {
			total: intentsStore.intents.length,
			open: intentsStore.intents.filter((i) => !i.satisfiedBy || i.satisfiedBy.length === 0).length,
			satisfied: intentsStore.intents.filter((i) => i.satisfiedBy && i.satisfiedBy.length > 0)
				.length,
			expired: intentsStore.intents.filter(
				(i) =>
					i.due && new Date(i.due) < new Date() && (!i.satisfiedBy || i.satisfiedBy.length === 0)
			).length
		},
		foundation: {
			isReady: foundationStatus?.allReady || false,
			unitsReady: foundationStatus?.unitsReady || false,
			actionsReady: foundationStatus?.actionsReady || false,
			resourceSpecsReady: foundationStatus?.resourceSpecificationsReady || false,
			processSpecsReady: foundationStatus?.processSpecificationsReady || false
		}
	});

	// Resource type options
	const resourceTypes = [
		{ value: 'Document', label: 'Documents', icon: '📄' },
		{ value: 'Software', label: 'Software', icon: '💻' },
		{ value: 'Knowledge', label: 'Knowledge', icon: '🧠' },
		{ value: 'Hardware', label: 'Hardware', icon: '🔧' }
	];

	// Quick actions
	function goToAgents() {
		goto('/agents');
	}

	function goToMyProfile() {
		if (agentsStore.myAgent) {
			goto(`/agents/${agentsStore.myAgent.id}`);
		}
	}

	function goToResources() {
		goto('/resources');
	}

	function goToProcesses() {
		goto('/processes');
	}

	function goToEvents() {
		goto('/events');
	}

	function goToCommitments() {
		goto('/commitments');
	}

	function goToIntents() {
		goto('/intents');
	}

	async function introspectGraphQLSchema() {
		if (introspectingSchema) return;

		introspectingSchema = true;
		console.log('🔍 Starting GraphQL schema introspection...');

		try {
			const result = await getSchema();
			console.log('✅ Schema introspection completed successfully');

			// Focus on Create Unit Mutation results
			if (result.createUnitInfo.isSupported) {
				const paramsCount = result.createUnitInfo.unitCreateParamsFields.length;
				const responseCount = result.createUnitInfo.unitFieldsInResponse.length;
				alert(
					`✅ Create Unit Mutation Analysis Complete!\n\n` +
						`🎯 createUnit mutation: SUPPORTED\n` +
						`🔧 UnitCreateParams fields: ${paramsCount} found\n` +
						`📤 Response Unit fields: ${responseCount} found\n\n` +
						`📊 Schema Overview:\n` +
						`• Total mutations: ${result.mutations.length}\n` +
						`• Unit-related mutations: ${result.unitMutations.length}\n\n` +
						`Check the browser console for detailed schema analysis including field types, examples, and TypeScript interfaces.`
				);
			} else {
				alert(
					`❌ Create Unit Mutation Analysis Complete\n\n` +
						`🎯 createUnit mutation: NOT SUPPORTED\n\n` +
						`📊 Schema Overview:\n` +
						`• Total mutations: ${result.mutations.length}\n` +
						`• Unit-related mutations: ${result.unitMutations.length}\n\n` +
						`The current GraphQL schema does not support the createUnit mutation. Check the browser console for full schema details.`
				);
			}
		} catch (error) {
			console.error('❌ Schema introspection failed:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			alert(
				`❌ Create Unit Mutation Analysis Failed\n\n` +
					`Error: ${errorMessage}\n\n` +
					`This could indicate:\n` +
					`• GraphQL service is not running\n` +
					`• hREA service initialization failed\n` +
					`• Network connectivity issues\n\n` +
					`Check the browser console for detailed error information.`
			);
		} finally {
			introspectingSchema = false;
		}
	}

	async function initializeFoundationComponents() {
		if (initializingFoundation) return;

		initializingFoundation = true;
		console.log('🔄 Starting foundation initialization...');

		try {
			// Step 1: Check Holochain connection
			console.log('🔌 Checking Holochain client connection...');
			try {
				const holochainClientService = await import(
					'$lib/services/holochain_client_service.svelte'
				);
				console.log('Holochain client status:', {
					isConnected: holochainClientService.default.isConnected,
					isConnecting: holochainClientService.default.isConnecting,
					connectionError: holochainClientService.default.connectionError
				});
			} catch (err) {
				console.warn('Could not check Holochain client:', err);
			}

			// Step 2: Check hREA service
			console.log('🔗 Checking hREA service...');
			try {
				const hreaService = await import('$lib/services/hrea.service.svelte');
				console.log('hREA service status:', {
					isInitialized: hreaService.default.isInitialized,
					initializationError: hreaService.default.initializationError
				});
			} catch (err) {
				console.warn('Could not check hREA service:', err);
			}

			// Step 3: Initialize foundation service with detailed logging
			console.log('⚙️ Initializing foundation service...');
			await foundationService.initialize();
			console.log('✅ Foundation service initialized successfully');

			// Step 4: Check status after initialization
			console.log('🔍 Checking foundation status...');
			foundationStatus = await foundationService.checkFoundationRequirements();
			console.log('Foundation status after initialization:', foundationStatus);

			// Step 5: Reload all stores to get the newly created foundation data
			console.log('🔄 Reloading stores...');
			const storeReloads = [
				{ name: 'units', fn: () => unitsStore.fetchAllUnits() },
				{ name: 'actions', fn: () => actionsStore.fetchAllActions() },
				{
					name: 'resourceSpecifications',
					fn: () => resourcesStore.fetchAllResourceSpecifications()
				},
				{ name: 'agents', fn: () => agentsStore.fetchAllAgents() },
				{ name: 'resources', fn: () => resourcesStore.fetchAllResources() },
				{ name: 'events', fn: () => economicEventsStore.fetchAllEvents() },
				{ name: 'processes', fn: () => processesStore.fetchAllProcesses() },
				{
					name: 'processSpecifications',
					fn: () => processSpecificationsStore.fetchAllProcessSpecifications()
				},
				{ name: 'commitments', fn: () => commitmentsStore.fetchAllCommitments() },
				{ name: 'intents', fn: () => intentsStore.fetchAllIntents() }
			];

			for (const store of storeReloads) {
				try {
					console.log(`🔄 Reloading ${store.name}...`);
					await store.fn();
					console.log(`✅ ${store.name} reloaded successfully`);
				} catch (err) {
					console.warn(`⚠️ Failed to reload ${store.name}:`, err);
				}
			}

			// Step 6: Final status check
			console.log('🔍 Final foundation status check...');
			foundationStatus = await foundationService.checkFoundationRequirements();
			console.log('✅ Foundation components initialized successfully');
			console.log('Final foundation status:', foundationStatus);

			// Log detailed counts
			console.log('📊 Store counts after initialization:', {
				units: unitsStore.units.length,
				actions: actionsStore.actions.length,
				resourceSpecifications: resourcesStore.resourceSpecifications.length,
				agents: agentsStore.agents.length,
				resources: resourcesStore.resources.length,
				events: economicEventsStore.events.length,
				processes: processesStore.processes.length,
				processSpecifications: processSpecificationsStore.processSpecifications.length
			});
		} catch (err) {
			console.error('❌ Foundation initialization failed:', err);

			// Show more detailed error to user
			const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
			const errorDetails =
				foundationService.initializationError || 'No additional details available';

			alert(
				`Foundation initialization failed!\n\nError: ${errorMessage}\n\nDetails: ${errorDetails}\n\nPlease check the browser console for more information.`
			);
		} finally {
			initializingFoundation = false;
		}
	}

	// Load data on mount
	onMount(async () => {
		// First check foundation status
		try {
			foundationStatus = await foundationService.checkFoundationRequirements();
			console.log('Foundation status checked:', foundationStatus);
		} catch (err) {
			console.error('Failed to check foundation status:', err);
		}

		// Load initial data
		agentsStore.fetchAllAgents();
		resourcesStore.fetchAllResources();
		economicEventsStore.fetchAllEvents();
		commitmentsStore.fetchAllCommitments();
		intentsStore.fetchAllIntents();
	});
</script>

<svelte:head>
	<title>True Commons - Dashboard</title>
	<meta
		name="description"
		content="True Commons - Organization-agnostic, capture-resistant digital assets platform"
	/>
</svelte:head>

<div class="space-y-8">
	<!-- Welcome Banner -->
	<div class="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
		<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
			<div>
				<h1 class="text-4xl font-bold">Welcome to True Commons</h1>
				<p class="mt-2 text-xl">Organization-agnostic, capture-resistant digital assets platform</p>
				<p class="mt-4 text-blue-100">
					Create, discover, and collaborate on digital resources in a decentralized network powered
					by Holochain and ValueFlows.
				</p>
			</div>
			<div class="mt-6 lg:mt-0">
				{#if agentsStore.myAgent}
					<div class="rounded-lg bg-white/20 p-4">
						<p class="text-sm text-blue-100">Authenticated as</p>
						<p class="text-lg font-semibold">{agentsStore.myAgent.name}</p>
					</div>
				{:else}
					<div class="rounded-lg bg-yellow-500/20 p-4">
						<p class="text-sm text-yellow-100">⚠️ No agent selected</p>
						<button
							onclick={goToAgents}
							class="mt-2 rounded bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
						>
							Set up identity
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Dashboard Stats Grid -->
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		<!-- Agents Overview -->
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						></path>
					</svg>
				</div>
				<div class="ml-5 w-0 flex-1">
					<dl>
						<dt class="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
							Network Agents
						</dt>
						<dd class="text-lg font-medium text-gray-900 dark:text-white">{stats.agents.total}</dd>
					</dl>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex items-center text-sm">
					<span
						class="flex items-center text-{stats.agents.authenticated ? 'green' : 'yellow'}-600"
					>
						<span
							class="h-2 w-2 rounded-full bg-{stats.agents.authenticated
								? 'green'
								: 'yellow'}-500 mr-2"
						></span>
						{stats.agents.authenticated ? 'Authenticated' : 'Not authenticated'}
					</span>
				</div>
				<div class="mt-3 flex flex-col space-y-2">
					<button
						onclick={goToAgents}
						class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
					>
						Manage agents →
					</button>
					{#if agentsStore.myAgent}
						<button
							onclick={goToMyProfile}
							class="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
						>
							View my profile →
						</button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Resources Overview -->
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
						></path>
					</svg>
				</div>
				<div class="ml-5 w-0 flex-1">
					<dl>
						<dt class="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
							Digital Resources
						</dt>
						<dd class="text-lg font-medium text-gray-900 dark:text-white">
							{stats.resources.total}
						</dd>
					</dl>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex items-center text-sm">
					<span class="text-gray-600 dark:text-gray-400">
						{stats.resources.recent.length} recent resources
					</span>
				</div>
				<button
					onclick={goToResources}
					class="mt-3 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
				>
					View all resources →
				</button>
			</div>
		</div>

		<!-- Economic Events Overview -->
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<svg
						class="h-8 w-8 text-purple-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 10V3L4 14h7v7l9-11h-7z"
						></path>
					</svg>
				</div>
				<div class="ml-5 w-0 flex-1">
					<dl>
						<dt class="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
							Economic Events
						</dt>
						<dd class="text-lg font-medium text-gray-900 dark:text-white">
							{stats.activity.events}
						</dd>
					</dl>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex items-center text-sm">
					<span class="text-gray-600 dark:text-gray-400">
						{stats.activity.recentEvents.length} recent events
					</span>
				</div>
				<button
					onclick={goToEvents}
					class="mt-3 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
				>
					View all events →
				</button>
			</div>
		</div>

		<!-- Intents Overview -->
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 10V3L4 14h7v7l9-11h-7z"
						></path>
					</svg>
				</div>
				<div class="ml-5 w-0 flex-1">
					<dl>
						<dt class="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Intents</dt>
						<dd class="text-lg font-medium text-gray-900 dark:text-white">
							{stats.intents.total}
						</dd>
					</dl>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex items-center text-sm">
					<span class="text-gray-600 dark:text-gray-400">
						{stats.intents.open} open intents
					</span>
				</div>
				<button
					onclick={goToIntents}
					class="mt-3 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
				>
					View all intents →
				</button>
			</div>
		</div>

		<!-- Commitments Overview -->
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
				</div>
				<div class="ml-5 w-0 flex-1">
					<dl>
						<dt class="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
							Commitments
						</dt>
						<dd class="text-lg font-medium text-gray-900 dark:text-white">
							{stats.commitments.total}
						</dd>
					</dl>
				</div>
			</div>
			<div class="mt-4">
				<div class="flex items-center text-sm">
					<span class="text-gray-600 dark:text-gray-400">
						{stats.commitments.active} active commitments
					</span>
				</div>
				<button
					onclick={goToCommitments}
					class="mt-3 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
				>
					View all commitments →
				</button>
			</div>
		</div>
	</div>

	<!-- Foundation Status Section -->
	<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-lg font-medium text-gray-900 dark:text-white">Foundation Status</h2>
				<p class="text-sm text-gray-600 dark:text-gray-400">
					Core ValueFlows components required for economic activity
				</p>
			</div>
			<div class="flex items-center">
				{#if stats.foundation.isReady}
					<span
						class="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-300"
					>
						<svg class="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
							<circle cx="4" cy="4" r="3" />
						</svg>
						Ready
					</span>
				{:else}
					<span
						class="inline-flex items-center rounded-full bg-yellow-100 px-3 py-0.5 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
					>
						<svg class="mr-1.5 h-2 w-2 text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
							<circle cx="4" cy="4" r="3" />
						</svg>
						Not Ready
					</span>
				{/if}
			</div>
		</div>

		<div class="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
			<ul class="space-y-2">
				<li class="flex items-center justify-between">
					<span class="text-gray-700 dark:text-gray-300">📏 Units</span>
					{#if stats.foundation.unitsReady}
						<span class="font-semibold text-green-600 dark:text-green-400">✅ Ready</span>
					{:else}
						<span class="font-semibold text-yellow-600 dark:text-yellow-400">⚠️ Missing</span>
					{/if}
				</li>
				<li class="flex items-center justify-between">
					<span class="text-gray-700 dark:text-gray-300">⚡ Actions</span>
					{#if stats.foundation.actionsReady}
						<span class="font-semibold text-green-600 dark:text-green-400">✅ Ready</span>
					{:else}
						<span class="font-semibold text-yellow-600 dark:text-yellow-400">⚠️ Missing</span>
					{/if}
				</li>
				<li class="flex items-center justify-between">
					<span class="text-gray-700 dark:text-gray-300">📦 Resource Specifications</span>
					{#if stats.foundation.resourceSpecsReady}
						<span class="font-semibold text-green-600 dark:text-green-400">✅ Ready</span>
					{:else}
						<span class="font-semibold text-yellow-600 dark:text-yellow-400">⚠️ Missing</span>
					{/if}
				</li>
				<li class="flex items-center justify-between">
					<span class="text-gray-700 dark:text-gray-300">📜 Process Specifications</span>
					{#if stats.foundation.processSpecsReady}
						<span class="font-semibold text-green-600 dark:text-green-400">✅ Ready</span>
					{:else}
						<span class="font-semibold text-yellow-600 dark:text-yellow-400">⚠️ Missing</span>
					{/if}
				</li>
			</ul>
		</div>
	</div>

	<!-- Recent Activity -->
	{#if stats.activity.recentEvents.length > 0}
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<h2 class="text-lg font-medium text-gray-900 dark:text-white">Recent Economic Events</h2>
			<div class="mt-4 space-y-3">
				{#each stats.activity.recentEvents as event}
					<div class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
						<div class="flex items-center">
							<div class="flex-shrink-0">
								<svg
									class="h-5 w-5 text-purple-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 10V3L4 14h7v7l9-11h-7z"
									></path>
								</svg>
							</div>
							<div class="ml-3">
								<p class="text-sm font-medium text-gray-900 dark:text-white">
									{event.action.label}
									{#if event.resourceInventoriedAs}
										- {event.resourceInventoriedAs.name}
									{/if}
								</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">
									{#if event.provider}
										by {event.provider.name}
									{/if}
									{#if event.hasPointInTime}
										• {new Date(event.hasPointInTime).toLocaleDateString()}
									{/if}
								</p>
							</div>
						</div>
						<div class="flex-shrink-0">
							<span
								class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-300"
							>
								{event.action.resourceEffect}
							</span>
						</div>
					</div>
				{/each}
			</div>
			<div class="mt-4 text-center">
				<button
					onclick={goToEvents}
					class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
				>
					View all events →
				</button>
			</div>
		</div>
	{/if}

	<!-- Recent Resources -->
	{#if stats.resources.recent.length > 0}
		<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Recent Resources</h2>
				<button
					onclick={goToResources}
					class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
				>
					View all →
				</button>
			</div>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each stats.resources.recent as resource}
					<div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<h3 class="font-medium text-gray-900 dark:text-white">
									{resource.name || 'Untitled Resource'}
								</h3>
								{#if resource.note}
									<p class="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
										{resource.note}
									</p>
								{/if}
								<div class="mt-2 flex items-center space-x-2">
									{#if resource.resourceType}
										<span
											class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
										>
											{resource.resourceType}
										</span>
									{/if}
									{#if resource.license}
										<span
											class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
										>
											{resource.license}
										</span>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Quick Actions -->
	<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
		<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<button
				onclick={goToResources}
				class="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:hover:border-gray-500"
			>
				<div>
					<svg
						class="mx-auto h-8 w-8 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						></path>
					</svg>
					<span class="mt-2 block text-sm font-medium text-gray-900 dark:text-white"
						>Create Resource</span
					>
					<span class="block text-sm text-gray-500 dark:text-gray-400">Add new digital asset</span>
				</div>
			</button>

			<button
				onclick={goToAgents}
				class="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:hover:border-gray-500"
			>
				<div>
					<svg
						class="mx-auto h-8 w-8 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						></path>
					</svg>
					<span class="mt-2 block text-sm font-medium text-gray-900 dark:text-white"
						>Manage Identity</span
					>
					<span class="block text-sm text-gray-500 dark:text-gray-400">Set up agent profile</span>
				</div>
			</button>

			<button
				onclick={goToResources}
				class="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:hover:border-gray-500"
			>
				<div>
					<svg
						class="mx-auto h-8 w-8 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						></path>
					</svg>
					<span class="mt-2 block text-sm font-medium text-gray-900 dark:text-white">Discover</span>
					<span class="block text-sm text-gray-500 dark:text-gray-400"
						>Browse network resources</span
					>
				</div>
			</button>

			<a
				href="https://github.com/sensorica/true_commons"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:hover:border-gray-500"
			>
				<div>
					<svg class="mx-auto h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						/>
					</svg>
					<span class="mt-2 block text-sm font-medium text-gray-900 dark:text-white">GitHub</span>
					<span class="block text-sm text-gray-500 dark:text-gray-400">View source code</span>
				</div>
			</a>
		</div>
	</div>

	<!-- About True Commons -->
	<div class="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
		<h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">About True Commons</h2>
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div>
				<h3 class="mb-2 font-medium text-gray-900 dark:text-white">🌐 Decentralized</h3>
				<p class="text-sm text-gray-600 dark:text-gray-300">
					Built on Holochain for true peer-to-peer data integrity without central authorities.
				</p>
			</div>
			<div>
				<h3 class="mb-2 font-medium text-gray-900 dark:text-white">💎 Capture-Resistant</h3>
				<p class="text-sm text-gray-600 dark:text-gray-300">
					Designed to prevent value extraction and maintain commons-based resource sharing.
				</p>
			</div>
			<div>
				<h3 class="mb-2 font-medium text-gray-900 dark:text-white">🔄 ValueFlows</h3>
				<p class="text-sm text-gray-600 dark:text-gray-300">
					Economic activity tracking using the ValueFlows vocabulary for transparency and
					attribution.
				</p>
			</div>
		</div>
	</div>
</div>
