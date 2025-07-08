<script lang="ts">
	import { agentsStore, economicEventsStore } from '$lib/stores';
	import type { Agent } from '$lib/graphql/types';
	import { onMount } from 'svelte';
	import AgentProfileForm from '$lib/components/AgentProfileForm.svelte';
	import AgentProfileDisplay from '$lib/components/AgentProfileDisplay.svelte';

	let agentName = $state('');
	let agentNote = $state('');
	let agentLocation = $state('');
	let showCreateForm = $state(false);
	let showProfileForm = $state(false);
	let editingAgent = $state<Agent | null>(null);
	let selectedAgentForMyAgent = $state('');
	let expandedAgents = $state<Set<string>>(new Set());

	// Search and filter
	let agentSearch = $state('');
	let filteredAgents = $derived(
		agentSearch.trim()
			? agentsStore.agents.filter(
					(agent) =>
						agent.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
						(agent.note && agent.note.toLowerCase().includes(agentSearch.toLowerCase()))
				)
			: agentsStore.agents
	);

	// Statistics
	let stats = $derived({
		total: agentsStore.agents.length,
		withProfiles: agentsStore.agents.filter((a) => a.note && a.note.length > 0).length,
		recent: [...agentsStore.agents].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 5),
		myAgentSet: !!agentsStore.myAgent
	});

	// Create new agent (legacy form)
	async function createAgent() {
		if (!agentName.trim()) {
			alert('Please enter an agent name');
			return;
		}

		try {
			const newAgent = await agentsStore.createAgent({
				name: agentName.trim(),
				note: agentNote.trim() || undefined
			});

			console.log('Agent created successfully:', newAgent);

			// Reset form
			agentName = '';
			agentNote = '';
			agentLocation = '';
			showCreateForm = false;

			// Refresh agents list
			await agentsStore.fetchAllAgents();
		} catch (error) {
			console.error('Failed to create agent:', error);
			alert('Failed to create agent. Please try again.');
		}
	}

	// Profile form handlers
	function openCreateProfileForm() {
		editingAgent = null;
		showProfileForm = true;
	}

	function openEditProfileForm(agent: Agent) {
		editingAgent = agent;
		showProfileForm = true;
	}

	function closeProfileForm() {
		showProfileForm = false;
		editingAgent = null;
	}

	async function handleProfileSave(
		event: CustomEvent<{ name: string; note: string; image?: string }>
	) {
		const { name, note, image } = event.detail;

		try {
			if (editingAgent) {
				// Update existing agent
				await agentsStore.updateAgent(editingAgent.id, {
					name,
					note,
					image
				});
			} else {
				// Create new agent
				await agentsStore.createAgent({
					name,
					note,
					image
				});
			}

			closeProfileForm();
			await agentsStore.fetchAllAgents();
		} catch (error) {
			console.error('Failed to save agent profile:', error);
			alert('Failed to save agent profile. Please try again.');
		}
	}

	// Toggle agent expansion
	function toggleAgentExpansion(agentId: string) {
		const newExpanded = new Set(expandedAgents);
		if (newExpanded.has(agentId)) {
			newExpanded.delete(agentId);
		} else {
			newExpanded.add(agentId);
		}
		expandedAgents = newExpanded;
	}

	// Set myAgent from dropdown
	function setMyAgent() {
		if (selectedAgentForMyAgent) {
			agentsStore.setMyAgentFromLocalStorage(selectedAgentForMyAgent);
			selectedAgentForMyAgent = '';
		}
	}

	// Clear myAgent
	function clearMyAgent() {
		agentsStore.clearMyAgentFromLocalStorage();
	}

	// Testing functions
	async function createSampleAgent() {
		const sampleAgents = [
			{
				name: 'Lynn Foster',
				note: 'Co-creator of ValueFlows and hREA, systems thinker focused on economic coordination and open value networks.'
			},
			{
				name: 'Bob Haugen',
				note: 'Co-creator of ValueFlows and hREA, software developer specializing in economic network protocols and distributed systems.'
			},
			{
				name: 'Carol Chen',
				note: 'Research scientist focused on open-source hardware and maker spaces.'
			},
			{
				name: 'David Kim',
				note: 'Urban farmer and educator promoting local food systems and community resilience.'
			}
		];

		const randomSample = sampleAgents[Math.floor(Math.random() * sampleAgents.length)];

		try {
			const newAgent = await agentsStore.createAgent(randomSample);
			console.log('Sample agent created:', newAgent);
			await agentsStore.fetchAllAgents();
		} catch (error) {
			console.error('Failed to create sample agent:', error);
		}
	}

	// Format date for display
	function formatDate(dateString?: string) {
		if (!dateString) return 'Unknown';
		return new Date(dateString).toLocaleDateString();
	}

	onMount(() => {
		// Agents are already loaded by the layout, but ensure they're loaded if needed
		if (agentsStore.agents.length === 0) {
			agentsStore.fetchAllAgents();
		}
	});
</script>

<svelte:head>
	<title>Agents - True Commons</title>
	<meta
		name="description"
		content="Manage agent profiles and authentication in the True Commons network"
	/>
</svelte:head>

<div class="space-y-8">
	<!-- Page Header -->
	<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Agents</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-300">
				Manage your identity and connect with other participants in the True Commons network
			</p>
		</div>

		<!-- Quick Stats -->
		<div class="mt-4 grid grid-cols-2 gap-4 lg:mt-0 lg:grid-cols-3">
			<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
				<div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
				<div class="text-sm text-gray-600 dark:text-gray-400">Total Agents</div>
			</div>
			<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
				<div class="text-2xl font-bold text-green-600 dark:text-green-400">
					{stats.withProfiles}
				</div>
				<div class="text-sm text-gray-600 dark:text-gray-400">With Profiles</div>
			</div>
			<div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
				<div
					class="text-2xl font-bold {stats.myAgentSet
						? 'text-green-600 dark:text-green-400'
						: 'text-yellow-600 dark:text-yellow-400'}"
				>
					{stats.myAgentSet ? '✓' : '⚠'}
				</div>
				<div class="text-sm text-gray-600 dark:text-gray-400">My Agent</div>
			</div>
		</div>
	</div>

	<!-- My Agent Status -->
	<div
		class="rounded-lg {agentsStore.myAgent
			? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
			: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'} border p-6"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-3">
				<div
					class="h-3 w-3 rounded-full {agentsStore.myAgent ? 'bg-green-500' : 'bg-yellow-500'}"
				></div>
				<div>
					{#if agentsStore.myAgent}
						<h3 class="text-lg font-medium text-green-800 dark:text-green-200">
							Authenticated as: {agentsStore.myAgent.name}
						</h3>
						<p class="text-green-700 dark:text-green-300">
							{agentsStore.myAgent.note || 'No profile description'}
						</p>
					{:else}
						<h3 class="text-lg font-medium text-yellow-800 dark:text-yellow-200">
							No Agent Selected
						</h3>
						<p class="text-yellow-700 dark:text-yellow-300">
							You need to select an agent identity to create resources and participate in
							activities.
						</p>
					{/if}
				</div>
			</div>
			<div class="flex space-x-2">
				{#if agentsStore.myAgent}
					<button
						onclick={clearMyAgent}
						class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
					>
						Clear Agent
					</button>
				{:else if agentsStore.agents.length > 0}
					<div class="flex space-x-2">
						<select
							bind:value={selectedAgentForMyAgent}
							class="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						>
							<option value="">Select an agent...</option>
							{#each agentsStore.agents as agent}
								<option value={agent.id}>{agent.name}</option>
							{/each}
						</select>
						<button
							onclick={setMyAgent}
							disabled={!selectedAgentForMyAgent}
							class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400"
						>
							Set as My Agent
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Create Agent Section -->
	<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Create New Agent</h2>
			<div class="flex space-x-2">
				<button
					onclick={openCreateProfileForm}
					class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
				>
					Create Profile
				</button>
				<button
					onclick={() => (showCreateForm = !showCreateForm)}
					class="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
				>
					{showCreateForm ? 'Cancel' : 'Quick Create'}
				</button>
			</div>
		</div>

		{#if showCreateForm}
			<form
				onsubmit={(e) => {
					e.preventDefault();
					createAgent();
				}}
				class="space-y-4"
			>
				<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<div>
						<label
							for="agent-name"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Name *
						</label>
						<input
							type="text"
							id="agent-name"
							bind:value={agentName}
							required
							placeholder="Enter agent name"
							class="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
					</div>
					<div>
						<label
							for="agent-location"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Primary Location
						</label>
						<input
							type="text"
							id="agent-location"
							bind:value={agentLocation}
							placeholder="e.g., Portland, Oregon"
							class="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
					</div>
				</div>
				<div>
					<label
						for="agent-note"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Profile Description
					</label>
					<textarea
						id="agent-note"
						bind:value={agentNote}
						rows="3"
						placeholder="Describe your background, interests, and what you bring to the True Commons..."
						class="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					></textarea>
				</div>
				<div class="flex justify-end space-x-3">
					<button
						type="button"
						onclick={() => (showCreateForm = false)}
						class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
					>
						Create Agent
					</button>
				</div>
			</form>
		{/if}
	</div>

	<!-- Search Agents -->
	<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
		<div class="mb-4">
			<label for="agent-search" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
				Search Agents
			</label>
			<input
				type="text"
				id="agent-search"
				bind:value={agentSearch}
				placeholder="Search by name or description..."
				class="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			/>
		</div>

		<!-- Agents List -->
		{#if filteredAgents.length === 0}
			<div class="py-8 text-center">
				<svg
					class="mx-auto h-12 w-12 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
					></path>
				</svg>
				<h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
					{agentSearch.trim() ? 'No agents found' : 'No agents yet'}
				</h3>
				<p class="mt-2 text-gray-600 dark:text-gray-400">
					{agentSearch.trim()
						? 'Try adjusting your search terms.'
						: 'Create your first agent to get started with True Commons.'}
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each filteredAgents as agent}
					<div
						class="rounded-lg border border-gray-200 p-4 dark:border-gray-700 {agentsStore.myAgent
							?.id === agent.id
							? 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
							: 'bg-gray-50 dark:bg-gray-700'}"
					>
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<AgentProfileDisplay {agent} showFullProfile={expandedAgents.has(agent.id)} />
								{#if agentsStore.myAgent?.id === agent.id}
									<span
										class="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
									>
										My Agent
									</span>
								{/if}
							</div>
						</div>
						<div class="mt-4 flex items-center justify-between">
							<div class="flex items-center space-x-2">
								<span class="text-xs text-gray-500 dark:text-gray-400">
									ID: {agent.id.slice(0, 8)}...
								</span>
								<button
									onclick={() => toggleAgentExpansion(agent.id)}
									class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
								>
									{expandedAgents.has(agent.id) ? 'Show Less' : 'Show More'}
								</button>
							</div>
							<div class="flex items-center space-x-2">
								<button
									onclick={() => openEditProfileForm(agent)}
									class="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
								>
									Edit Profile
								</button>
								{#if agentsStore.myAgent?.id !== agent.id}
									<button
										onclick={() => {
											selectedAgentForMyAgent = agent.id;
											setMyAgent();
										}}
										class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
									>
										Set as My Agent
									</button>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Development Testing Controls -->
	{#if import.meta.env.DEV}
		<div
			class="rounded-lg border border-orange-200 bg-orange-50 p-6 dark:border-orange-800 dark:bg-orange-900/20"
		>
			<h3 class="mb-4 text-lg font-medium text-orange-800 dark:text-orange-200">
				🛠️ Development Tools
			</h3>
			<div class="flex flex-wrap gap-3">
				<button
					onclick={createSampleAgent}
					class="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
				>
					Create Sample Agent
				</button>
				<div class="flex items-center text-sm text-orange-700 dark:text-orange-300">
					Agents: {stats.total} | My Agent: {agentsStore.myAgent
						? agentsStore.myAgent.name
						: 'None'} | Loading: {agentsStore.loading ? 'Yes' : 'No'}
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Profile Form Modal -->
{#if showProfileForm}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
		<div
			class="max-h-screen w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-gray-800"
		>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
					{editingAgent ? 'Edit Agent Profile' : 'Create New Agent Profile'}
				</h2>
				<button
					onclick={closeProfileForm}
					aria-label="Close profile form"
					class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				</button>
			</div>
			<AgentProfileForm
				agent={editingAgent}
				on:save={handleProfileSave}
				on:cancel={closeProfileForm}
			/>
		</div>
	</div>
{/if}
