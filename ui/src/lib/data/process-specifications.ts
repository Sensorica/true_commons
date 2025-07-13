export interface ProcessSpecificationConfig {
	id: string; // Internal ID for reference
	name: string;
	note: string;
}

export const DEFAULT_PROCESS_SPECIFICATIONS: ProcessSpecificationConfig[] = [
	{
		id: 'general-discussion-proc-spec',
		name: 'General Discussion',
		note: 'A process for general discussions, brainstorming, and decision-making.'
	},
	{
		id: 'software-development-proc-spec',
		name: 'Software Development',
		note: 'A process for planning, developing, and deploying software components.'
	},
	{
		id: 'content-creation-proc-spec',
		name: 'Content Creation',
		note: 'A process for creating written or visual content, such as articles, documentation, or designs.'
	},
	{
		id: 'community-governance-proc-spec',
		name: 'Community Governance',
		note: 'A process for community-related decisions, proposals, and governance tasks.'
	}
];

export const REQUIRED_PROCESS_SPECIFICATIONS = [
	'general-discussion-proc-spec',
	'software-development-proc-spec'
] as const;
