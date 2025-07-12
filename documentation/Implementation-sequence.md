# Implementation Sequence and UI Workflow Design
Based on comprehensive analysis of ValueFlows ontology, hREA implementation, and current codebase dependencies, this document outlines the proper implementation sequence for True Commons and proposes UI workflow improvements to avoid runtime errors.

# ValueFlows Implementation Sequence Analysis

Understanding ValueFlows Component Dependencies: ValueFlows has a clear hierarchy of dependencies that must be respected to avoid runtime errors. Based on the ontology specification and hREA implementation:

## Phase 1: Foundation Components (Must be implemented first)

1.1 Units (Highest Priority)

Why first: Every Measure in ValueFlows requires a Unit. Resources, Events, and almost all quantified data depend on Units.

Implementation requirements:
- Create Unit entities following OM2 (Ontology of Measures) standard
- Include basic units: one (each), hour (time), kilogram (weight), meter (distance)
- Support override labels for business contexts (e.g., "each" instead of "one")

Current status: Hardcoded mock units in code, needs proper Unit management

1.2 Agents (Second Priority)

Why second: Agents are required for all economic activity. Every EconomicEvent, Process, and Resource needs associated Agents.

Implementation requirements:
- Person and Organization agent types
- Agent creation and management
- Agent authentication and identity

Current status: ✅ Partially implemented, needs completion

1.3 Actions (Third Priority)

Why third: Every EconomicEvent requires an Action that defines its behavior (produce, consume, use, transfer, etc.).

Implementation requirements:
- Standard ValueFlows actions: produce, consume, use, transfer, move, cite, etc.
- Action effects on resources (increment, decrement, no-change)
- Action validation rules

Current status: Hardcoded mock actions, needs proper Action management

## Phase 2: Resource Foundation Components

2.1 ResourceSpecifications (Fourth Priority)

Why fourth: EconomicResources should conform to ResourceSpecifications. This provides the "type" or "kind" of resources.

Implementation requirements:
- Resource type definitions (Document, Software, Design, etc.)
- Default units for resources and effort
- Substitutability rules

Current status: ❌ Missing, causing resource creation errors

2.2 EconomicResources (Fifth Priority)

Why fifth: Resources depend on ResourceSpecifications, Units, and Agents being properly established.

Implementation requirements:
- Resource creation with proper conformsTo relationship
- Accounting and onhand quantities with proper Units
- Primary accountable Agent assignment

Current status: ⚠️ Partially implemented, but missing ResourceSpecification dependencies

## Phase 3: Process and Event Components

3.1 Processes (Sixth Priority)

Why sixth: Processes organize and contextualize EconomicEvents. Events can reference processes they belong to.

Implementation requirements:
- Process creation and management
- Process-Event relationships
- Input/output flow definitions

Current status: ❌ Not implemented

3.2 EconomicEvents (Seventh Priority)

Why seventh: Events depend on Actions, Agents, Resources, and optionally Processes being established.

Implementation requirements:
- Event creation with proper Action, Agent, Resource references
- Quantity measurements with proper Units
- Process relationships

Current status: ⚠️ Partially implemented, but dependencies not properly managed

##Phase 4: Advanced Planning Components

4.1 Intents and Commitments (Eighth Priority)

Why eighth: These represent planned future activities and depend on all foundation components.

Implementation requirements:
- Intent creation and matching
- Commitment fulfillment tracking
- Agreement relationships
- Current status: ❌ Not implemented

4.2 Plans and Recipes (Ninth Priority)

Why ninth: High-level coordination structures that depend on all lower-level components.

Current status: ❌ Not implemented

# 2. Implementation Sequence Justification

Critical Dependencies Identified:
- Units → Everything: Without proper Units, no Measure can be created, breaking Resources and Events
- Agents → Events & Resources: All economic activity requires agent attribution
- Actions → Events: Events cannot exist without defining their action type
- ResourceSpecifications → Resources: Resources need types/categories for proper modeling
- Resources → Events: Most events reference resources they affect
- Processes → Events: Events can be grouped into meaningful processes

Anti-patterns to Avoid:
❌ Creating Resources without ResourceSpecifications (causes validation errors)
❌ Creating Events without proper Units in quantities (causes measurement errors)
❌ Creating Events without valid Actions (causes action reference errors)
❌ Creating Resources without primary accountable Agents (causes ownership errors)

# 3. UI Workflow Design and Default Values

Current Problem Analysis:

The current UI allows creating Resources immediately, but this fails because:
- No ResourceSpecifications exist to conform to
- No proper Units are established for quantities
- Default values are not ValueFlows-compliant
- Proposed First-Launch Sequence:

## Step 1: Create Agent Identity

// User must create their agent profile first
const userAgent = {
  name: "User Name",
  note: "Personal agent in True Commons network",
  // ... other fields
}

## Step 2: Initialize Foundation Data (Automatic)
// Create essential Units automatically
const defaultUnits = [
  { id: 'one', label: 'Each', symbol: 'ea' },
  { id: 'hour', label: 'Hour', symbol: 'h' },
  { id: 'kilogram', label: 'Kilogram', symbol: 'kg' },
  { id: 'meter', label: 'Meter', symbol: 'm' }
];

// Create essential Actions automatically  
const defaultActions = [
  { id: 'produce', label: 'Produce', resourceEffect: 'increment' },
  { id: 'consume', label: 'Consume', resourceEffect: 'decrement' },
  { id: 'use', label: 'Use', resourceEffect: 'no-change' },
  { id: 'transfer', label: 'Transfer', resourceEffect: 'no-change' }
];

// Create basic ResourceSpecifications automatically
const defaultResourceSpecs = [
  { 
    id: 'document-spec', 
    name: 'Document', 
    defaultUnitOfResource: 'one',
    defaultUnitOfEffort: 'hour'
  },
  { 
    id: 'software-spec', 
    name: 'Software', 
    defaultUnitOfResource: 'one',
    defaultUnitOfEffort: 'hour' 
  },
  // ... other types
];


## Step 3: Enable Resource Creation

Only after foundation data exists, allow resource creation with proper defaults:

const resourceCreationDefaults = {
  conformsTo: 'document-spec', // Default ResourceSpecification
  primaryAccountable: userAgent.id,
  accountingQuantity: {
    hasNumericalValue: 1,
    hasUnit: 'one'
  },
  onhandQuantity: {
    hasNumericalValue: 1, 
    hasUnit: 'one'
  }
};

UI Component Modifications Required:

3.1 Enhanced ResourceCreateForm
- Add ResourceSpecification selection (required)
- Pre-populate with sensible defaults
- Validate all required ValueFlows relationships
- Show dependency warnings if foundation data missing

3.2 Foundation Data Management UI
- Admin interface for managing Units, Actions, ResourceSpecifications
- Bulk import/export of foundation data
- Validation of dependency integrity

3.3 First-Launch Wizard
- Guide new users through essential setup
- Automatically create foundation data
- Validate setup completion before enabling resource creation
- Proposed Default Values for Error Prevention:

// Prevent hREA API errors with these defaults
const safeDefaults = {
  units: {
    default: { id: 'one', label: 'Each', symbol: 'ea' },
    time: { id: 'hour', label: 'Hour', symbol: 'h' }
  },
  
  resourceSpecification: {
    default: { 
      id: 'generic-resource',
      name: 'Generic Resource',
      defaultUnitOfResource: 'one',
      defaultUnitOfEffort: 'hour'
    }
  },
  
  actions: {
    create: { id: 'produce', label: 'Produce', resourceEffect: 'increment' },
    use: { id: 'use', label: 'Use', resourceEffect: 'no-change' }
  },
  
  measures: {
    singleItem: { hasNumericalValue: 1, hasUnit: 'one' },
    noEffort: { hasNumericalValue: 0, hasUnit: 'hour' }
  }
};


# Implementation Sequence (Based on ValueFlows Dependencies)

## Phase 1: Foundation Components (Critical)
- Units (Highest Priority) - Required by all Measures
- Agents - Required for all economic activity
- Actions - Required by all EconomicEvents
- ResourceSpecifications - Required for proper Resource typing

## Phase 2: Resource Components
- EconomicResources - Depend on all Phase 1 components

## Phase 3: Process and Event Components
- Processes - Organize and contextualize events 7. EconomicEvents - Depend on all previous components
Phase 4: Advanced Planning 8. Intents and Commitments - Future planning 9. Plans and Recipes - High-level coordination
- UI Workflow Recommendations



Key Default Values to Prevent Errors:
// Essential Units
{ id: 'one', label: 'Each', symbol: 'ea' }
{ id: 'hour', label: 'Hour', symbol: 'h' }

// Essential Actions  
{ id: 'produce', label: 'Produce', resourceEffect: 'increment' }
{ id: 'use', label: 'Use', resourceEffect: 'no-change' }

// Essential ResourceSpecifications
{ id: 'document-spec', name: 'Document', defaultUnitOfResource: 'one' }

## Critical Dependencies That Must Be Respected
Units → Everything (Measures require Units)
ResourceSpecifications → Resources (Resources must conform to specs)
Agents → All Economic Activity (Attribution required)
Actions → Events (Events need action definitions)
This sequence ensures no hREA API errors and maintains proper ValueFlows relationships. The documentation now provides a clear roadmap for implementation that respects the inherent dependencies in the ValueFlows ontology.


