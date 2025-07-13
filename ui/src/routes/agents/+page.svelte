<script lang="ts">
	import agentsStore from '$lib/stores/agents.store.svelte';
	import economicEventsStore from '$lib/stores/economic-events.store.svelte';
	import type { Agent, AgentMetadata } from '$lib/graphql/types';
	import { stringifyAgentMetadata } from '$lib/graphql/types';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import AgentProfileForm from '$lib/components/AgentProfileForm.svelte';
	import AgentProfileDisplay from '$lib/components/AgentProfileDisplay.svelte';

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
		const now = new Date().toISOString();

		const sampleAgents = [
			{
				name: 'Lynn Foster',
				image: 'https://avatars.githubusercontent.com/u/1234567?v=4',
				metadata: {
					description:
						'Co-creator of ValueFlows and hREA, systems thinker focused on economic coordination and open value networks.',
					bio: 'Lynn Foster is a pioneering systems thinker who has dedicated her career to developing frameworks for economic coordination in networked organizations. She co-created ValueFlows, a vocabulary for the distributed economic web, and has been instrumental in advancing open value networks and commons-based peer production.',
					title: 'Systems Architect & Economic Coordination Researcher',
					organization: 'ValueFlows Collective',
					email: 'lynn.foster@valueflows.org',
					website: 'https://valueflows.org',
					socialMedia: {
						twitter: '@lynnfoster',
						linkedin: 'linkedin.com/in/lynnfoster',
						github: 'github.com/lynnfoster',
						orcid: '0000-0002-1234-5678'
					},
					skills: [
						'Systems Thinking',
						'Economic Modeling',
						'Network Theory',
						'Open Source Development',
						'Community Building'
					],
					expertise: [
						'ValueFlows',
						'hREA',
						'Economic Networks',
						'Distributed Systems',
						'Commons Governance'
					],
					interests: [
						'Regenerative Economics',
						'Peer Production',
						'Network Governance',
						'Open Value Networks'
					],
					location: {
						city: 'Portland',
						country: 'United States'
					},
					preferences: {
						visibility: 'public',
						contactPreference: 'email',
						notifications: true
					},
					metadata: {
						createdAt: now,
						updatedAt: now,
						version: '1.0'
					}
				} as AgentMetadata
			},
			{
				name: 'Bob Haugen',
				image: 'https://avatars.githubusercontent.com/u/2345678?v=4',
				metadata: {
					description:
						'Co-creator of ValueFlows and hREA, software developer specializing in economic network protocols and distributed systems.',
					bio: 'Bob Haugen is a veteran software developer and systems architect with over 30 years of experience in building distributed systems. He co-created ValueFlows and hREA, focusing on the technical implementation of economic coordination protocols for networked organizations.',
					title: 'Senior Software Architect',
					organization: 'Mutual Aid Network',
					email: 'bob.haugen@mutualaid.org',
					website: 'https://github.com/bhaugen',
					socialMedia: {
						twitter: '@bhaugen',
						linkedin: 'linkedin.com/in/bobhaugen',
						github: 'github.com/bhaugen',
						orcid: '0000-0003-2345-6789'
					},
					skills: [
						'Python',
						'Django',
						'GraphQL',
						'Distributed Systems',
						'Economic Modeling',
						'Database Design'
					],
					expertise: [
						'hREA Implementation',
						'ValueFlows',
						'Economic Software',
						'Network Resource Planning',
						'Holochain'
					],
					interests: [
						'Economic Democracy',
						'Cooperative Technology',
						'Distributed Ledgers',
						'Resource Flow Modeling'
					],
					location: {
						city: 'Minneapolis',
						country: 'United States'
					},
					preferences: {
						visibility: 'public',
						contactPreference: 'email',
						notifications: true
					},
					metadata: {
						createdAt: now,
						updatedAt: now,
						version: '1.0'
					}
				} as AgentMetadata
			},
			{
				name: 'Carol Chen',
				image: 'https://avatars.githubusercontent.com/u/3456789?v=4',
				metadata: {
					description: 'Research scientist focused on open-source hardware and maker spaces.',
					bio: 'Dr. Carol Chen is a research scientist and maker space advocate who bridges the gap between academic research and practical implementation. She specializes in open-source hardware development and has been instrumental in building collaborative fabrication networks.',
					title: 'Research Scientist & Maker Space Coordinator',
					organization: 'Open Hardware Foundation',
					email: 'carol.chen@openhardware.org',
					website: 'https://carolchen.dev',
					socialMedia: {
						twitter: '@carolchen_maker',
						linkedin: 'linkedin.com/in/carolchen',
						github: 'github.com/carolchen',
						orcid: '0000-0004-3456-7890'
					},
					skills: [
						'Electronics Design',
						'CAD/CAM',
						'3D Printing',
						'Arduino',
						'Raspberry Pi',
						'Python',
						'Community Management'
					],
					expertise: [
						'Open Hardware',
						'Maker Spaces',
						'Digital Fabrication',
						'Electronics Prototyping',
						'STEM Education'
					],
					interests: [
						'Sustainable Technology',
						'Educational Tools',
						'Community Workshops',
						'Open Source Hardware'
					],
					location: {
						city: 'San Francisco',
						country: 'United States'
					},
					preferences: {
						visibility: 'public',
						contactPreference: 'email',
						notifications: true
					},
					metadata: {
						createdAt: now,
						updatedAt: now,
						version: '1.0'
					}
				} as AgentMetadata
			},
			{
				name: 'David Kim',
				image: 'https://avatars.githubusercontent.com/u/4567890?v=4',
				metadata: {
					description:
						'Urban farmer and educator promoting local food systems and community resilience.',
					bio: 'David Kim is an urban agriculture specialist and community educator who has spent over 15 years developing sustainable food systems in urban environments. He combines traditional farming knowledge with modern technology to create resilient local food networks.',
					title: 'Urban Agriculture Specialist',
					organization: 'Community Resilience Network',
					email: 'david.kim@resilientcommunity.org',
					website: 'https://urbanfarmcollective.org',
					socialMedia: {
						twitter: '@davidkim_farm',
						linkedin: 'linkedin.com/in/davidkimfarm',
						github: 'github.com/davidkimfarm',
						orcid: '0000-0005-4567-8901'
					},
					skills: [
						'Permaculture',
						'Hydroponic Systems',
						'Community Organizing',
						'Educational Program Design',
						'Sustainable Agriculture'
					],
					expertise: [
						'Urban Farming',
						'Food System Design',
						'Community Education',
						'Sustainable Practices',
						'Local Food Networks'
					],
					interests: [
						'Food Security',
						'Climate Resilience',
						'Community Gardens',
						'Regenerative Agriculture'
					],
					location: {
						city: 'Detroit',
						country: 'United States'
					},
					preferences: {
						visibility: 'public',
						contactPreference: 'email',
						notifications: true
					},
					metadata: {
						createdAt: now,
						updatedAt: now,
						version: '1.0'
					}
				} as AgentMetadata
			},
			{
				name: 'Maria Rodriguez',
				image: 'https://avatars.githubusercontent.com/u/5678901?v=4',
				metadata: {
					description:
						'Community organizer and social entrepreneur focused on cooperative economics and mutual aid.',
					bio: 'Maria Rodriguez is a community organizer and social entrepreneur who has dedicated her career to building cooperative economic structures and mutual aid networks. She has helped establish numerous worker cooperatives and community-owned enterprises across Latin America.',
					title: 'Community Organizer & Cooperative Developer',
					organization: 'Cooperative Economics Institute',
					email: 'maria.rodriguez@coopeconomics.org',
					website: 'https://coopeconomics.org',
					socialMedia: {
						twitter: '@maria_coop',
						linkedin: 'linkedin.com/in/mariarodriguez',
						github: 'github.com/mariarodriguez',
						orcid: '0000-0006-5678-9012'
					},
					skills: [
						'Community Organizing',
						'Cooperative Development',
						'Financial Planning',
						'Grant Writing',
						'Facilitation'
					],
					expertise: [
						'Worker Cooperatives',
						'Mutual Aid Networks',
						'Community Finance',
						'Social Enterprise',
						'Solidarity Economy'
					],
					interests: [
						'Economic Democracy',
						'Social Justice',
						'Community Resilience',
						'Cooperative Movement'
					],
					location: {
						city: 'Mexico City',
						country: 'Mexico'
					},
					languages: [
						{ language: 'Spanish', proficiency: 'native' },
						{ language: 'English', proficiency: 'fluent' },
						{ language: 'Portuguese', proficiency: 'intermediate' }
					],
					preferences: {
						visibility: 'public',
						contactPreference: 'email',
						notifications: true
					},
					metadata: {
						createdAt: now,
						updatedAt: now,
						version: '1.0'
					}
				} as AgentMetadata
			}
		];

		const randomSample = sampleAgents[Math.floor(Math.random() * sampleAgents.length)];

		try {
			const newAgent = await agentsStore.createAgent({
				name: randomSample.name,
				image: randomSample.image,
				note: stringifyAgentMetadata(randomSample.metadata)
			});
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
			<button
				onclick={openCreateProfileForm}
				class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
			>
				Create Profile
			</button>
		</div>
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
								<button
									onclick={() => goto(`/agents/${agent.id}`)}
									class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
								>
									View Profile
								</button>
								{#if agentsStore.myAgent?.id !== agent.id}
									<button
										onclick={() => {
											selectedAgentForMyAgent = agent.id;
											setMyAgent();
										}}
										class="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
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
