# Holochain and hREA Connection Setup

This document outlines the plan to refactor the application to use a standard hREA connection via GraphQL and Apollo. This will replace the current monolithic service with a more robust and maintainable architecture based on distinct services and stores, providing a solid foundation for future development.

## Completed Tasks

- [x] Define a clear architectural plan.

## In Progress Tasks

- [ ] Enhance `holochain_client_service.svelte.ts` to manage the `AppWebsocket` connection.
- [ ] Create a new `hrea.service.svelte.ts` to initialize Apollo Client with the hREA GraphQL schema.
- [ ] Create a new `agents.store.svelte.ts` for agent-related state and API calls.
- [ ] Create a new `economic-resources.store.svelte.ts` for resource-related state and API calls.
- [ ] Create a new `economic-events.store.svelte.ts` for event-related state and API calls.
- [ ] Update UI components (e.g., `+page.svelte`) to use the new stores.
- [ ] Deprecate and remove the old `true_commons_service.svelte.ts`.
- [ ] Install necessary dependencies (`@apollo/client`, `@valueflows/vf-graphql-holochain`, etc.).
- [ ] Update documentation to reflect the new architecture.

## Future Tasks

- [ ] Add error handling and loading states to all store methods.
- [ ] Implement pagination for lists where applicable.
- [ ] Add caching strategies to optimize data fetching.

## Implementation Plan

The new architecture will be composed of three main layers:

1.  **Holochain Connection Service (`holochain_client_service.svelte.ts`)**: This will be a lean, promise-based Svelte 5 store responsible for a single task: establishing and maintaining the `AppWebsocket` connection to the Holochain conductor. It will expose the connected client instance and its status through reactive `$state` variables.

2.  **hREA Service (`hrea.service.svelte.ts`)**: This service will orchestrate the connection between Holochain and GraphQL. It will:
    *   Depend on the `holochain_client_service` to ensure a connection is available.
    *   Use `createHolochainSchema` from `@valueflows/vf-graphql-holochain` to construct the hREA GraphQL schema.
    *   Initialize and configure an `ApolloClient` instance with the schema and an `InMemoryCache`.
    *   Expose the initialized `ApolloClient` in a `$state` variable for other services and stores to use.

3.  **Domain-Specific Stores (`agents.store.svelte.ts`, etc.)**:
    *   Instead of a single large store, we will have multiple, focused stores for each hREA domain (Agents, Economic Resources, Economic Events).
    *   Each store will be a self-contained Svelte 5 file that imports the `hrea.service` to access the `ApolloClient`.
    *   It will manage its own state (e.g., `let agents = $state([])`, `let loading = $state(false)`).
    *   Methods within the store (e.g., `fetchAllAgents()`) will use the `ApolloClient` to execute GraphQL queries and mutations, updating the store's state with the results.

## Update Documentation

-   `documentation/architecture.md`: Update the architecture diagram and descriptions to reflect the new service and store structure, the adoption of Apollo Client, and the removal of the monolithic `true_commons_service`.
-   `documentation/technical-specs.md`: Add `@apollo/client`, `@valueflows/vf-graphql-holochain`, and any other new packages to the list of project dependencies.

## Relevant Files

-   `ui/src/lib/services/holochain_client_service.svelte.ts`: Manages the raw `AppWebsocket` connection.
-   `ui/src/lib/services/hrea.service.svelte.ts`: Manages the Apollo Client and hREA GraphQL schema.
-   `ui/src/lib/stores/agents.store.svelte.ts`: Manages state and data fetching for hREA agents.
-   `ui/src/lib/stores/economic-resources.store.svelte.ts`: Manages state and data fetching for hREA economic resources.
-   `ui/src/lib/stores/economic-events.store.svelte.ts`: Manages state and data fetching for hREA economic events.
-   `ui/src/routes/+page.svelte`: The main UI component, to be updated to use the new stores.
-   `package.json`: To be updated with new dependencies. 