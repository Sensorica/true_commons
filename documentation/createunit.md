+page.svelte:83 🔍 Starting GraphQL schema introspection...
schema-introspection.ts:327 🔍 Introspecting GraphQL schema...
schema-introspection.ts:120 ✅ createUnit mutation found and analyzed
schema-introspection.ts:205 === GraphQL Schema Introspection ===

schema-introspection.ts:208 === CREATE UNIT MUTATION ANALYSIS ===
schema-introspection.ts:211 
🎯 createUnit:
schema-introspection.ts:215   Return Type: UnitResponse!
schema-introspection.ts:217 
📝 Mutation Arguments:
schema-introspection.ts:219     unit: UnitCreateParams!
schema-introspection.ts:225 
🔧 UnitCreateParams Fields:
schema-introspection.ts:229     label: String! (required)
schema-introspection.ts:231       Description: A human readable label for the unit, can be language specific.
schema-introspection.ts:229     symbol: String! (required)
schema-introspection.ts:231       Description: A standard display symbol for a unit of measure.
schema-introspection.ts:229     omUnitIdentifier: String! (required)
schema-introspection.ts:231       Description: The OM2 identifier for the unit.
schema-introspection.ts:229     classifiedAs: [URI!] (required)
schema-introspection.ts:231       Description: References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping.
schema-introspection.ts:238 
📤 Unit Response Fields:
schema-introspection.ts:241     id: ID!
schema-introspection.ts:241     revisionId: ID!
schema-introspection.ts:241     label: String!
schema-introspection.ts:243       Description: A human readable label for the unit, can be language specific.
schema-introspection.ts:241     symbol: String!
schema-introspection.ts:243       Description: A standard display symbol for a unit of measure.
schema-introspection.ts:241     omUnitIdentifier: String!
schema-introspection.ts:243       Description: The OM2 identifier for the unit.
schema-introspection.ts:241     classifiedAs: String
schema-introspection.ts:243       Description: Arbitrary classification for the unit.
schema-introspection.ts:241     revision: Unit
schema-introspection.ts:241     meta: RecordMeta!
schema-introspection.ts:250 
💡 Example Usage:
schema-introspection.ts:251     mutation CreateUnit($unit: UnitCreateParams!) {
schema-introspection.ts:252       createUnit(unit: $unit) {
schema-introspection.ts:253         unit {
schema-introspection.ts:255           id
schema-introspection.ts:255           revisionId
schema-introspection.ts:255           label
schema-introspection.ts:255           symbol
schema-introspection.ts:255           omUnitIdentifier
schema-introspection.ts:255           classifiedAs
schema-introspection.ts:255           revision
schema-introspection.ts:255           meta
schema-introspection.ts:257         }
schema-introspection.ts:258       }
schema-introspection.ts:259     }
schema-introspection.ts:261 
📋 Sample Variables:
schema-introspection.ts:262     {
schema-introspection.ts:263       "unit": {
schema-introspection.ts:264         "omUnitIdentifier": "kg",
schema-introspection.ts:265         "label": "Kilogram",
schema-introspection.ts:266         "symbol": "kg",
schema-introspection.ts:267         "classifiedAs": ["mass", "weight"]
schema-introspection.ts:268       }
schema-introspection.ts:269     }
schema-introspection.ts:275 
=== ALL UNIT-RELATED MUTATIONS ===
schema-introspection.ts:280 
createUnit:
schema-introspection.ts:284   Return Type: UnitResponse!
schema-introspection.ts:286   Arguments:
schema-introspection.ts:288     unit: UnitCreateParams!
schema-introspection.ts:280 
updateUnit:
schema-introspection.ts:284   Return Type: UnitResponse!
schema-introspection.ts:286   Arguments:
schema-introspection.ts:288     unit: UnitUpdateParams!
schema-introspection.ts:280 
deleteUnit:
schema-introspection.ts:284   Return Type: Boolean!
schema-introspection.ts:286   Arguments:
schema-introspection.ts:288     revisionId: ID!
schema-introspection.ts:300 
=== ALL MUTATIONS ===
schema-introspection.ts:302 
createPerson:
schema-introspection.ts:304   Description: Registers a new (human) person with the collaboration space
schema-introspection.ts:306   Return Type: PersonResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     person: AgentCreateParams!
schema-introspection.ts:302 
updatePerson:
schema-introspection.ts:304   Description: Update profile details
schema-introspection.ts:306   Return Type: PersonResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     person: AgentUpdateParams!
schema-introspection.ts:302 
deletePerson:
schema-introspection.ts:304   Description: Erase record of a person and thus remove them from the collaboration space
schema-introspection.ts:306   Return Type: Boolean!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     revisionId: ID!
schema-introspection.ts:302 
createOrganization:
schema-introspection.ts:304   Description: Registers a new organization (group agent) with the collaboration space
schema-introspection.ts:306   Return Type: OrganizationResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     organization: OrganizationCreateParams!
schema-introspection.ts:302 
updateOrganization:
schema-introspection.ts:304   Description: Update organization profile details
schema-introspection.ts:306   Return Type: OrganizationResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     organization: OrganizationUpdateParams!
schema-introspection.ts:302 
deleteOrganization:
schema-introspection.ts:304   Description: Erase record of an organization and thus remove it from the collaboration space
schema-introspection.ts:306   Return Type: Boolean!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     revisionId: ID!
schema-introspection.ts:302 
createAgentRelationship:
schema-introspection.ts:306   Return Type: AgentRelationshipResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     relationship: AgentRelationshipCreateParams!
schema-introspection.ts:302 
updateAgentRelationship:
schema-introspection.ts:306   Return Type: AgentRelationshipResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     relationship: AgentRelationshipUpdateParams!
schema-introspection.ts:302 
deleteAgentRelationship:
schema-introspection.ts:306   Return Type: Boolean!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     revisionId: ID!
schema-introspection.ts:302 
createAgentRelationshipRole:
schema-introspection.ts:306   Return Type: AgentRelationshipRoleResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     agentRelationshipRole: AgentRelationshipRoleCreateParams!
schema-introspection.ts:302 
updateAgentRelationshipRole:
schema-introspection.ts:306   Return Type: AgentRelationshipRoleResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     agentRelationshipRole: AgentRelationshipRoleUpdateParams!
schema-introspection.ts:302 
deleteAgentRelationshipRole:
schema-introspection.ts:306   Return Type: Boolean!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     revisionId: ID!
schema-introspection.ts:302 
createAgreement:
schema-introspection.ts:306   Return Type: AgreementResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     agreement: AgreementCreateParams
schema-introspection.ts:302 
updateAgreement:
schema-introspection.ts:306   Return Type: AgreementResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     agreement: AgreementUpdateParams
schema-introspection.ts:302 
deleteAgreement:
schema-introspection.ts:306   Return Type: Boolean!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     revisionId: ID!
schema-introspection.ts:302 
createCommitment:
schema-introspection.ts:306   Return Type: CommitmentResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     commitment: CommitmentCreateParams!
schema-introspection.ts:302 
updateCommitment:
schema-introspection.ts:306   Return Type: CommitmentResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     commitment: CommitmentUpdateParams!
schema-introspection.ts:302 
deleteCommitment:
schema-introspection.ts:306   Return Type: Boolean!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     revisionId: ID!
schema-introspection.ts:302 
createIntent:
schema-introspection.ts:306   Return Type: IntentResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     intent: IntentCreateParams!
schema-introspection.ts:302 
updateIntent:
schema-introspection.ts:306   Return Type: IntentResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     intent: IntentUpdateParams!
schema-introspection.ts:302 
deleteIntent:
schema-introspection.ts:306   Return Type: Boolean!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     revisionId: ID!
schema-introspection.ts:302 
createUnit:
schema-introspection.ts:306   Return Type: UnitResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     unit: UnitCreateParams!
schema-introspection.ts:302 
updateUnit:
schema-introspection.ts:306   Return Type: UnitResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     unit: UnitUpdateParams!
schema-introspection.ts:302 
deleteUnit:
schema-introspection.ts:306   Return Type: Boolean!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     revisionId: ID!
schema-introspection.ts:302 
createEconomicEvent:
schema-introspection.ts:304   Description: Registers a new (`EconomicEvent`) with the collaboration space. Also serves as a means to register (`EconomicResource`) as well, instead of createEconomicResource
schema-introspection.ts:306   Return Type: EconomicEventResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     event: EconomicEventCreateParams!
schema-introspection.ts:310     newInventoriedResource: EconomicResourceCreateParams
schema-introspection.ts:302 
updateEconomicEvent:
schema-introspection.ts:306   Return Type: EconomicEventResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     event: EconomicEventUpdateParams!
schema-introspection.ts:302 
updateEconomicResource:
schema-introspection.ts:306   Return Type: EconomicResourceResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     resource: EconomicResourceUpdateParams!
schema-introspection.ts:302 
createPlan:
schema-introspection.ts:306   Return Type: PlanResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     plan: PlanCreateParams!
schema-introspection.ts:302 
updatePlan:
schema-introspection.ts:306   Return Type: PlanResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     plan: PlanUpdateParams!
schema-introspection.ts:302 
deletePlan:
schema-introspection.ts:306   Return Type: Boolean!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     revisionId: ID!
schema-introspection.ts:302 
createProcess:
schema-introspection.ts:306   Return Type: ProcessResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     process: ProcessCreateParams!
schema-introspection.ts:302 
updateProcess:
schema-introspection.ts:306   Return Type: ProcessResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     process: ProcessUpdateParams!
schema-introspection.ts:302 
deleteProcess:
schema-introspection.ts:306   Return Type: Boolean!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     id: ID!
schema-introspection.ts:302 
createProcessSpecification:
schema-introspection.ts:306   Return Type: ProcessSpecificationResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     processSpecification: ProcessSpecificationCreateParams!
schema-introspection.ts:302 
updateProcessSpecification:
schema-introspection.ts:306   Return Type: ProcessSpecificationResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     processSpecification: ProcessSpecificationUpdateParams!
schema-introspection.ts:302 
deleteProcessSpecification:
schema-introspection.ts:306   Return Type: Boolean!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     revisionId: ID!
schema-introspection.ts:302 
createProposal:
schema-introspection.ts:306   Return Type: ProposalResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     proposal: ProposalCreateParams!
schema-introspection.ts:302 
updateProposal:
schema-introspection.ts:306   Return Type: ProposalResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     proposal: ProposalUpdateParams!
schema-introspection.ts:302 
deleteProposal:
schema-introspection.ts:306   Return Type: Boolean!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     revisionId: ID!
schema-introspection.ts:302 
createRecipeFlow:
schema-introspection.ts:306   Return Type: RecipeFlowResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     recipeFlow: RecipeFlowCreateParams!
schema-introspection.ts:302 
updateRecipeFlow:
schema-introspection.ts:306   Return Type: RecipeFlowResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     recipeFlow: RecipeFlowUpdateParams!
schema-introspection.ts:302 
deleteRecipeFlow:
schema-introspection.ts:306   Return Type: Boolean!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     revisionId: ID!
schema-introspection.ts:302 
createRecipeProcess:
schema-introspection.ts:306   Return Type: RecipeProcessResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     recipeProcess: RecipeProcessCreateParams!
schema-introspection.ts:302 
updateRecipeProcess:
schema-introspection.ts:306   Return Type: RecipeProcessResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     recipeProcess: RecipeProcessUpdateParams!
schema-introspection.ts:302 
deleteRecipeProcess:
schema-introspection.ts:306   Return Type: Boolean!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     revisionId: ID!
schema-introspection.ts:302 
createRecipeExchange:
schema-introspection.ts:306   Return Type: RecipeExchangeResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     recipeExchange: RecipeExchangeCreateParams!
schema-introspection.ts:302 
updateRecipeExchange:
schema-introspection.ts:306   Return Type: RecipeExchangeResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     recipeExchange: RecipeExchangeUpdateParams!
schema-introspection.ts:302 
deleteRecipeExchange:
schema-introspection.ts:306   Return Type: Boolean!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     revisionId: ID!
schema-introspection.ts:302 
createResourceSpecification:
schema-introspection.ts:306   Return Type: ResourceSpecificationResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     resourceSpecification: ResourceSpecificationCreateParams!
schema-introspection.ts:302 
updateResourceSpecification:
schema-introspection.ts:306   Return Type: ResourceSpecificationResponse!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     resourceSpecification: ResourceSpecificationUpdateParams!
schema-introspection.ts:302 
deleteResourceSpecification:
schema-introspection.ts:306   Return Type: Boolean!
schema-introspection.ts:308   Arguments:
schema-introspection.ts:310     revisionId: ID!
schema-introspection.ts:318 
=== FULL SCHEMA SDL ===
schema-introspection.ts:319 """
An action verb defining the kind of event, commitment, or intent.
It is recommended that the lowercase action verb should be used as the record ID
in order that references to `Action`s elsewhere in the system are easily readable.
"""
type Action {
  id: ID!

  """A unique verb which defines the action."""
  label: String!

  """
  The accounting effect of an economic event on a resource, increment, decrement, no effect, or decrement resource and increment 'to' resource.
  """
  resourceEffect: String!

  """
  The onhand effect of an economic event on a resource, increment, decrement, no effect, or decrement resource and increment 'to' resource.
  """
  onhandEffect: String!

  """Denotes if a process input or output, or not related to a process."""
  inputOutput: String

  """
  The action that should be included on the other direction of the process, for example accept with modify.
  """
  pairsWith: String
}

type Query {
  action(id: ID!): Action
  actions: [Action!]

  """Loads details of the currently authenticated REA agent"""
  myAgent: Agent

  """Find an agent (person or organization) by their ID"""
  agent(id: ID!): Agent

  """Loads all agents publicly registered within this collaboration space"""
  agents(first: Int, after: String, last: Int, before: String): AgentConnection!

  """Find an organization (group) agent by its ID"""
  organization(id: ID!): Organization

  """
  Loads all organizations publicly registered within this collaboration space
  """
  organizations(first: Int, after: String, last: Int, before: String): OrganizationConnection!

  """Find a person by their ID"""
  person(id: ID!): Person

  """
  Loads all people who have publicly registered with this collaboration space.
  """
  people(first: Int, after: String, last: Int, before: String): PersonConnection!

  """Retrieve details of an agent relationship by its ID"""
  agentRelationship(id: ID!): AgentRelationship

  """
  Retrieve details of all the relationships between all agents registered in this collaboration space
  """
  agentRelationships(first: Int, after: String, last: Int, before: String): AgentRelationshipConnection!

  """Retrieve details of an agent relationship role by its ID"""
  agentRelationshipRole(id: ID!): AgentRelationshipRole

  """
  Retrieve all possible kinds of associations that agents may have with one another in this collaboration space
  """
  agentRelationshipRoles(first: Int, after: String, last: Int, before: String): AgentRelationshipRoleConnection!
  agreement(id: ID!): Agreement
  agreements(first: Int, after: String, last: Int, before: String): AgreementConnection!
  commitment(id: ID!): Commitment
  commitments(first: Int, after: String, last: Int, before: String): CommitmentConnection!
  intent(id: ID!): Intent
  intents(first: Int, after: String, last: Int, before: String): IntentConnection!
  unit(id: ID!): Unit
  units(first: Int, after: String, last: Int, before: String): UnitConnection!
  economicEvent(id: ID!): EconomicEvent
  economicEvents(first: Int, after: String, last: Int, before: String): EconomicEventConnection!
  economicResource(id: ID!): EconomicResource
  economicResources(first: Int, after: String, last: Int, before: String): EconomicResourceConnection!
  plan(id: ID!): Plan
  plans(first: Int, after: String, last: Int, before: String): PlanConnection!
  process(id: ID!): Process
  processes(first: Int, after: String, last: Int, before: String): ProcessConnection!
  processSpecification(id: ID!): ProcessSpecification
  processSpecifications(first: Int, after: String, last: Int, before: String): ProcessSpecificationConnection!
  proposal(id: ID!): Proposal
  proposals(first: Int, after: String, last: Int, before: String): ProposalConnection!

  """List all proposals that are being listed as offers."""
  offers(first: Int, after: String, last: Int, before: String): ProposalConnection!

  """List all proposals that are being listed as requests."""
  requests(first: Int, after: String, last: Int, before: String): ProposalConnection!
  recipeFlow(id: ID!): RecipeFlow
  recipeFlows(first: Int, after: String, last: Int, before: String): RecipeFlowConnection!
  recipeProcess(id: ID!): RecipeProcess
  recipeProcesses(first: Int, after: String, last: Int, before: String): RecipeProcessConnection!
  recipeExchange(id: ID!): RecipeExchange
  recipeExchanges(first: Int, after: String, last: Int, before: String): RecipeExchangeConnection!
  resourceSpecification(id: ID!): ResourceSpecification
  resourceSpecifications(first: Int, after: String, last: Int, before: String): ResourceSpecificationConnection!
}

"""
A boundary or context grouped around some other record- used for documenting, accounting, planning.
"""
union AccountingScope = Person | Organization

"""A person or group or organization with economic agency."""
interface Agent {
  id: ID!
  revisionId: ID!

  """
  An informal or formal textual identifier for an agent. Does not imply uniqueness.
  """
  name: String!

  """
  The uri to an image relevant to the agent, such as a logo, avatar, photo, etc.
  """
  image: URI

  """A textual description or comment."""
  note: String
  relationships(first: Int, after: String, last: Int, before: String): AgentRelationshipConnection
  relationshipsAsSubject(first: Int, after: String, last: Int, before: String): AgentRelationshipConnection
  relationshipsAsObject(first: Int, after: String, last: Int, before: String): AgentRelationshipConnection
  roles: [AgentRelationshipRole!]
  commitments(first: Int, after: String, last: Int, before: String): CommitmentConnection
  commitmentsAsProvider(first: Int, after: String, last: Int, before: String): CommitmentConnection
  commitmentsAsReceiver(first: Int, after: String, last: Int, before: String): CommitmentConnection
  commitmentsInScope(first: Int, after: String, last: Int, before: String): CommitmentConnection
  intents(first: Int, after: String, last: Int, before: String): IntentConnection
  intentsAsProvider(first: Int, after: String, last: Int, before: String): IntentConnection
  intentsAsReceiver(first: Int, after: String, last: Int, before: String): IntentConnection
  intentsInScope(first: Int, after: String, last: Int, before: String): IntentConnection
  economicEvents(first: Int, after: String, last: Int, before: String): EconomicEventConnection
  economicEventsAsProvider(first: Int, after: String, last: Int, before: String): EconomicEventConnection
  economicEventsAsReceiver(first: Int, after: String, last: Int, before: String): EconomicEventConnection
  economicEventsInScope(first: Int, after: String, last: Int, before: String): EconomicEventConnection
  inventoriedEconomicResources(first: Int, after: String, last: Int, before: String): EconomicResourceConnection
  plans(first: Int, after: String, last: Int, before: String): PlanConnection
  processes(first: Int, after: String, last: Int, before: String): ProcessConnection
  proposals(first: Int, after: String, last: Int, before: String): ProposalConnection
  proposalsInScope(first: Int, after: String, last: Int, before: String): ProposalConnection
  proposalsTo(first: Int, after: String, last: Int, before: String): ProposalConnection
  revision(revisionId: ID!): Agent
  meta: RecordMeta!
}

"""A natural person."""
type Person implements Agent {
  id: ID!
  revisionId: ID!

  """The name that this agent will be referred to by."""
  name: String!

  """
  The uri to an image relevant to the agent, such as a logo, avatar, photo, etc.
  """
  image: URI

  """A textual description or comment."""
  note: String
  relationships(first: Int, after: String, last: Int, before: String): AgentRelationshipConnection
  relationshipsAsSubject(first: Int, after: String, last: Int, before: String): AgentRelationshipConnection
  relationshipsAsObject(first: Int, after: String, last: Int, before: String): AgentRelationshipConnection
  roles: [AgentRelationshipRole!]
  commitments(first: Int, after: String, last: Int, before: String): CommitmentConnection
  commitmentsAsProvider(first: Int, after: String, last: Int, before: String): CommitmentConnection
  commitmentsAsReceiver(first: Int, after: String, last: Int, before: String): CommitmentConnection
  commitmentsInScope(first: Int, after: String, last: Int, before: String): CommitmentConnection
  intents(first: Int, after: String, last: Int, before: String): IntentConnection
  intentsAsProvider(first: Int, after: String, last: Int, before: String): IntentConnection
  intentsAsReceiver(first: Int, after: String, last: Int, before: String): IntentConnection
  intentsInScope(first: Int, after: String, last: Int, before: String): IntentConnection
  economicEvents(first: Int, after: String, last: Int, before: String): EconomicEventConnection
  economicEventsAsProvider(first: Int, after: String, last: Int, before: String): EconomicEventConnection
  economicEventsAsReceiver(first: Int, after: String, last: Int, before: String): EconomicEventConnection
  economicEventsInScope(first: Int, after: String, last: Int, before: String): EconomicEventConnection
  inventoriedEconomicResources(first: Int, after: String, last: Int, before: String): EconomicResourceConnection
  plans(first: Int, after: String, last: Int, before: String): PlanConnection
  processes(first: Int, after: String, last: Int, before: String): ProcessConnection
  proposals(first: Int, after: String, last: Int, before: String): ProposalConnection
  proposalsInScope(first: Int, after: String, last: Int, before: String): ProposalConnection
  proposalsTo(first: Int, after: String, last: Int, before: String): ProposalConnection
  revision(revisionId: ID!): Person
  meta: RecordMeta!
}

"""A formal or informal group, or legal organization."""
type Organization implements Agent {
  id: ID!
  revisionId: ID!

  """The name that this agent will be referred to by."""
  name: String!

  """
  The uri to an image relevant to the agent, such as a logo, avatar, photo, etc.
  """
  image: URI

  """
  References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  classifiedAs: [URI!]

  """A textual description or comment."""
  note: String
  relationships(first: Int, after: String, last: Int, before: String): AgentRelationshipConnection
  relationshipsAsSubject(first: Int, after: String, last: Int, before: String): AgentRelationshipConnection
  relationshipsAsObject(first: Int, after: String, last: Int, before: String): AgentRelationshipConnection
  roles: [AgentRelationshipRole!]
  commitments(first: Int, after: String, last: Int, before: String): CommitmentConnection
  commitmentsAsProvider(first: Int, after: String, last: Int, before: String): CommitmentConnection
  commitmentsAsReceiver(first: Int, after: String, last: Int, before: String): CommitmentConnection
  commitmentsInScope(first: Int, after: String, last: Int, before: String): CommitmentConnection
  intents(first: Int, after: String, last: Int, before: String): IntentConnection
  intentsAsProvider(first: Int, after: String, last: Int, before: String): IntentConnection
  intentsAsReceiver(first: Int, after: String, last: Int, before: String): IntentConnection
  intentsInScope(first: Int, after: String, last: Int, before: String): IntentConnection
  economicEvents(first: Int, after: String, last: Int, before: String): EconomicEventConnection
  economicEventsAsProvider(first: Int, after: String, last: Int, before: String): EconomicEventConnection
  economicEventsAsReceiver(first: Int, after: String, last: Int, before: String): EconomicEventConnection
  economicEventsInScope(first: Int, after: String, last: Int, before: String): EconomicEventConnection
  inventoriedEconomicResources(first: Int, after: String, last: Int, before: String): EconomicResourceConnection
  plans(first: Int, after: String, last: Int, before: String): PlanConnection
  processes(first: Int, after: String, last: Int, before: String): ProcessConnection
  proposals(first: Int, after: String, last: Int, before: String): ProposalConnection
  proposalsInScope(first: Int, after: String, last: Int, before: String): ProposalConnection
  proposalsTo(first: Int, after: String, last: Int, before: String): ProposalConnection
  revision(revisionId: ID!): Organization
  meta: RecordMeta!
}

"""
The role of an economic relationship that exists between 2 agents, such as member, trading partner.
"""
type AgentRelationship {
  id: ID!
  revisionId: ID!

  """
  The subject of a relationship between 2 agents.  For example, if Mary is a member of a group, then Mary is the subject.
  """
  subject: Agent!

  """
  The object of a relationship between 2 agents.  For example, if Mary is a member of a group, then the group is the object.
  """
  object: Agent!

  """A kind of relationship that exists between 2 agents."""
  relationship: AgentRelationshipRole!

  """
  Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [AccountingScope!]

  """A textual description or comment."""
  note: String
  revision(revisionId: ID!): AgentRelationship
  meta: RecordMeta!
}

"""
A relationship role defining the kind of association one agent can have with another.
"""
type AgentRelationshipRole {
  id: ID!
  revisionId: ID!

  """The human readable name of the role, from the subject to the object."""
  roleLabel: String!

  """The human readable name of the role, from the object to the subject."""
  inverseRoleLabel: String

  """A textual description or comment."""
  note: String
  agentRelationships(first: Int, after: String, last: Int, before: String): AgentRelationshipConnection
  revision(revisionId: ID!): AgentRelationshipRole
  meta: RecordMeta!
}

input AgentCreateParams {
  """
  An informal or formal textual identifier for an agent. Does not imply uniqueness.
  """
  name: String!

  """
  The uri to an image relevant to the agent, such as a logo, avatar, photo, etc.
  """
  image: URI

  """A textual description or comment."""
  note: String
}

input AgentUpdateParams {
  revisionId: ID!

  """
  An informal or formal textual identifier for an agent. Does not imply uniqueness.
  """
  name: String

  """
  The uri to an image relevant to the agent, such as a logo, avatar, photo, etc.
  """
  image: URI

  """A textual description or comment."""
  note: String
}

input OrganizationCreateParams {
  """
  An informal or formal textual identifier for an agent. Does not imply uniqueness.
  """
  name: String!

  """
  The uri to an image relevant to the agent, such as a logo, avatar, photo, etc.
  """
  image: URI

  """
  References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  classifiedAs: [URI!]

  """A textual description or comment."""
  note: String
}

input OrganizationUpdateParams {
  revisionId: ID!

  """
  An informal or formal textual identifier for an agent. Does not imply uniqueness.
  """
  name: String

  """
  The uri to an image relevant to the agent, such as a logo, avatar, photo, etc.
  """
  image: URI

  """
  References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  classifiedAs: [URI!]

  """A textual description or comment."""
  note: String
}

type PersonResponse {
  agent: Person!
}

type OrganizationResponse {
  agent: Organization!
}

input AgentRelationshipCreateParams {
  """
  (`Agent`) The subject of a relationship between 2 agents.  For example, if Mary is a member of a group, then Mary is the subject.
  """
  subject: ID!

  """
  (`Agent`) The object of a relationship between 2 agents.  For example, if Mary is a member of a group, then the group is the object.
  """
  object: ID!

  """
  (`AgentRelationshipRole`) The role of an economic relationship that exists between 2 agents, such as member, trading partner.
  """
  relationship: ID!

  """
  (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [ID!]

  """A textual description or comment."""
  note: String
}

input AgentRelationshipUpdateParams {
  revisionId: ID!

  """
  (`Agent`) The subject of a relationship between 2 agents.  For example, if Mary is a member of a group, then Mary is the subject.
  """
  subject: ID

  """
  (`Agent`) The object of a relationship between 2 agents.  For example, if Mary is a member of a group, then the group is the object.
  """
  object: ID

  """
  (`AgentRelationshipRole`) The role of an economic relationship that exists between 2 agents, such as member, trading partner.
  """
  relationship: ID

  """
  (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [ID!]

  """A textual description or comment."""
  note: String
}

type AgentRelationshipResponse {
  agentRelationship: AgentRelationship!
}

input AgentRelationshipRoleCreateParams {
  """
  The human readable name of the role, inverse from the object to the subject. For example, 'is member of'.
  """
  roleLabel: String!

  """
  The human readable name of the role, inverse from the object to the subject. For example, 'has member'.
  """
  inverseRoleLabel: String

  """A textual description or comment."""
  note: String
}

input AgentRelationshipRoleUpdateParams {
  revisionId: ID!

  """
  The human readable name of the role, inverse from the object to the subject. For example, 'is member of'.
  """
  roleLabel: String

  """
  The human readable name of the role, inverse from the object to the subject. For example, 'has member'.
  """
  inverseRoleLabel: String

  """A textual description or comment."""
  note: String
}

type AgentRelationshipRoleResponse {
  agentRelationshipRole: AgentRelationshipRole
}

type AgentConnection {
  edges: [AgentEdge!]!
  pageInfo: PageInfo!
}

type AgentEdge {
  node: Agent!
  cursor: String!
}

type PersonConnection {
  edges: [PersonEdge!]!
  pageInfo: PageInfo!
}

type PersonEdge {
  node: Person!
  cursor: String!
}

type OrganizationConnection {
  edges: [OrganizationEdge!]!
  pageInfo: PageInfo!
}

type OrganizationEdge {
  node: Organization!
  cursor: String!
}

type AgentRelationshipConnection {
  edges: [AgentRelationshipEdge!]!
  pageInfo: PageInfo!
}

type AgentRelationshipEdge {
  node: AgentRelationship!
  cursor: String!
}

type AgentRelationshipRoleConnection {
  edges: [AgentRelationshipRoleEdge!]!
  pageInfo: PageInfo!
}

type AgentRelationshipRoleEdge {
  node: AgentRelationshipRole!
  cursor: String!
}

type Mutation {
  """Registers a new (human) person with the collaboration space"""
  createPerson(person: AgentCreateParams!): PersonResponse!

  """Update profile details"""
  updatePerson(person: AgentUpdateParams!): PersonResponse!

  """
  Erase record of a person and thus remove them from the collaboration space
  """
  deletePerson(revisionId: ID!): Boolean!

  """
  Registers a new organization (group agent) with the collaboration space
  """
  createOrganization(organization: OrganizationCreateParams!): OrganizationResponse!

  """Update organization profile details"""
  updateOrganization(organization: OrganizationUpdateParams!): OrganizationResponse!

  """
  Erase record of an organization and thus remove it from the collaboration space
  """
  deleteOrganization(revisionId: ID!): Boolean!
  createAgentRelationship(relationship: AgentRelationshipCreateParams!): AgentRelationshipResponse!
  updateAgentRelationship(relationship: AgentRelationshipUpdateParams!): AgentRelationshipResponse!
  deleteAgentRelationship(revisionId: ID!): Boolean!
  createAgentRelationshipRole(agentRelationshipRole: AgentRelationshipRoleCreateParams!): AgentRelationshipRoleResponse!
  updateAgentRelationshipRole(agentRelationshipRole: AgentRelationshipRoleUpdateParams!): AgentRelationshipRoleResponse!
  deleteAgentRelationshipRole(revisionId: ID!): Boolean!
  createAgreement(agreement: AgreementCreateParams): AgreementResponse!
  updateAgreement(agreement: AgreementUpdateParams): AgreementResponse!
  deleteAgreement(revisionId: ID!): Boolean!
  createCommitment(commitment: CommitmentCreateParams!): CommitmentResponse!
  updateCommitment(commitment: CommitmentUpdateParams!): CommitmentResponse!
  deleteCommitment(revisionId: ID!): Boolean!
  createIntent(intent: IntentCreateParams!): IntentResponse!
  updateIntent(intent: IntentUpdateParams!): IntentResponse!
  deleteIntent(revisionId: ID!): Boolean!
  createUnit(unit: UnitCreateParams!): UnitResponse!
  updateUnit(unit: UnitUpdateParams!): UnitResponse!
  deleteUnit(revisionId: ID!): Boolean!

  """
  Registers a new (`EconomicEvent`) with the collaboration space. Also serves as a means to register (`EconomicResource`) as well, instead of createEconomicResource
  """
  createEconomicEvent(event: EconomicEventCreateParams!, newInventoriedResource: EconomicResourceCreateParams): EconomicEventResponse!
  updateEconomicEvent(event: EconomicEventUpdateParams!): EconomicEventResponse!
  updateEconomicResource(resource: EconomicResourceUpdateParams!): EconomicResourceResponse!
  createPlan(plan: PlanCreateParams!): PlanResponse!
  updatePlan(plan: PlanUpdateParams!): PlanResponse!
  deletePlan(revisionId: ID!): Boolean!
  createProcess(process: ProcessCreateParams!): ProcessResponse!
  updateProcess(process: ProcessUpdateParams!): ProcessResponse!
  deleteProcess(id: ID!): Boolean!
  createProcessSpecification(processSpecification: ProcessSpecificationCreateParams!): ProcessSpecificationResponse!
  updateProcessSpecification(processSpecification: ProcessSpecificationUpdateParams!): ProcessSpecificationResponse!
  deleteProcessSpecification(revisionId: ID!): Boolean!
  createProposal(proposal: ProposalCreateParams!): ProposalResponse!
  updateProposal(proposal: ProposalUpdateParams!): ProposalResponse!
  deleteProposal(revisionId: ID!): Boolean!
  createRecipeFlow(recipeFlow: RecipeFlowCreateParams!): RecipeFlowResponse!
  updateRecipeFlow(recipeFlow: RecipeFlowUpdateParams!): RecipeFlowResponse!
  deleteRecipeFlow(revisionId: ID!): Boolean!
  createRecipeProcess(recipeProcess: RecipeProcessCreateParams!): RecipeProcessResponse!
  updateRecipeProcess(recipeProcess: RecipeProcessUpdateParams!): RecipeProcessResponse!
  deleteRecipeProcess(revisionId: ID!): Boolean!
  createRecipeExchange(recipeExchange: RecipeExchangeCreateParams!): RecipeExchangeResponse!
  updateRecipeExchange(recipeExchange: RecipeExchangeUpdateParams!): RecipeExchangeResponse!
  deleteRecipeExchange(revisionId: ID!): Boolean!
  createResourceSpecification(resourceSpecification: ResourceSpecificationCreateParams!): ResourceSpecificationResponse!
  updateResourceSpecification(resourceSpecification: ResourceSpecificationUpdateParams!): ResourceSpecificationResponse!
  deleteResourceSpecification(revisionId: ID!): Boolean!
}

"""Any type of agreement among economic agents."""
type Agreement {
  id: ID!
  revisionId: ID!

  """
  An informal or formal textual identifier for an agreement. Does not imply uniqueness.
  """
  name: String

  """The date and time the agreement was created."""
  created: DateTime

  """A textual description or comment."""
  note: String
  involvedAgents(first: Int, after: String, last: Int, before: String): AgentConnection
  commitments: [Commitment!]
  revision(revisionId: ID!): Agreement
  meta: RecordMeta!
  economicEvents: [EconomicEvent!]
  unplannedEconomicEvents: [EconomicEvent!]
}

input AgreementCreateParams {
  """
  An informal or formal textual identifier for an agreement. Does not imply uniqueness.
  """
  name: String

  """The date and time the agreement was created."""
  created: DateTime

  """A textual description or comment."""
  note: String
}

input AgreementUpdateParams {
  revisionId: ID!

  """
  An informal or formal textual identifier for an agreement. Does not imply uniqueness.
  """
  name: String

  """The date and time the agreement was created."""
  created: DateTime

  """A textual description or comment."""
  note: String
}

type AgreementResponse {
  agreement: Agreement!
}

type AgreementConnection {
  edges: [AgreementEdge!]!
  pageInfo: PageInfo!
}

type AgreementEdge {
  node: Agreement!
  cursor: String!
}

"""
A planned economic flow that has been promised by an agent to another agent.
"""
type Commitment {
  id: ID!
  revisionId: ID!

  """
  Relates a commitment to a verb, such as consume, produce, work, improve, etc.
  """
  action: Action!

  """
  References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  resourceClassifiedAs: [URI!]

  """The amount and unit of the economic resource counted or inventoried."""
  resourceQuantity: Measure

  """
  The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness.
  """
  effortQuantity: Measure

  """The planned beginning of the commitment."""
  hasBeginning: DateTime

  """The planned end of the commitment."""
  hasEnd: DateTime

  """
  The planned date/time for the commitment. Can be used instead of beginning and end.
  """
  hasPointInTime: DateTime

  """The time something is expected to be complete."""
  due: DateTime

  """The creation time of the commitment."""
  created: DateTime

  """
  The commitment is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done.
  """
  finished: Boolean

  """A textual description or comment."""
  note: String

  """
  Reference to an agreement between agents which specifies the rules or policies or calculations which govern this commitment.
  """
  agreedIn: URI

  """The commitment can be safely deleted, has no dependent information."""
  deletable: Boolean

  """The intent which this commitment satisfies."""
  satisfies: Intent

  """The economic agent from whom the commitment is initiated."""
  provider: Agent!

  """The economic agent whom the commitment is for."""
  receiver: Agent!

  """
  Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [AccountingScope!]
  involvedAgents: [Agent!]

  """This commitment is part of the exchange agreement."""
  clauseOf: Agreement

  """Exact economic resource involved in the commitment."""
  resourceInventoriedAs: EconomicResource
  fulfilledBy: [EconomicEvent!]

  """Represents a desired deliverable expected from this plan."""
  independentDemandOf: Plan

  """The transfer commitment is part of the plan."""
  plannedWithin: Plan

  """
  References the ProcessSpecification of the last process the economic resource went through. Stage is used when the last process is important for finding proper resources, such as where the publishing process wants only documents that have gone through the editing process.
  """
  stage: ProcessSpecification

  """
  The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is.
  """
  resourceConformsTo: ResourceSpecification
  revision(revisionId: ID!): Commitment
  meta: RecordMeta!

  """Defines the process to which this commitment is an input."""
  inputOf: Process

  """Defines the process for which this commitment is an output."""
  outputOf: Process
}

input CommitmentCreateParams {
  """
  (`Action`) Relates a commitment to a verb, such as consume, produce, work, improve, etc.
  """
  action: ID!

  """
  References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  resourceClassifiedAs: [URI!]

  """The amount and unit of the economic resource counted or inventoried."""
  resourceQuantity: IMeasure

  """
  The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness.
  """
  effortQuantity: IMeasure

  """The planned beginning of the commitment."""
  hasBeginning: DateTime

  """The planned end of the commitment."""
  hasEnd: DateTime

  """
  The planned date/time for the commitment. Can be used instead of beginning and end.
  """
  hasPointInTime: DateTime

  """The time something is expected to be complete."""
  due: DateTime

  """
  The commitment is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done.
  """
  finished: Boolean

  """A textual description or comment."""
  note: String

  """
  Reference to an agreement between agents which specifies the rules or policies or calculations which govern this commitment.
  """
  agreedIn: URI

  """The intent which this commitment satisfies."""
  satisfies: ID

  """(`Agent`) The economic agent from whom the commitment is initiated."""
  provider: ID!

  """(`Agent`) The economic agent whom the commitment is for."""
  receiver: ID!

  """
  (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [ID!]

  """(`Agreement`) This commitment is part of the agreement."""
  clauseOf: ID

  """
  (`EconomicResource`) Exact economic resource involved in the commitment.
  """
  resourceInventoriedAs: ID

  """(`Plan`) Represents a desired deliverable expected from this plan."""
  independentDemandOf: ID

  """(`Plan`) The transfer commitment is part of the plan."""
  plannedWithin: ID

  """The process stage of the commitment."""
  stage: URI

  """
  (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is.
  """
  resourceConformsTo: ID

  """(`Process`) Defines the process to which this commitment is an input."""
  inputOf: ID

  """
  (`Process`) Defines the process for which this commitment is an output.
  """
  outputOf: ID
}

input CommitmentUpdateParams {
  revisionId: ID!

  """
  References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  resourceClassifiedAs: [URI!]

  """The amount and unit of the economic resource counted or inventoried."""
  resourceQuantity: IMeasure

  """
  The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness.
  """
  effortQuantity: IMeasure

  """The planned beginning of the commitment."""
  hasBeginning: DateTime

  """The planned end of the commitment."""
  hasEnd: DateTime

  """
  The planned date/time for the commitment. Can be used instead of beginning and end.
  """
  hasPointInTime: DateTime

  """The time something is expected to be complete."""
  due: DateTime

  """
  The commitment is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done.
  """
  finished: Boolean

  """A textual description or comment."""
  note: String

  """
  Reference to an agreement between agents which specifies the rules or policies or calculations which govern this commitment.
  """
  agreedIn: URI

  """The intent which this commitment satisfies."""
  satisfies: ID

  """(`Agent`) The economic agent from whom the commitment is initiated."""
  provider: ID

  """(`Agent`) The economic agent whom the commitment is for."""
  receiver: ID

  """
  (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [ID!]

  """(`Agreement`) This commitment is part of the agreement."""
  clauseOf: ID

  """
  (`EconomicResource`) Exact economic resource involved in the commitment.
  """
  resourceInventoriedAs: ID

  """(`Plan`) Represents a desired deliverable expected from this plan."""
  independentDemandOf: ID

  """(`Plan`) The transfer commitment is part of the plan."""
  plannedWithin: ID

  """The process stage of the commitment."""
  stage: URI

  """
  (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is.
  """
  resourceConformsTo: ID

  """(`Process`) Defines the process to which this commitment is an input."""
  inputOf: ID

  """
  (`Process`) Defines the process for which this commitment is an output.
  """
  outputOf: ID
}

type CommitmentResponse {
  commitment: Commitment!
}

type CommitmentConnection {
  edges: [CommitmentEdge!]!
  pageInfo: PageInfo!
}

type CommitmentEdge {
  node: Commitment!
  cursor: String!
}

type RecordMeta {
  """
  Metadata about the previous revision of this record, queryable via `revision(previousRevision.id)`. If this is the first revision of a record, this field is empty.
  """
  previousRevision: Revision

  """Number of older revisions, if known."""
  previousRevisionsCount: Int

  """Number of newer revisions, if known."""
  futureRevisionsCount: Int

  """
  Metadata regarding the most recent revision of this record, if able to be determined.
  """
  latestRevision: Revision

  """
  Metadata regarding the requested revision of this record. A record's `retrievedRevision.id` == `revisionId`.
  """
  retrievedRevision: Revision!
}

type Revision {
  """
  ID of the revision, used to query a specific version of the related record.
  """
  id: ID!

  """Time this revision was created, if known."""
  time: DateTime

  """The authoring `Agent` who created this revision."""
  author: Agent
}

"""
A planned economic flow which has not been committed to, which can lead to economic events (sometimes through commitments).
"""
type Intent {
  id: ID!
  revisionId: ID!

  """
  An informal or formal textual identifier for an intent. Does not imply uniqueness.
  """
  name: String

  """
  Relates an intent to a verb, such as consume, produce, work, improve, etc.
  """
  action: Action!

  """
  References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  resourceClassifiedAs: [URI!]

  """
  The amount and unit of the economic resource counted or inventoried. This is the quantity that could be used to increment or decrement a resource, depending on the type of resource and resource effect of action.
  """
  resourceQuantity: Measure

  """
  The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness.
  """
  effortQuantity: Measure

  """The total quantity of the offered resource available."""
  availableQuantity: Measure

  """Minimum quantity of the offered resource available."""
  minimumQuantity: Measure

  """The planned beginning of the intent."""
  hasBeginning: DateTime

  """The planned end of the intent."""
  hasEnd: DateTime

  """
  The planned date/time for the intent. Can be used instead of beginning and end.
  """
  hasPointInTime: DateTime

  """The time something is expected to be complete."""
  due: DateTime

  """
  The intent is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done.
  """
  finished: Boolean

  """The uri to an image relevant to the intent, such as a photo."""
  image: URI

  """URI addresses to images relevant to the intent."""
  imageList: [URI!]

  """A textual description or comment."""
  note: String

  """
  Reference to an agreement between agents which specifies the rules or policies or calculations which govern this intent.
  """
  agreedIn: URI

  """The intent can be safely deleted, has no dependent information."""
  deletable: Boolean

  """
  The economic agent from whom the intent is initiated. This implies that the intent is an offer.
  """
  provider: Agent

  """
  The economic agent whom the intent is for.  This implies that the intent is a request.
  """
  receiver: Agent

  """
  Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [AccountingScope!]
  revision(revisionId: ID!): Intent
  meta: RecordMeta!
  satisfiedBy: [Commitment!]

  """
  When a specific `EconomicResource` is known which can service the `Intent`, this defines that resource.
  """
  resourceInventoriedAs: EconomicResource
  observedBy: [EconomicEvent!]
  publishedIn: [Proposal!]

  """
  The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is.
  """
  resourceConformsTo: ResourceSpecification

  """Defines the process to which this intent is an input."""
  inputOf: Process

  """Defines the process to which this intent is an output."""
  outputOf: Process
}

input IntentCreateParams {
  """
  (`Action`) Relates an intent to a verb, such as consume, produce, work, improve, etc.
  """
  action: ID!

  """
  An informal or formal textual identifier for an intent. Does not imply uniqueness.
  """
  name: String

  """
  References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  resourceClassifiedAs: [URI!]

  """
  The amount and unit of the economic resource counted or inventoried. This is the quantity that could be used to increment or decrement a resource, depending on the type of resource and resource effect of action.
  """
  resourceQuantity: IMeasure

  """
  The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness.
  """
  effortQuantity: IMeasure

  """The total quantity of the offered resource available."""
  availableQuantity: IMeasure

  """The planned beginning of the intent."""
  hasBeginning: DateTime

  """The planned end of the intent."""
  hasEnd: DateTime

  """
  The planned date/time for the intent. Can be used instead of beginning and end.
  """
  hasPointInTime: DateTime

  """The time something is expected to be complete."""
  due: DateTime

  """The uri to an image relevant to the intent, such as a photo."""
  image: URI

  """URI addresses to images relevant to the intent."""
  imageList: [URI!]

  """A textual description or comment."""
  note: String

  """
  Reference to an agreement between agents which specifies the rules or policies or calculations which govern this intent.
  """
  agreedIn: URI

  """
  The intent is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done.
  """
  finished: Boolean

  """
  (`Agent`) The economic agent from whom the intent is initiated. This implies that the intent is an offer.
  """
  provider: ID

  """
  (`Agent`) The economic agent whom the intent is for.  This implies that the intent is a request.
  """
  receiver: ID

  """
  (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [ID!]

  """
  (`EconomicResource`) When a specific `EconomicResource` is known which can service the `Intent`, this defines that resource.
  """
  resourceInventoriedAs: ID

  """
  (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is.
  """
  resourceConformsTo: ID

  """(`Process`) Defines the process to which this intent is an input."""
  inputOf: ID

  """(`Process`) Defines the process to which this intent is an output."""
  outputOf: ID
}

input IntentUpdateParams {
  revisionId: ID!

  """
  An informal or formal textual identifier for an intent. Does not imply uniqueness.
  """
  name: String

  """
  (`Action`) Relates an intent to a verb, such as consume, produce, work, improve, etc.
  """
  action: ID

  """
  References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  resourceClassifiedAs: [URI!]

  """
  The amount and unit of the economic resource counted or inventoried. This is the quantity that could be used to increment or decrement a resource, depending on the type of resource and resource effect of action.
  """
  resourceQuantity: IMeasure

  """
  The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness.
  """
  effortQuantity: IMeasure

  """The total quantity of the offered resource available."""
  availableQuantity: IMeasure

  """The planned beginning of the intent."""
  hasBeginning: DateTime

  """The planned end of the intent."""
  hasEnd: DateTime

  """
  The planned date/time for the intent. Can be used instead of beginning and end.
  """
  hasPointInTime: DateTime

  """The time something is expected to be complete."""
  due: DateTime

  """The uri to an image relevant to the intent, such as a photo."""
  image: URI

  """URI addresses to images relevant to the intent."""
  imageList: [URI!]

  """
  The intent is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done.
  """
  finished: Boolean

  """A textual description or comment."""
  note: String

  """
  Reference to an agreement between agents which specifies the rules or policies or calculations which govern this intent.
  """
  agreedIn: URI

  """
  (`Agent`) The economic agent from whom the intent is initiated. This implies that the intent is an offer.
  """
  provider: ID

  """
  (`Agent`) The economic agent whom the intent is for.  This implies that the intent is a request.
  """
  receiver: ID

  """
  (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [ID!]

  """
  (`EconomicResource`) When a specific `EconomicResource` is known which can service the `Intent`, this defines that resource.
  """
  resourceInventoriedAs: ID

  """
  (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is.
  """
  resourceConformsTo: ID

  """(`Process`) Defines the process to which this intent is an input."""
  inputOf: ID

  """(`Process`) Defines the process to which this intent is an output."""
  outputOf: ID
}

type IntentResponse {
  intent: Intent!
}

type IntentConnection {
  edges: [IntentEdge!]!
  pageInfo: PageInfo!
}

type IntentEdge {
  node: Intent!
  cursor: String!
}

"""Defines the unit of time measured in a temporal `Duration`."""
enum TimeUnit {
  year
  month
  week
  day
  hour
  minute
  second
}

"""A `Duration` represents an interval between two `DateTime` values."""
type Duration {
  """A number representing the duration, will be paired with a unit."""
  numericDuration: Decimal!

  """A unit of measure."""
  unitType: TimeUnit!
}

"""Mutation input structure for defining time durations."""
input IDuration {
  """A number representing the duration, will be paired with a unit."""
  numericDuration: Decimal!

  """A unit of measure."""
  unitType: TimeUnit!
}

"""
Defines a unit of measurement, along with its display symbol.
From OM2 vocabulary.
"""
type Unit {
  id: ID!
  revisionId: ID!

  """A human readable label for the unit, can be language specific."""
  label: String!

  """A standard display symbol for a unit of measure."""
  symbol: String!

  """The OM2 identifier for the unit."""
  omUnitIdentifier: String!

  """Arbitrary classification for the unit."""
  classifiedAs: String
  revision(revisionId: ID!): Unit
  meta: RecordMeta!
}

"""
Semantic meaning for measurements: binds a quantity to its measurement unit.
See http://www.qudt.org/pages/QUDToverviewPage.html
"""
type Measure {
  """A number representing the quantity, will be paired with a unit."""
  hasNumericalValue: Decimal!

  """A unit of measure."""
  hasUnit: Unit
}

"""
Mutation input structure for defining measurements. Should be nulled if not present, rather than empty.
"""
input IMeasure {
  """A number representing the quantity, will be paired with a unit."""
  hasNumericalValue: Decimal!

  """(`Unit`) A unit of measure."""
  hasUnit: ID
}

input UnitCreateParams {
  """A human readable label for the unit, can be language specific."""
  label: String!

  """A standard display symbol for a unit of measure."""
  symbol: String!

  """The OM2 identifier for the unit."""
  omUnitIdentifier: String!

  """
  References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  classifiedAs: [URI!]
}

input UnitUpdateParams {
  revisionId: ID!

  """A human readable label for the unit, can be language specific."""
  label: String

  """A standard display symbol for a unit of measure."""
  symbol: String

  """The OM2 identifier for the unit."""
  omUnitIdentifier: String

  """
  References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  classifiedAs: [URI!]
}

type UnitResponse {
  unit: Unit!
}

type UnitConnection {
  edges: [UnitEdge!]!
  pageInfo: PageInfo!
}

type UnitEdge {
  node: Unit!
  cursor: String!
}

union TrackTraceItem = EconomicResource | EconomicEvent | Process

union ProductionFlowItem = EconomicResource | Process

"""
An observed economic flow, as opposed to a flow planned to happen in the future. This could reflect a change in the quantity of an economic resource. It is also defined by its behavior in relation to the economic resource (see `Action`)
"""
type EconomicEvent {
  id: ID!
  revisionId: ID!

  """
  Relates an economic event to a verb, such as consume, produce, work, improve, etc.
  """
  action: Action!

  """Economic resource involved in the economic event."""
  resourceInventoriedAs: EconomicResource

  """
  Additional economic resource on the economic event when needed by the receiver. Used when a transfer or move, or sometimes other actions, requires explicitly identifying an economic resource on the receiving side.
  """
  toResourceInventoriedAs: EconomicResource

  """
  References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  resourceClassifiedAs: [URI!]

  """
  The amount and unit of the economic resource counted or inventoried. This is the quantity that could be used to increment or decrement a resource, depending on the type of resource and resource effect of action.
  """
  resourceQuantity: Measure

  """
  The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness.
  """
  effortQuantity: Measure

  """The beginning of the economic event."""
  hasBeginning: DateTime

  """The end of the economic event."""
  hasEnd: DateTime

  """
  The date/time at which the economic event occurred. Can be used instead of beginning and end.
  """
  hasPointInTime: DateTime

  """A textual description or comment."""
  note: String

  """
  Reference to an agreement between agents which specifies the rules or policies or calculations which govern this economic event.
  """
  agreedIn: URI

  """
  References another economic event that implied this economic event, often based on a prior agreement.
  """
  triggeredBy: EconomicEvent

  """The intent this economic event satisfies."""
  satisfies: [Intent!]

  """The commitment this economic event fulfills."""
  fulfills: [Commitment!]

  """The economic event that this economic event corrects."""
  corrects: EconomicEvent

  """
  The economic event can be safely deleted, has no dependent information.
  """
  deletable: Boolean

  """Other EconomicEvents which have been triggered by this one."""
  triggers: [EconomicEvent!]
  previous: [ProductionFlowItem!]
  next: [ProductionFlowItem!]
  track: [TrackTraceItem!]
  trace: [TrackTraceItem!]

  """The economic agent from whom the actual economic event is initiated."""
  provider: Agent!

  """The economic agent whom the actual economic event is for."""
  receiver: Agent!

  """
  Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [AccountingScope!]
  revision(revisionId: ID!): EconomicEvent
  meta: RecordMeta!

  """This economic event occurs as part of this agreement."""
  realizationOf: Agreement

  """Defines the process to which this event is an input."""
  inputOf: Process

  """Defines the process for which this event is an output."""
  outputOf: Process

  """
  The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is.
  """
  resourceConformsTo: ResourceSpecification
}

"""A resource which is useful to people or the ecosystem."""
type EconomicResource {
  id: ID!
  revisionId: ID!

  """
  An informal or formal textual identifier for an item. Does not imply uniqueness.
  """
  name: String

  """
  References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  classifiedAs: [URI!]

  """
  Sometimes called serial number, used when each item must have a traceable identifier (like a computer). Could also be used for other unique tracking identifiers needed for resources.
  """
  trackingIdentifier: String

  """
  The uri to an image relevant to the resource, such as a photo, diagram, etc.
  """
  image: URI

  """URI addresses to images relevant to the resource."""
  imageList: [URI!]

  """
  The current amount and unit of the economic resource for which the agent has primary rights and responsibilities, sometimes thought of as ownership. This can be either stored or derived from economic events affecting the resource.
  """
  accountingQuantity: Measure

  """
  The current amount and unit of the economic resource which is under direct control of the agent.  It may be more or less than the accounting quantity. This can be either stored or derived from economic events affecting the resource.
  """
  onhandQuantity: Measure

  """A textual description or comment."""
  note: String

  """The unit used for use or work or cite actions for this resource."""
  unitOfEffort: Unit

  """
  The state of the desired economic resource (pass or fail), after coming out of a test or review process. Can be derived from the last event if a pass or fail event.
  """
  state: Action

  """
  Used when a stock economic resource contains items also defined as economic resources.
  """
  containedIn: EconomicResource

  """
  Used when a stock economic resource contains units also defined as economic resources.
  """
  contains: [EconomicResource!]

  """
  All economic events with the economic resource in the resourceInventoriedAs, including all process related events, the provider resource in transfers/moves, and raise/lower.
  """
  economicEventsInOutFrom(first: Int, after: String, last: Int, before: String): EconomicEventConnection

  """
  All economic events with the economic Resource in the toResourceInventoriedAs, which is the receiver resource in transfers and moves.
  """
  economicEventsTo(first: Int, after: String, last: Int, before: String): EconomicEventConnection
  previous: [EconomicEvent!]
  next: [EconomicEvent!]
  track: [TrackTraceItem!]
  trace: [TrackTraceItem!]

  """
  The agent currently with primary rights and responsibilites for the economic resource. It is the agent that is associated with the accountingQuantity of the economic resource.
  """
  primaryAccountable: Agent
  commitments(first: Int, after: String, last: Int, before: String): CommitmentConnection
  revision(revisionId: ID!): EconomicResource
  meta: RecordMeta!
  intents(first: Int, after: String, last: Int, before: String): IntentConnection

  """
  References the ProcessSpecification of the last process the desired economic resource went through. Stage is used when the last process is important for finding proper resources, such as where the publishing process wants only documents that have gone through the editing process.
  """
  stage: ProcessSpecification

  """
  The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is.
  """
  conformsTo: ResourceSpecification!
}

input EconomicEventCreateParams {
  """
  (`Action`) Relates an economic event to a verb, such as consume, produce, work, improve, etc.
  """
  action: ID!

  """(`EconomicResource`) Economic resource involved in the economic event."""
  resourceInventoriedAs: ID

  """
  References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  resourceClassifiedAs: [URI!]

  """
  The amount and unit of the economic resource counted or inventoried. This is the quantity that could be used to increment or decrement a resource, depending on the type of resource and resource effect of action.
  """
  resourceQuantity: IMeasure

  """
  The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness.
  """
  effortQuantity: IMeasure

  """The beginning of the economic event."""
  hasBeginning: DateTime

  """The end of the economic event."""
  hasEnd: DateTime

  """
  The date/time at which the economic event occurred. Can be used instead of beginning and end.
  """
  hasPointInTime: DateTime

  """A textual description or comment."""
  note: String

  """
  Reference to an agreement between agents which specifies the rules or policies or calculations which govern this economic event.
  """
  agreedIn: URI

  """
  (`EconomicEvent`) References another economic event that implied this economic event, often based on a prior agreement.
  """
  triggeredBy: ID

  """
  (`EconomicResource`) Additional economic resource on the economic event when needed by the receiver. Used when a transfer or move, or sometimes other actions, requires explicitly identifying an economic resource on the receiving side.
  """
  toResourceInventoriedAs: ID

  """The intent this economic event satisfies."""
  satisfies: [ID!]

  """The commitment this economic event fulfills."""
  fulfills: [ID!]

  """
  (`Agent`) The economic agent from whom the actual economic event is initiated.
  """
  provider: ID!

  """(`Agent`) The economic agent whom the actual economic event is for."""
  receiver: ID!

  """(`Agreement`) This economic event occurs as part of this agreement."""
  realizationOf: ID

  """(`Process`) Defines the process to which this event is an input."""
  inputOf: ID

  """(`Process`) Defines the process for which this event is an output."""
  outputOf: ID

  """
  (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is.
  """
  resourceConformsTo: ID
}

input EconomicEventUpdateParams {
  revisionId: ID!

  """A textual description or comment."""
  note: String

  """
  Reference to an agreement between agents which specifies the rules or policies or calculations which govern this economic event.
  """
  agreedIn: URI

  """
  (`EconomicEvent`) References another economic event that implied this economic event, often based on a prior agreement.
  """
  triggeredBy: ID

  """(`Agreement`) This economic event occurs as part of this agreement."""
  realizationOf: ID
}

type EconomicEventResponse {
  """Details of the newly created event."""
  economicEvent: EconomicEvent!

  """
  Details of any newly created `EconomicResource`, for events that create new resources.
  """
  economicResource: EconomicResource
}

"""
Input `EconomicResource` type used when sending events to setup initial resource recordings
"""
input EconomicResourceCreateParams {
  """
  An informal or formal textual identifier for an item. Does not imply uniqueness.
  """
  name: String

  """
  Sometimes called serial number, used when each item must have a traceable identifier (like a computer). Could also be used for other unique tracking identifiers needed for resources.
  """
  trackingIdentifier: String

  """
  The uri to an image relevant to the resource, such as a photo, diagram, etc.
  """
  image: URI

  """URI addresses to images relevant to the resource."""
  imageList: [URI!]

  """
  (`EconomicResource`) Used when a stock economic resource contains items also defined as economic resources.
  """
  containedIn: ID

  """A textual description or comment."""
  note: String

  """
  (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is.
  """
  conformsTo: ID
}

input EconomicResourceUpdateParams {
  revisionId: ID!

  """
  References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  classifiedAs: [URI!]

  """
  The uri to an image relevant to the resource, such as a photo, diagram, etc.
  """
  image: URI

  """URI addresses to images relevant to the resource."""
  imageList: [URI!]

  """
  (`EconomicResource`) Used when a stock economic resource contains items also defined as economic resources.
  """
  containedIn: ID

  """
  (`Unit`) The unit used for use or work or cite actions for this resource.
  """
  unitOfEffort: ID

  """A textual description or comment."""
  note: String
}

type EconomicResourceResponse {
  economicResource: EconomicResource!
}

type EconomicEventConnection {
  edges: [EconomicEventEdge!]!
  pageInfo: PageInfo!
}

type EconomicEventEdge {
  node: EconomicEvent!
  cursor: String!
}

type EconomicResourceConnection {
  edges: [EconomicResourceEdge!]!
  pageInfo: PageInfo!
}

type EconomicResourceEdge {
  node: EconomicResource!
  cursor: String!
}

"""Cursors for pagination"""
type PageInfo {
  """
  Cursor pointing to the first of the results returned, to be used with `before` query parameter if the backend supports reverse pagination.
  """
  startCursor: String

  """
  Cursor pointing to the last of the results returned, to be used with `after` query parameter if the backend supports forward pagination.
  """
  endCursor: String

  """
  True if there are more results before `startCursor`. If unable to be determined, implementations should return `true` to allow for requerying.
  """
  hasPreviousPage: Boolean!

  """
  True if there are more results after `endCursor`. If unable to be determined, implementations should return `true` to allow for requerying.
  """
  hasNextPage: Boolean!

  """The total result count, if it can be determined."""
  totalCount: Int

  """
  The number of items requested per page. Allows the storage backend to indicate this when it is responsible for setting a default and the client does not provide it. Note this may be different to the number of items returned, if there is less than 1 page of results.
  """
  pageLimit: Int
}

"""
A logical collection of processes that constitute a body of planned work with defined deliverable(s).
"""
type Plan {
  id: ID!
  revisionId: ID!

  """
  An informal or formal textual identifier for a plan. Does not imply uniqueness.
  """
  name: String!

  """The time the plan was made."""
  created: DateTime

  """The time the plan is expected to be complete."""
  due: DateTime

  """A textual description or comment."""
  note: String

  """The plan is able to be deleted or not."""
  deletable: Boolean

  """
  Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [AccountingScope!]
  involvedAgents(first: Int, after: String, last: Int, before: String): AgentConnection
  independentDemands: [Commitment!]
  nonProcessCommitments: [Commitment!]
  revision(revisionId: ID!): Plan
  meta: RecordMeta!
  processes: [Process!]
}

input PlanCreateParams {
  """
  An informal or formal textual identifier for a plan. Does not imply uniqueness.
  """
  name: String!

  """The time the plan was made."""
  created: DateTime

  """The time the plan is expected to be complete."""
  due: DateTime

  """A textual description or comment."""
  note: String
}

input PlanUpdateParams {
  revisionId: ID!

  """
  An informal or formal textual identifier for a plan. Does not imply uniqueness.
  """
  name: String

  """The time the plan was made."""
  created: DateTime

  """The time the plan is expected to be complete."""
  due: DateTime

  """A textual description or comment."""
  note: String
}

type PlanResponse {
  plan: Plan!
}

type PlanConnection {
  edges: [PlanEdge!]!
  pageInfo: PageInfo!
}

type PlanEdge {
  node: Plan!
  cursor: String!
}

"""
An activity that changes inputs into outputs.  It could transform or transport economic resource(s).
"""
type Process {
  id: ID!
  revisionId: ID!

  """
  An informal or formal textual identifier for a process. Does not imply uniqueness.
  """
  name: String!

  """The planned beginning of the process."""
  hasBeginning: DateTime

  """The planned end of the process."""
  hasEnd: DateTime

  """
  The process is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done.
  """
  finished: Boolean

  """
  References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  classifiedAs: [URI!]

  """A textual description or comment."""
  note: String
  nextProcesses: [Process!]
  previousProcesses: [Process!]

  """The process can be safely deleted, has no dependent information."""
  deletable: Boolean
  involvedAgents(first: Int, after: String, last: Int, before: String): AgentConnection
  workingAgents(first: Int, after: String, last: Int, before: String): AgentConnection

  """
  Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [AccountingScope!]
  revision(revisionId: ID!): Process
  meta: RecordMeta!
  observedInputs: [EconomicEvent!]
  observedOutputs: [EconomicEvent!]
  unplannedInputs: [EconomicEvent!]
  unplannedOutputs: [EconomicEvent!]
  previous: [EconomicEvent!]
  next: [EconomicEvent!]
  committedInputs: [Commitment!]
  committedOutputs: [Commitment!]
  intendedInputs: [Intent!]
  intendedOutputs: [Intent!]

  """The process with its inputs and outputs is part of the plan."""
  plannedWithin: Plan

  """The definition or specification for a process."""
  basedOn: ProcessSpecification
}

input ProcessCreateParams {
  """
  An informal or formal textual identifier for a process. Does not imply uniqueness.
  """
  name: String!

  """The planned beginning of the process."""
  hasBeginning: DateTime

  """The planned end of the process."""
  hasEnd: DateTime

  """
  The process is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done.
  """
  finished: Boolean

  """A textual description or comment."""
  note: String

  """
  References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  classifiedAs: [URI!]

  """
  (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [ID!]

  """(`Plan`) The process with its inputs and outputs is part of the plan."""
  plannedWithin: ID

  """
  (`ProcessSpecification`) The definition or specification for a process.
  """
  basedOn: ID
}

input ProcessUpdateParams {
  revisionId: ID!

  """
  An informal or formal textual identifier for a process. Does not imply uniqueness.
  """
  name: String

  """The planned beginning of the process."""
  hasBeginning: DateTime

  """The planned end of the process."""
  hasEnd: DateTime

  """
  The process is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done.
  """
  finished: Boolean

  """A textual description or comment."""
  note: String

  """
  References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  classifiedAs: [URI!]

  """
  (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [ID!]

  """(`Plan`) The process with its inputs and outputs is part of the plan."""
  plannedWithin: ID

  """
  (`ProcessSpecification`) The definition or specification for a process.
  """
  basedOn: ID
}

type ProcessResponse {
  process: Process!
}

type ProcessConnection {
  edges: [ProcessEdge!]!
  pageInfo: PageInfo!
}

type ProcessEdge {
  node: Process!
  cursor: String!
}

"""Specifies the kind of process."""
type ProcessSpecification {
  id: ID!
  revisionId: ID!

  """
  An informal or formal textual identifier for the process. Does not imply uniqueness.
  """
  name: String!

  """A textual description or comment."""
  note: String

  """The image of the process."""
  image: String
  commitmentsRequiringStage(first: Int, after: String, last: Int, before: String): CommitmentConnection
  revision(revisionId: ID!): ProcessSpecification
  meta: RecordMeta!
  resourcesCurrentlyAtStage(first: Int, after: String, last: Int, before: String): EconomicResourceConnection
  conformingProcesses(first: Int, after: String, last: Int, before: String): ProcessConnection
  conformingRecipeProcesses(first: Int, after: String, last: Int, before: String): RecipeProcessConnection
  recipeFlowsRequiringStage(first: Int, after: String, last: Int, before: String): RecipeFlowConnection
}

input ProcessSpecificationCreateParams {
  """
  An informal or formal textual identifier for the process. Does not imply uniqueness.
  """
  name: String!

  """A textual description or comment."""
  note: String

  """The image of the process."""
  image: String
}

input ProcessSpecificationUpdateParams {
  revisionId: ID!

  """
  An informal or formal textual identifier for the process. Does not imply uniqueness.
  """
  name: String

  """A textual description or comment."""
  note: String

  """The image of the process."""
  image: String
}

type ProcessSpecificationResponse {
  processSpecification: ProcessSpecification!
}

type ProcessSpecificationConnection {
  edges: [ProcessSpecificationEdge!]!
  pageInfo: PageInfo!
}

type ProcessSpecificationEdge {
  node: ProcessSpecification!
  cursor: String!
}

"""
Published requests or offers, sometimes with what is expected in return.
"""
type Proposal {
  id: ID!
  revisionId: ID!

  """
  An informal or formal textual identifier for a proposal. Does not imply uniqueness.
  """
  name: String

  """The beginning time of proposal publication."""
  hasBeginning: DateTime

  """The end time of proposal publication."""
  hasEnd: DateTime

  """
  This proposal contains unit based quantities, which can be multiplied to create commitments; commonly seen in a price list or e-commerce.
  """
  unitBased: Boolean

  """The date and time the proposal was created."""
  created: DateTime

  """A textual description or comment."""
  note: String

  """The intents which are part of this proposal."""
  publishes: [Intent!]!

  """The reciprocal intents which are part of this proposal."""
  reciprocal: [Intent!]!

  """
  An agent to which the proposal is to be proposed.  A proposal can be proposed to many agents.
  """
  proposedTo: [Agent!]!

  """
  Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [AccountingScope!]
  revision(revisionId: ID!): Proposal
  meta: RecordMeta!
}

input ProposalCreateParams {
  """
  An informal or formal textual identifier for a proposal. Does not imply uniqueness.
  """
  name: String

  """The beginning time of proposal publication."""
  hasBeginning: DateTime

  """The end time of proposal publication."""
  hasEnd: DateTime

  """
  This proposal contains unit based quantities, which can be multipied to create commitments; commonly seen in a price list or e-commerce.
  """
  unitBased: Boolean

  """A textual description or comment."""
  note: String

  """The date and time the proposal was created."""
  created: DateTime

  """The intents which are part of this proposal."""
  publishes: [ID!]!

  """The reciprocal intents which are part of this proposal."""
  reciprocal: [ID!]

  """The agents to whom this proposal is proposed."""
  proposedTo: [ID!]

  """
  (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [ID!]
}

input ProposalUpdateParams {
  revisionId: ID!

  """
  An informal or formal textual identifier for a proposal. Does not imply uniqueness.
  """
  name: String

  """The beginning date/time of proposal publication."""
  hasBeginning: DateTime

  """The end time of proposal publication."""
  hasEnd: DateTime

  """
  This proposal contains unit based quantities, which can be multipied to create commitments; commonly seen in a price list or e-commerce.
  """
  unitBased: Boolean

  """A textual description or comment."""
  note: String

  """The intents which are part of this proposal."""
  publishes: [ID!]!

  """The reciprocal intents which are part of this proposal."""
  reciprocal: [ID!]

  """The agents to whom this proposal is proposed."""
  proposedTo: [ID!]

  """
  (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning.
  """
  inScopeOf: [ID!]
}

type ProposalResponse {
  proposal: Proposal!
}

type ProposalConnection {
  edges: [ProposalEdge!]!
  pageInfo: PageInfo!
}

type ProposalEdge {
  node: Proposal!
  cursor: String!
}

"""
The specification of a resource inflow to, or outflow from, a recipe process.
"""
type RecipeFlow {
  id: ID!
  revisionId: ID!

  """The amount and unit of the economic resource counted or inventoried."""
  resourceQuantity: Measure

  """
  The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness.
  """
  effortQuantity: Measure

  """
  Relates a process input or output to a verb, such as consume, produce, work, modify, etc.
  """
  action: Action!

  """Relates an input flow to its process in a recipe."""
  recipeInputOf: RecipeProcess

  """Relates an output flow to its process in a recipe."""
  recipeOutputOf: RecipeProcess

  """Relates a flow to its exchange agreement in a recipe."""
  recipeClauseOf: RecipeExchange

  """The role of the provider in the exchange agreement."""
  providerRole: ID

  """The role of the receiver in the exchange agreement."""
  receiverRole: ID

  """Relates a flow to its reciprocal exchange agreement in a recipe."""
  recipeReciprocalClauseOf: RecipeExchange

  """Relates to a process specification in a recipe."""
  stage: ProcessSpecification

  """The instructions for planning"""
  instructions: String

  """A textual description or comment."""
  note: String
  revision(revisionId: ID!): RecipeFlow
  meta: RecordMeta!

  """The resource definition referenced by this flow in the recipe."""
  resourceConformsTo: ResourceSpecification!
}

"""Specifies a process in a recipe for use in planning from recipe."""
type RecipeProcess {
  id: ID!
  revisionId: ID!

  """
  An informal or formal textual identifier for a recipe process. Does not imply uniqueness.
  """
  name: String!

  """
  The planned calendar duration of the process as defined for the recipe batch.
  """
  hasDuration: Duration

  """
  References a concept in a common taxonomy or other classification scheme for purposes of categorization.
  """
  processClassifiedAs: [URI!]

  """A textual description or comment."""
  note: String

  """The image that represents the recipe process."""
  image: URI

  """The non-reciprocal recipe flows that are part of this process."""
  recipeInputs: [RecipeFlow!]

  """The reciprocal recipe flows that are part of this process."""
  recipeOutputs: [RecipeFlow!]
  revision(revisionId: ID!): RecipeProcess
  meta: RecordMeta!

  """The standard specification or definition of a process."""
  processConformsTo: ProcessSpecification
}

"""Specifies an exchange agreement as part of a recipe."""
type RecipeExchange {
  id: ID!
  revisionId: ID!

  """
  An informal or formal textual identifier for a recipe exchange. Does not imply uniqueness.
  """
  name: String!

  """A textual description or comment."""
  note: String

  """
  The non-reciprocal recipe flows that are part of this exchange agreement.
  """
  recipeClauses: [RecipeFlow!]

  """The reciprocal recipe flows that are part of this exchange agreement."""
  recipeReciprocalClauses: [RecipeFlow!]
  revision(revisionId: ID!): RecipeExchange
  meta: RecordMeta!
}

input RecipeProcessCreateParams {
  """
  An informal or formal textual identifier for a recipe process. Does not imply uniqueness.
  """
  name: String!

  """
  The planned calendar duration of the process as defined for the recipe batch.
  """
  hasDuration: IDuration

  """
  References a concept in a common taxonomy or other classification scheme for purposes of categorization.
  """
  processClassifiedAs: [URI!]

  """A textual description or comment."""
  note: String

  """
  (`ProcessSpecification`) The standard specification or definition of a process.
  """
  processConformsTo: ID
}

input RecipeProcessUpdateParams {
  revisionId: ID!

  """
  An informal or formal textual identifier for a recipe process. Does not imply uniqueness.
  """
  name: String

  """
  The planned calendar duration of the process as defined for the recipe batch.
  """
  hasDuration: IDuration

  """
  References a concept in a common taxonomy or other classification scheme for purposes of categorization.
  """
  processClassifiedAs: [URI!]

  """A textual description or comment."""
  note: String

  """
  (`ProcessSpecification`) The standard specification or definition of a process.
  """
  processConformsTo: ID
}

type RecipeProcessResponse {
  recipeProcess: RecipeProcess!
}

input RecipeExchangeCreateParams {
  """
  An informal or formal textual identifier for a recipe exchange. Does not imply uniqueness.
  """
  name: String!

  """A textual description or comment."""
  note: String
}

input RecipeExchangeUpdateParams {
  revisionId: ID!

  """
  An informal or formal textual identifier for a recipe exchange. Does not imply uniqueness.
  """
  name: String

  """A textual description or comment."""
  note: String
}

type RecipeExchangeResponse {
  recipeExchange: RecipeExchange!
}

input RecipeFlowCreateParams {
  """
  (`Action`) Relates a process input or output to a verb, such as consume, produce, work, modify, etc.
  """
  action: ID!

  """The amount and unit of the economic resource counted or inventoried."""
  resourceQuantity: IMeasure

  """
  The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness.
  """
  effortQuantity: IMeasure

  """(`RecipeProcess`) Relates an input flow to its process in a recipe."""
  recipeInputOf: ID

  """(`RecipeProcess`) Relates an output flow to its process in a recipe."""
  recipeOutputOf: ID

  """
  (`RecipeExchange`) Relates a flow to its exchange agreement in a recipe.
  """
  recipeClauseOf: ID

  """The role of the provider in the exchange agreement."""
  providerRole: ID

  """The role of the receiver in the exchange agreement."""
  receiverRole: ID

  """
  (`RecipeExchange`) Relates a flow to its reciprocal exchange agreement in a recipe.
  """
  recipeReciprocalClauseOf: ID

  """
  (`ProcessSpecification`) References the ProcessSpecification of the last process the economic resource went through. Stage is used when the last process is important for finding proper resources, such as where the publishing process wants only documents that have gone through the editing process.
  """
  stage: ID

  """
  The state of the desired economic resource (pass or fail), after coming out of a test or review process.
  """
  state: String

  """The instructions for planning"""
  instructions: String

  """A textual description or comment."""
  note: String

  """
  (`ResourceSpecification`) The resource definition referenced by this flow in the recipe.
  """
  resourceConformsTo: ID!
}

input RecipeFlowUpdateParams {
  revisionId: ID!

  """
  (`Action`) Relates a process input or output to a verb, such as consume, produce, work, modify, etc.
  """
  action: ID

  """The amount and unit of the economic resource counted or inventoried."""
  resourceQuantity: IMeasure

  """
  The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness.
  """
  effortQuantity: IMeasure

  """(`RecipeProcess`) Relates an input flow to its process in a recipe."""
  recipeInputOf: ID

  """(`RecipeProcess`) Relates an output flow to its process in a recipe."""
  recipeOutputOf: ID

  """
  (`RecipeExchange`) Relates a flow to its exchange agreement in a recipe.
  """
  recipeClauseOf: ID

  """The role of the provider in the exchange agreement."""
  providerRole: ID

  """The role of the receiver in the exchange agreement."""
  receiverRole: ID

  """
  (`RecipeExchange`) Relates a flow to its reciprocal exchange agreement in a recipe.
  """
  recipeReciprocalClauseOf: ID

  """
  (`ProcessSpecification`) References the ProcessSpecification of the last process the economic resource went through. Stage is used when the last process is important for finding proper resources, such as where the publishing process wants only documents that have gone through the editing process.
  """
  stage: ID

  """
  The state of the desired economic resource (pass or fail), after coming out of a test or review process.
  """
  state: String

  """The instructions for planning"""
  instructions: String

  """A textual description or comment."""
  note: String

  """
  (`ResourceSpecification`) The resource definition referenced by this flow in the recipe.
  """
  resourceConformsTo: ID
}

type RecipeFlowResponse {
  recipeFlow: RecipeFlow!
}

type RecipeFlowConnection {
  edges: [RecipeFlowEdge!]!
  pageInfo: PageInfo!
}

type RecipeFlowEdge {
  node: RecipeFlow!
  cursor: String!
}

type RecipeProcessConnection {
  edges: [RecipeProcessEdge!]!
  pageInfo: PageInfo!
}

type RecipeProcessEdge {
  node: RecipeProcess!
  cursor: String!
}

type RecipeExchangeConnection {
  edges: [RecipeExchangeEdge!]!
  pageInfo: PageInfo!
}

type RecipeExchangeEdge {
  node: RecipeExchange!
  cursor: String!
}

"""
Specification of a kind of resource. Could define a material item, service, digital item, currency account, etc.
Used instead of a classification when more information is needed, particularly for recipes.
"""
type ResourceSpecification {
  id: ID!
  revisionId: ID!

  """
  An informal or formal textual identifier for a type of resource. Does not imply uniqueness.
  """
  name: String!

  """
  The uri to an image relevant to the entity, such as a photo, diagram, etc.
  """
  image: URI

  """URI addresses to images relevant to the type of resource."""
  imageList: [URI!]

  """
  References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  resourceClassifiedAs: [URI!]

  """A textual description or comment."""
  note: String

  """The default unit used for the resource itself."""
  defaultUnitOfResource: Unit

  """The default unit used for use or work."""
  defaultUnitOfEffort: Unit

  """
  Defines if any resource of that type can be freely substituted for any other resource of that type when used, consumed, traded, etc.
  """
  substitutable: Boolean
  commitments(first: Int, after: String, last: Int, before: String): CommitmentConnection
  revision(revisionId: ID!): ResourceSpecification
  meta: RecordMeta!
  intents(first: Int, after: String, last: Int, before: String): IntentConnection
  conformingResources(first: Int, after: String, last: Int, before: String): EconomicResourceConnection
  economicEvents(first: Int, after: String, last: Int, before: String): EconomicEventConnection
}

input ResourceSpecificationCreateParams {
  """
  An informal or formal textual identifier for a type of resource. Does not imply uniqueness.
  """
  name: String!

  """
  The uri to an image relevant to the entity, such as a photo, diagram, etc.
  """
  image: URI

  """URI addresses to images relevant to the type of resource."""
  imageList: [URI!]

  """
  References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  resourceClassifiedAs: [URI!]

  """A textual description or comment."""
  note: String

  """(`Unit`) The default unit used for the resource itself."""
  defaultUnitOfResource: ID

  """(`Unit`) The default unit used for use or work."""
  defaultUnitOfEffort: ID

  """
  Defines if any resource of that type can be freely substituted for any other resource of that type when used, consumed, traded, etc.
  """
  substitutable: Boolean
}

input ResourceSpecificationUpdateParams {
  revisionId: ID!

  """
  An informal or formal textual identifier for a type of resource. Does not imply uniqueness.
  """
  name: String

  """
  The uri to an image relevant to the entity, such as a photo, diagram, etc.
  """
  image: URI

  """URI addresses to images relevant to the type of resource."""
  imageList: [URI!]

  """
  References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping.
  """
  resourceClassifiedAs: [URI!]

  """A textual description or comment."""
  note: String

  """(`Unit`) The default unit used for the resource itself."""
  defaultUnitOfResource: ID

  """(`Unit`) The default unit used for use or work."""
  defaultUnitOfEffort: ID

  """
  Defines if any resource of that type can be freely substituted for any other resource of that type when used, consumed, traded, etc.
  """
  substitutable: Boolean
}

type ResourceSpecificationResponse {
  resourceSpecification: ResourceSpecification!
}

type ResourceSpecificationConnection {
  edges: [ResourceSpecificationEdge!]!
  pageInfo: PageInfo!
}

type ResourceSpecificationEdge {
  node: ResourceSpecification!
  cursor: String!
}

"""
The `URI` type simply declares a reference to an external web URL, Holochain entry or other resource.
"""
scalar URI

"""
The `DateTime` scalar type represents a DateTime value as specified by
[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601).
"""
scalar DateTime

"""
The `Decimal` scalar type represents arbitrary-precision floating-point
numbers as specified by
[IEEE 854-1987](https://en.wikipedia.org/wiki/IEEE_854-1987).  They
are represented as strings.
"""
scalar Decimal

type ProductBatch {
  revision(revisionId: ID!): ProductBatch
  meta: RecordMeta!
}
schema-introspection.ts:330 ✅ Schema introspection completed
get-schema.ts:11 
🎯 === CREATE UNIT MUTATION ANALYSIS ===
get-schema.ts:14 ✅ createUnit mutation is SUPPORTED in the schema!
get-schema.ts:15 
📊 CREATE UNIT MUTATION DETAILS:
get-schema.ts:16   Name: createUnit
get-schema.ts:17   Return Type: UnitResponse!
get-schema.ts:19 
🔧 UNITCREATEPARAMS FIELDS:
get-schema.ts:22   label: String! [✓ REQUIRED]
get-schema.ts:22   symbol: String! [✓ REQUIRED]
get-schema.ts:22   omUnitIdentifier: String! [✓ REQUIRED]
get-schema.ts:22   classifiedAs: [URI!] [✓ REQUIRED]
get-schema.ts:25 
📤 RESPONSE UNIT FIELDS:
get-schema.ts:27   id: ID!
get-schema.ts:27   revisionId: ID!
get-schema.ts:27   label: String!
get-schema.ts:27   symbol: String!
get-schema.ts:27   omUnitIdentifier: String!
get-schema.ts:27   classifiedAs: String
get-schema.ts:27   revision: Unit
get-schema.ts:27   meta: RecordMeta!
get-schema.ts:30 
📋 TYPESCRIPT INTERFACE (Expected):
get-schema.ts:31   interface UnitCreateParams {
get-schema.ts:35     label: String;
get-schema.ts:35     symbol: String;
get-schema.ts:35     omUnitIdentifier: String;
get-schema.ts:35     classifiedAs: [URI];
get-schema.ts:37   }
get-schema.ts:43 
📈 SUMMARY:
get-schema.ts:44   • Total mutations found: 51
get-schema.ts:45   • Unit-related mutations: 3
get-schema.ts:46   • createUnit supported: YES
get-schema.ts:49   • Available unit mutations:
get-schema.ts:51     - createUnit
get-schema.ts:51     - updateUnit
get-schema.ts:51     - deleteUnit
+page.svelte:87 ✅ Schema introspection completed successfully