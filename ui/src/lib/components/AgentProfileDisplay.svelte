<script lang="ts">
	import type { Agent, AgentMetadata } from '$lib/graphql/types';
	import { parseAgentMetadata } from '$lib/graphql/types';

	export let agent: Agent;
	export let showFullProfile: boolean = false;

	// Parse metadata from agent note
	$: parsedMetadata = parseAgentMetadata(agent.note);
	$: hasStructuredMetadata = parsedMetadata !== null;

	function formatDate(dateString?: string): string {
		if (!dateString) return '';
		try {
			return new Date(dateString).toLocaleDateString();
		} catch {
			return dateString;
		}
	}

	function formatProficiency(level: string): string {
		const levels = {
			native: 'Native',
			fluent: 'Fluent',
			intermediate: 'Intermediate',
			basic: 'Basic'
		};
		return levels[level as keyof typeof levels] || level;
	}
</script>

<div class="space-y-4">
	<!-- Basic Information -->
	<div class="flex items-start space-x-4">
		{#if agent.image}
			<img
				src={agent.image}
				alt="{agent.name} profile"
				class="h-16 w-16 rounded-full object-cover"
			/>
		{:else}
			<div
				class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600"
			>
				<span class="text-xl font-medium text-gray-700 dark:text-gray-300">
					{agent.name.charAt(0).toUpperCase()}
				</span>
			</div>
		{/if}

		<div class="flex-1">
			<h3 class="text-lg font-medium text-gray-900 dark:text-white">
				{agent.name}
			</h3>

			{#if hasStructuredMetadata && parsedMetadata}
				{#if parsedMetadata.title}
					<p class="text-sm text-gray-600 dark:text-gray-400">{parsedMetadata.title}</p>
				{/if}
				{#if parsedMetadata.organization}
					<p class="text-sm text-gray-500 dark:text-gray-500">
						{parsedMetadata.organization}
						{#if parsedMetadata.department}
							• {parsedMetadata.department}
						{/if}
					</p>
				{/if}
				{#if parsedMetadata.location?.city || parsedMetadata.location?.country}
					<p class="text-sm text-gray-500 dark:text-gray-500">
						📍 {parsedMetadata.location.city}{parsedMetadata.location.city &&
						parsedMetadata.location.country
							? ', '
							: ''}{parsedMetadata.location.country}
					</p>
				{/if}
			{:else if agent.primaryLocation}
				<p class="text-sm text-gray-500 dark:text-gray-500">📍 {agent.primaryLocation}</p>
			{/if}
		</div>
	</div>

	<!-- Description/Bio -->
	{#if hasStructuredMetadata && parsedMetadata}
		{#if parsedMetadata.description}
			<p class="text-sm text-gray-700 dark:text-gray-300">{parsedMetadata.description}</p>
		{/if}
		{#if showFullProfile && parsedMetadata.bio}
			<p class="text-sm text-gray-600 dark:text-gray-400">{parsedMetadata.bio}</p>
		{/if}
	{:else if agent.note}
		<p class="text-sm text-gray-700 dark:text-gray-300">{agent.note}</p>
	{/if}

	{#if showFullProfile && hasStructuredMetadata && parsedMetadata}
		<!-- Contact Information -->
		{#if parsedMetadata.email || parsedMetadata.phone || parsedMetadata.website}
			<div class="border-t border-gray-200 pt-4 dark:border-gray-700">
				<h4 class="mb-2 text-sm font-medium text-gray-900 dark:text-white">Contact</h4>
				<div class="space-y-1">
					{#if parsedMetadata.email}
						<p class="text-sm text-gray-600 dark:text-gray-400">
							✉️ <a
								href="mailto:{parsedMetadata.email}"
								class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
								>{parsedMetadata.email}</a
							>
						</p>
					{/if}
					{#if parsedMetadata.phone}
						<p class="text-sm text-gray-600 dark:text-gray-400">
							📞 <a
								href="tel:{parsedMetadata.phone}"
								class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
								>{parsedMetadata.phone}</a
							>
						</p>
					{/if}
					{#if parsedMetadata.website}
						<p class="text-sm text-gray-600 dark:text-gray-400">
							🌐 <a
								href={parsedMetadata.website}
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
								>{parsedMetadata.website}</a
							>
						</p>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Social Media -->
		{#if parsedMetadata.socialMedia && Object.values(parsedMetadata.socialMedia).some((v) => v)}
			<div class="border-t border-gray-200 pt-4 dark:border-gray-700">
				<h4 class="mb-2 text-sm font-medium text-gray-900 dark:text-white">Social Media</h4>
				<div class="flex flex-wrap gap-2">
					{#if parsedMetadata.socialMedia.twitter}
						<a
							href="https://twitter.com/{parsedMetadata.socialMedia.twitter.replace('@', '')}"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
						>
							Twitter
						</a>
					{/if}
					{#if parsedMetadata.socialMedia.linkedin}
						<a
							href="https://{parsedMetadata.socialMedia.linkedin.startsWith('http')
								? ''
								: 'linkedin.com/in/'}{parsedMetadata.socialMedia.linkedin}"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
						>
							LinkedIn
						</a>
					{/if}
					{#if parsedMetadata.socialMedia.github}
						<a
							href="https://{parsedMetadata.socialMedia.github.startsWith('http')
								? ''
								: 'github.com/'}{parsedMetadata.socialMedia.github}"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
						>
							GitHub
						</a>
					{/if}
					{#if parsedMetadata.socialMedia.orcid}
						<a
							href="https://orcid.org/{parsedMetadata.socialMedia.orcid}"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center rounded bg-green-100 px-2 py-1 text-xs text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
						>
							ORCID
						</a>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Skills & Expertise -->
		{#if parsedMetadata.skills?.length || parsedMetadata.expertise?.length || parsedMetadata.interests?.length}
			<div class="border-t border-gray-200 pt-4 dark:border-gray-700">
				<h4 class="mb-2 text-sm font-medium text-gray-900 dark:text-white">Skills & Expertise</h4>

				{#if parsedMetadata.skills?.length}
					<div class="mb-3">
						<h5 class="mb-1 text-xs font-medium text-gray-700 dark:text-gray-400">Skills</h5>
						<div class="flex flex-wrap gap-1">
							{#each parsedMetadata.skills as skill}
								<span
									class="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
								>
									{skill}
								</span>
							{/each}
						</div>
					</div>
				{/if}

				{#if parsedMetadata.expertise?.length}
					<div class="mb-3">
						<h5 class="mb-1 text-xs font-medium text-gray-700 dark:text-gray-400">Expertise</h5>
						<div class="flex flex-wrap gap-1">
							{#each parsedMetadata.expertise as expertise}
								<span
									class="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
								>
									{expertise}
								</span>
							{/each}
						</div>
					</div>
				{/if}

				{#if parsedMetadata.interests?.length}
					<div class="mb-3">
						<h5 class="mb-1 text-xs font-medium text-gray-700 dark:text-gray-400">Interests</h5>
						<div class="flex flex-wrap gap-1">
							{#each parsedMetadata.interests as interest}
								<span
									class="inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200"
								>
									{interest}
								</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Experience -->
		{#if parsedMetadata.experience?.length}
			<div class="border-t border-gray-200 pt-4 dark:border-gray-700">
				<h4 class="mb-2 text-sm font-medium text-gray-900 dark:text-white">Experience</h4>
				<div class="space-y-3">
					{#each parsedMetadata.experience as exp}
						<div class="border-l-2 border-blue-200 pl-3 dark:border-blue-800">
							<h5 class="text-sm font-medium text-gray-900 dark:text-white">{exp.title}</h5>
							{#if exp.startDate || exp.endDate}
								<p class="text-xs text-gray-500 dark:text-gray-400">
									{formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
								</p>
							{/if}
							{#if exp.description}
								<p class="mt-1 text-xs text-gray-600 dark:text-gray-400">{exp.description}</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Education -->
		{#if parsedMetadata.education?.length}
			<div class="border-t border-gray-200 pt-4 dark:border-gray-700">
				<h4 class="mb-2 text-sm font-medium text-gray-900 dark:text-white">Education</h4>
				<div class="space-y-2">
					{#each parsedMetadata.education as edu}
						<div>
							<h5 class="text-sm font-medium text-gray-900 dark:text-white">{edu.degree}</h5>
							<p class="text-xs text-gray-600 dark:text-gray-400">
								{edu.institution}
								{#if edu.year}• {edu.year}{/if}
								{#if edu.field}• {edu.field}{/if}
							</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Languages -->
		{#if parsedMetadata.languages?.length}
			<div class="border-t border-gray-200 pt-4 dark:border-gray-700">
				<h4 class="mb-2 text-sm font-medium text-gray-900 dark:text-white">Languages</h4>
				<div class="flex flex-wrap gap-2">
					{#each parsedMetadata.languages as lang}
						<span
							class="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200"
						>
							{lang.language} ({formatProficiency(lang.proficiency)})
						</span>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Certifications -->
		{#if parsedMetadata.certifications?.length}
			<div class="border-t border-gray-200 pt-4 dark:border-gray-700">
				<h4 class="mb-2 text-sm font-medium text-gray-900 dark:text-white">Certifications</h4>
				<div class="space-y-2">
					{#each parsedMetadata.certifications as cert}
						<div>
							<h5 class="text-sm font-medium text-gray-900 dark:text-white">{cert.name}</h5>
							<p class="text-xs text-gray-600 dark:text-gray-400">
								{cert.issuer}
								{#if cert.date}• {formatDate(cert.date)}{/if}
								{#if cert.expirationDate}• Expires: {formatDate(cert.expirationDate)}{/if}
							</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Publications -->
		{#if parsedMetadata.publications?.length}
			<div class="border-t border-gray-200 pt-4 dark:border-gray-700">
				<h4 class="mb-2 text-sm font-medium text-gray-900 dark:text-white">Publications</h4>
				<div class="space-y-2">
					{#each parsedMetadata.publications as pub}
						<div>
							<h5 class="text-sm font-medium text-gray-900 dark:text-white">
								{#if pub.url}
									<a
										href={pub.url}
										target="_blank"
										rel="noopener noreferrer"
										class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
									>
										{pub.title}
									</a>
								{:else}
									{pub.title}
								{/if}
							</h5>
							<p class="text-xs text-gray-600 dark:text-gray-400">
								{pub.type.charAt(0).toUpperCase() + pub.type.slice(1)}
								{#if pub.date}• {formatDate(pub.date)}{/if}
							</p>
							{#if pub.description}
								<p class="mt-1 text-xs text-gray-500 dark:text-gray-500">{pub.description}</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Metadata Info -->
		{#if parsedMetadata.metadata?.createdAt || parsedMetadata.metadata?.updatedAt}
			<div class="border-t border-gray-200 pt-4 dark:border-gray-700">
				<div class="text-xs text-gray-500 dark:text-gray-400">
					{#if parsedMetadata.metadata.createdAt}
						Created: {formatDate(parsedMetadata.metadata.createdAt)}
					{/if}
					{#if parsedMetadata.metadata.updatedAt}
						• Updated: {formatDate(parsedMetadata.metadata.updatedAt)}
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</div>
