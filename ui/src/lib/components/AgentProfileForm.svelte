<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Agent, AgentMetadata } from '$lib/graphql/types';
	import { parseAgentMetadata, stringifyAgentMetadata } from '$lib/graphql/types';

	// Props
	interface Props {
		agent?: Agent | null;
		isEditing?: boolean;
	}

	let { agent = null, isEditing = false }: Props = $props();

	const dispatch = createEventDispatcher<{
		save: { name: string; note: string; image?: string };
		cancel: void;
	}>();

	// Form state
	let formData = $state({
		name: agent?.name || '',
		image: agent?.image || ''
	});

	// Metadata state
	let metadata = $state<AgentMetadata>({
		description: '',
		bio: '',
		title: '',
		organization: '',
		email: '',
		phone: '',
		website: '',
		socialMedia: {
			twitter: '',
			linkedin: '',
			github: '',
			orcid: ''
		},
		skills: [],
		expertise: [],
		interests: [],
		location: {
			city: '',
			country: ''
		},
		preferences: {
			visibility: 'public',
			contactPreference: 'email',
			notifications: true
		}
	});

	// Ensure nested objects are always initialized
	$effect(() => {
		if (!metadata.socialMedia) {
			metadata.socialMedia = { twitter: '', linkedin: '', github: '', orcid: '' };
		}
		if (!metadata.location) {
			metadata.location = { city: '', country: '' };
		}
		if (!metadata.preferences) {
			metadata.preferences = {
				visibility: 'public',
				contactPreference: 'email',
				notifications: true
			};
		}
	});

	// Initialize form data from existing agent
	$effect(() => {
		if (agent) {
			formData.name = agent.name;
			formData.image = agent.image || '';

			// Try to parse existing metadata
			const parsedMetadata = parseAgentMetadata(agent.note);
			if (parsedMetadata) {
				metadata = { ...metadata, ...parsedMetadata };
			} else {
				metadata.description = agent.note || '';
			}
		}
	});

	// Dynamic arrays for skills, expertise, interests
	let skillInput = $state('');
	let expertiseInput = $state('');
	let interestInput = $state('');

	// Functions to manage arrays
	function addSkill() {
		if (skillInput.trim()) {
			metadata.skills = [...(metadata.skills || []), skillInput.trim()];
			skillInput = '';
		}
	}

	function removeSkill(index: number) {
		metadata.skills = metadata.skills?.filter((_, i) => i !== index) || [];
	}

	function addExpertise() {
		if (expertiseInput.trim()) {
			metadata.expertise = [...(metadata.expertise || []), expertiseInput.trim()];
			expertiseInput = '';
		}
	}

	function removeExpertise(index: number) {
		metadata.expertise = metadata.expertise?.filter((_, i) => i !== index) || [];
	}

	function addInterest() {
		if (interestInput.trim()) {
			metadata.interests = [...(metadata.interests || []), interestInput.trim()];
			interestInput = '';
		}
	}

	function removeInterest(index: number) {
		metadata.interests = metadata.interests?.filter((_, i) => i !== index) || [];
	}

	// Form submission
	function handleSubmit(event: Event) {
		event.preventDefault();

		if (!formData.name.trim()) {
			alert('Name is required');
			return;
		}

		// Add timestamps
		const now = new Date().toISOString();
		metadata.metadata = {
			...metadata.metadata,
			updatedAt: now,
			version: '1.0'
		};

		if (!isEditing) {
			metadata.metadata.createdAt = now;
		}

		const noteContent = stringifyAgentMetadata(metadata);

		dispatch('save', {
			name: formData.name.trim(),
			note: noteContent,
			image: formData.image.trim() || undefined
		});
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<form onsubmit={handleSubmit} class="space-y-6">
	<!-- Basic Information -->
	<div class="space-y-4">
		<h3 class="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					Name *
				</label>
				<input
					type="text"
					id="name"
					bind:value={formData.name}
					required
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>

			<div>
				<label for="image" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					Profile Image URL
				</label>
				<input
					type="url"
					id="image"
					bind:value={formData.image}
					placeholder="https://example.com/avatar.jpg"
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>
		</div>
	</div>

	<!-- Structured metadata form -->
	<div class="space-y-6">
		<!-- Description and Bio -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					Short Description
				</label>
				<textarea
					id="description"
					bind:value={metadata.description}
					rows="3"
					placeholder="Brief description..."
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				></textarea>
			</div>

			<div>
				<label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					Bio
				</label>
				<textarea
					id="bio"
					bind:value={metadata.bio}
					rows="3"
					placeholder="Longer biographical information..."
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				></textarea>
			</div>
		</div>

		<!-- Professional Information -->
		<div class="space-y-4">
			<h4 class="text-md font-medium text-gray-900 dark:text-white">Professional Information</h4>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Title
					</label>
					<input
						type="text"
						id="title"
						bind:value={metadata.title}
						placeholder="e.g., Software Developer"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>
			</div>
		</div>

		<!-- Contact Information -->
		<div class="space-y-4">
			<h4 class="text-md font-medium text-gray-900 dark:text-white">Contact Information</h4>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Email
					</label>
					<input
						type="email"
						id="email"
						bind:value={metadata.email}
						placeholder="email@example.com"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div>
					<label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Phone
					</label>
					<input
						type="tel"
						id="phone"
						bind:value={metadata.phone}
						placeholder="+1 (555) 123-4567"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div>
					<label for="website" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Website
					</label>
					<input
						type="url"
						id="website"
						bind:value={metadata.website}
						placeholder="https://example.com"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>
			</div>
		</div>

		<!-- Social Media -->
		<div class="space-y-4">
			<h4 class="text-md font-medium text-gray-900 dark:text-white">Social Media & Links</h4>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label for="twitter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Twitter
					</label>
					<input
						type="text"
						id="twitter"
						bind:value={metadata.socialMedia!.twitter}
						placeholder="@username"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div>
					<label for="linkedin" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						LinkedIn
					</label>
					<input
						type="text"
						id="linkedin"
						bind:value={metadata.socialMedia!.linkedin}
						placeholder="linkedin.com/in/username"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div>
					<label for="github" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						GitHub
					</label>
					<input
						type="text"
						id="github"
						bind:value={metadata.socialMedia!.github}
						placeholder="github.com/username"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div>
					<label for="orcid" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						ORCID
					</label>
					<input
						type="text"
						id="orcid"
						bind:value={metadata.socialMedia!.orcid}
						placeholder="0000-0000-0000-0000"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>
			</div>
		</div>

		<!-- Location -->
		<div class="space-y-4">
			<h4 class="text-md font-medium text-gray-900 dark:text-white">Location</h4>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label for="city" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						City
					</label>
					<input
						type="text"
						id="city"
						bind:value={metadata.location!.city}
						placeholder="e.g., Portland"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div>
					<label for="country" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Country
					</label>
					<input
						type="text"
						id="country"
						bind:value={metadata.location!.country}
						placeholder="e.g., United States"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>
			</div>
		</div>

		<!-- Skills, Expertise, Interests -->
		<div class="space-y-4">
			<h4 class="text-md font-medium text-gray-900 dark:text-white">Skills & Expertise</h4>

			<!-- Skills -->
			<div>
				<label for="skills-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Skills</label
				>
				<div class="mt-1 flex flex-wrap gap-2">
					{#each metadata.skills || [] as skill, index}
						<span
							class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
						>
							{skill}
							<button
								type="button"
								onclick={() => removeSkill(index)}
								class="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
							>
								×
							</button>
						</span>
					{/each}
				</div>
				<div class="mt-2 flex">
					<input
						id="skills-input"
						type="text"
						bind:value={skillInput}
						placeholder="Add a skill..."
						class="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
					/>
					<button
						type="button"
						onclick={addSkill}
						class="rounded-r-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					>
						Add
					</button>
				</div>
			</div>

			<!-- Expertise -->
			<div>
				<label
					for="expertise-input"
					class="block text-sm font-medium text-gray-700 dark:text-gray-300">Expertise</label
				>
				<div class="mt-1 flex flex-wrap gap-2">
					{#each metadata.expertise || [] as expertise, index}
						<span
							class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
						>
							{expertise}
							<button
								type="button"
								onclick={() => removeExpertise(index)}
								class="ml-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
							>
								×
							</button>
						</span>
					{/each}
				</div>
				<div class="mt-2 flex">
					<input
						id="expertise-input"
						type="text"
						bind:value={expertiseInput}
						placeholder="Add expertise..."
						class="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
					/>
					<button
						type="button"
						onclick={addExpertise}
						class="rounded-r-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
					>
						Add
					</button>
				</div>
			</div>

			<!-- Interests -->
			<div>
				<label
					for="interests-input"
					class="block text-sm font-medium text-gray-700 dark:text-gray-300">Interests</label
				>
				<div class="mt-1 flex flex-wrap gap-2">
					{#each metadata.interests || [] as interest, index}
						<span
							class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200"
						>
							{interest}
							<button
								type="button"
								onclick={() => removeInterest(index)}
								class="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
							>
								×
							</button>
						</span>
					{/each}
				</div>
				<div class="mt-2 flex">
					<input
						id="interests-input"
						type="text"
						bind:value={interestInput}
						placeholder="Add interest..."
						class="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
					/>
					<button
						type="button"
						onclick={addInterest}
						class="rounded-r-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
					>
						Add
					</button>
				</div>
			</div>
		</div>

		<!-- Preferences -->
		<div class="space-y-4">
			<h4 class="text-md font-medium text-gray-900 dark:text-white">Preferences</h4>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div>
					<label
						for="visibility-select"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300">Visibility</label
					>
					<select
						id="visibility-select"
						bind:value={metadata.preferences!.visibility}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						<option value="public">Public</option>
						<option value="network">Network Only</option>
						<option value="private">Private</option>
					</select>
				</div>
				<div>
					<label
						for="contact-preference-select"
						class="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Contact Preference</label
					>
					<select
						id="contact-preference-select"
						bind:value={metadata.preferences!.contactPreference}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						<option value="email">Email</option>
						<option value="phone">Phone</option>
						<option value="message">Message</option>
					</select>
				</div>
				<div class="flex items-center">
					<input
						type="checkbox"
						id="notifications"
						bind:checked={metadata.preferences!.notifications}
						class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
					/>
					<label for="notifications" class="ml-2 block text-sm text-gray-900 dark:text-white">
						Enable notifications
					</label>
				</div>
			</div>
		</div>
	</div>

	<!-- Form actions -->
	<div class="flex justify-end space-x-3 border-t border-gray-200 pt-6 dark:border-gray-700">
		<button
			type="button"
			onclick={handleCancel}
			class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
		>
			Cancel
		</button>
		<button
			type="submit"
			class="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
		>
			{isEditing ? 'Update Profile' : 'Create Profile'}
		</button>
	</div>
</form>
