# hREA Unit Creation Guide

A comprehensive guide for creating units in the hREA (Holochain Resource-Event-Agent) GraphQL schema using the `createUnit` mutation.

## Overview

Units in hREA represent standardized measurements for quantifying resources and economic activities. They are fundamental building blocks in the ValueFlows ontology, enabling precise tracking of quantities in economic events.

## Quick Start

### 1. Analyze Schema Support

First, verify that your hREA GraphQL schema supports unit creation:

```bash
# In the True Commons UI, click the "Analyze Create Unit Mutation" button
# Or use the browser console:
getSchema()
```

### 2. Basic Unit Creation

```typescript
// Example: Create a kilogram unit
const unitData: UnitCreateParams = {
  omUnitIdentifier: "kg",
  label: "Kilogram", 
  symbol: "kg",
  classifiedAs: ["mass", "weight"]
};
```

## GraphQL Mutation Structure

### Mutation Definition

```graphql
mutation CreateUnit($unit: UnitCreateParams!) {
  createUnit(unit: $unit) {
    unit {
      id
      label
      symbol
    }
  }
}
```

### Variables Format

```json
{
  "unit": {
    "omUnitIdentifier": "kg",
    "label": "Kilogram",
    "symbol": "kg",
    "classifiedAs": ["mass", "weight"]
  }
}
```

## UnitCreateParams Interface

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `omUnitIdentifier` | `string` | ✅ | Unique identifier for the unit (e.g., "kg", "m", "hour") |
| `label` | `string` | ✅ | Human-readable name (e.g., "Kilogram", "Meter", "Hour") |
| `symbol` | `string` | ✅ | Short symbol representation (e.g., "kg", "m", "h") |
| `classifiedAs` | `string[]` | ❌ | Optional categories/classifications for the unit |

### TypeScript Interface

```typescript
export interface UnitCreateParams {
  omUnitIdentifier: string;
  label: string;
  symbol: string;
  classifiedAs?: string[];
}
```

## Common Unit Examples

### Physical Measurements

```typescript
// Mass/Weight
const kilogram: UnitCreateParams = {
  omUnitIdentifier: "kg",
  label: "Kilogram",
  symbol: "kg",
  classifiedAs: ["mass", "weight", "SI-base"]
};

const pound: UnitCreateParams = {
  omUnitIdentifier: "lb",
  label: "Pound",
  symbol: "lb",
  classifiedAs: ["mass", "weight", "imperial"]
};

// Length/Distance
const meter: UnitCreateParams = {
  omUnitIdentifier: "m",
  label: "Meter",
  symbol: "m",
  classifiedAs: ["length", "distance", "SI-base"]
};

const foot: UnitCreateParams = {
  omUnitIdentifier: "ft",
  label: "Foot",
  symbol: "ft",
  classifiedAs: ["length", "distance", "imperial"]
};
```

### Time Units

```typescript
const hour: UnitCreateParams = {
  omUnitIdentifier: "hour",
  label: "Hour",
  symbol: "h",
  classifiedAs: ["time", "duration"]
};

const day: UnitCreateParams = {
  omUnitIdentifier: "day",
  label: "Day",
  symbol: "d",
  classifiedAs: ["time", "duration"]
};
```

### Digital/Abstract Units

```typescript
const piece: UnitCreateParams = {
  omUnitIdentifier: "piece",
  label: "Piece",
  symbol: "pc",
  classifiedAs: ["count", "discrete"]
};

const byte: UnitCreateParams = {
  omUnitIdentifier: "byte",
  label: "Byte",
  symbol: "B",
  classifiedAs: ["data", "digital", "information"]
};

const license: UnitCreateParams = {
  omUnitIdentifier: "license",
  label: "License",
  symbol: "lic",
  classifiedAs: ["legal", "permission", "access"]
};
```

### Currency/Value Units

```typescript
const usd: UnitCreateParams = {
  omUnitIdentifier: "USD",
  label: "US Dollar",
  symbol: "$",
  classifiedAs: ["currency", "monetary", "fiat"]
};

const hour_skilled: UnitCreateParams = {
  omUnitIdentifier: "hour-skilled",
  label: "Skilled Labor Hour",
  symbol: "h-skill",
  classifiedAs: ["time", "labor", "skilled-work"]
};
```

## Implementation Examples

### Using Apollo Client (Recommended)

```typescript
import { useMutation } from '@apollo/client';
import { CREATE_UNIT_MUTATION } from './mutations/units.mutations';

function CreateUnitComponent() {
  const [createUnit, { loading, error, data }] = useMutation(CREATE_UNIT_MUTATION);

  const handleCreateUnit = async (unitData: UnitCreateParams) => {
    try {
      const result = await createUnit({
        variables: { unit: unitData }
      });
      
      console.log('Unit created:', result.data.createUnit.unit);
      return result.data.createUnit.unit;
    } catch (err) {
      console.error('Failed to create unit:', err);
      throw err;
    }
  };

  return (
    // Your component JSX
  );
}
```

### Using True Commons Store

```typescript
import unitsStore from '$lib/stores/units.store.svelte';

// Create a new unit
const newUnit = await unitsStore.createUnit({
  omUnitIdentifier: "kg",
  label: "Kilogram",
  symbol: "kg",
  classifiedAs: ["mass", "weight"]
});

console.log('Created unit:', newUnit);
```

### Raw GraphQL Query

```typescript
import { gql } from '@apollo/client/core';

const CREATE_UNIT = gql`
  mutation CreateUnit($unit: UnitCreateParams!) {
    createUnit(unit: $unit) {
      unit {
        id
        label
        symbol
      }
    }
  }
`;

// Execute the mutation
const result = await apolloClient.mutate({
  mutation: CREATE_UNIT,
  variables: {
    unit: {
      omUnitIdentifier: "kg",
      label: "Kilogram", 
      symbol: "kg",
      classifiedAs: ["mass", "weight"]
    }
  }
});
```

## Best Practices

### 1. Identifier Conventions

```typescript
// ✅ Good - Standard abbreviations
omUnitIdentifier: "kg"      // kilogram
omUnitIdentifier: "m"       // meter  
omUnitIdentifier: "USD"     // US Dollar

// ✅ Good - Descriptive for custom units
omUnitIdentifier: "hour-skilled"
omUnitIdentifier: "license-software"

// ❌ Avoid - Ambiguous or too long
omUnitIdentifier: "k"       // Could be anything
omUnitIdentifier: "very-long-descriptive-unit-name"
```

### 2. Symbol Guidelines

```typescript
// ✅ Keep symbols short and recognizable
symbol: "kg"    // Standard SI
symbol: "$"     // Widely recognized
symbol: "h"     // Common abbreviation

// ❌ Avoid lengthy symbols
symbol: "kilogram"  // Too long for a symbol
```

### 3. Classification Strategy

```typescript
// ✅ Use hierarchical classification
classifiedAs: ["measurement", "physical", "mass", "SI-base"]

// ✅ Include relevant domains
classifiedAs: ["digital", "storage", "data"]

// ✅ Add system type for organization
classifiedAs: ["currency", "fiat", "USD"]
```

### 4. Validation

```typescript
function validateUnitParams(unit: UnitCreateParams): string[] {
  const errors: string[] = [];
  
  if (!unit.omUnitIdentifier?.trim()) {
    errors.push('omUnitIdentifier is required');
  }
  
  if (!unit.label?.trim()) {
    errors.push('label is required');
  }
  
  if (!unit.symbol?.trim()) {
    errors.push('symbol is required');
  }
  
  // Check for reasonable lengths
  if (unit.omUnitIdentifier && unit.omUnitIdentifier.length > 50) {
    errors.push('omUnitIdentifier should be under 50 characters');
  }
  
  if (unit.symbol && unit.symbol.length > 10) {
    errors.push('symbol should be under 10 characters');
  }
  
  return errors;
}
```

## Error Handling

### Common Error Scenarios

```typescript
try {
  const unit = await createUnit({ variables: { unit: unitData } });
} catch (error) {
  if (error.message.includes('duplicate')) {
    // Handle duplicate unit identifier
    console.error('Unit with this identifier already exists');
  } else if (error.message.includes('validation')) {
    // Handle validation errors
    console.error('Invalid unit data provided');
  } else if (error.message.includes('network')) {
    // Handle network issues
    console.error('Network error - check connection');
  } else {
    // Handle unknown errors
    console.error('Unknown error creating unit:', error);
  }
}
```

### Validation Before Creation

```typescript
async function safeCreateUnit(unitData: UnitCreateParams) {
  // Validate data
  const validationErrors = validateUnitParams(unitData);
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
  }
  
  // Check for existing unit (optional)
  const existingUnits = await unitsStore.fetchAllUnits();
  const duplicate = existingUnits.find(u => 
    u.id === unitData.omUnitIdentifier || 
    u.symbol === unitData.symbol
  );
  
  if (duplicate) {
    throw new Error(`Unit already exists: ${duplicate.label}`);
  }
  
  // Create the unit
  return await unitsStore.createUnit(unitData);
}
```

## Testing Your Implementation

### 1. Schema Analysis

Use the built-in schema analysis tool:

```javascript
// In browser console or component
const schemaInfo = await getSchema();

// Check if createUnit is supported
console.log('Create Unit supported:', schemaInfo.createUnitInfo.isSupported);

// View parameter structure
console.log('Required fields:', 
  schemaInfo.createUnitInfo.unitCreateParamsFields
    .filter(f => f.isRequired)
    .map(f => f.name)
);
```

### 2. Test Unit Creation

```typescript
// Test with minimal required data
const testUnit: UnitCreateParams = {
  omUnitIdentifier: "test-unit",
  label: "Test Unit",
  symbol: "test"
};

try {
  const result = await unitsStore.createUnit(testUnit);
  console.log('✅ Unit creation successful:', result);
  
  // Clean up test data
  await unitsStore.deleteUnit(result.id);
} catch (error) {
  console.error('❌ Unit creation failed:', error);
}
```

## Integration with True Commons

### Foundation Service Integration

The True Commons foundation service automatically creates essential units during initialization:

```typescript
// These units are created automatically:
// - "piece" (for countable items)
// - "hour" (for time tracking)  
// - "byte" (for digital storage)
// - "USD" (for monetary values)
```

### Resource Specification Usage

Units are typically used when creating resource specifications:

```typescript
const resourceSpec = {
  name: "Digital Storage",
  defaultUnitOfResource: "byte",  // References unit identifier
  // ... other fields
};
```

### Economic Event Integration

Units quantify resources in economic events:

```typescript
const economicEvent = {
  action: "transfer",
  resourceQuantity: {
    hasNumericalValue: 100,
    hasUnit: "kg"  // References unit identifier
  },
  // ... other fields
};
```

## Troubleshooting

### Schema Not Supporting createUnit

If the schema analysis shows createUnit is not supported:

1. **Check hREA Service**: Ensure hREA service is properly initialized
2. **Verify GraphQL Schema**: Make sure you're using a complete hREA schema
3. **Update Dependencies**: Check if `@valueflows/vf-graphql-holochain` is up to date
4. **Network Issues**: Verify Holochain conductor is running and accessible

### Common Development Issues

```typescript
// Issue: TypeScript errors with UnitCreateParams
// Solution: Import the correct type
import type { UnitCreateParams } from '../graphql/types';

// Issue: Mutation not found
// Solution: Check that CREATE_UNIT_MUTATION is properly imported
import { CREATE_UNIT_MUTATION } from '../graphql/mutations/units.mutations';

// Issue: Apollo Client not configured
// Solution: Ensure hREA service is initialized before using
if (!hreaService.isInitialized) {
  await hreaService.initialize();
}
```

## Resources

- **ValueFlows Specification**: [https://valueflo.ws/](https://valueflo.ws/)
- **hREA Documentation**: [https://github.com/h-REA/hREA](https://github.com/h-REA/hREA)
- **Holochain Developer Portal**: [https://developer.holochain.org/](https://developer.holochain.org/)

## Support

For issues related to unit creation in True Commons:

1. Use the "Analyze Create Unit Mutation" button to diagnose schema issues
2. Check browser console for detailed error messages
3. Verify your hREA service configuration
4. Review the ValueFlows ontology for unit modeling guidance

---

*This guide covers the essential aspects of creating units in hREA. For advanced use cases or custom implementations, refer to the ValueFlows specification and hREA documentation.* 