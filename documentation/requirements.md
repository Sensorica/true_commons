# Project Requirements

## 1. Vision & Goals

The True Commons platform is designed to enable the creation and management of decentralized, organization-agnostic digital commons. The core goal of this **Proof of Concept (PoC)** is to demonstrate the key features and architectural patterns required to achieve this vision.

## 2. Core Concepts: Stigmergic Collaboration

The primary goal of the UI/UX is to move beyond traditional dashboards and spreadsheets to create a **stigmergic digital environment**. Stigmergy is a mechanism of indirect coordination where the trace left in the environment by an action stimulates the performance of a next action. The environment itself, filled with signals and artifacts, should guide users' collaboration.

### 2.1. Stigmergic Environment Requirements

-   **Navigation**: The environment must allow users to freely navigate contexts of work, zoom out to see the bigger picture, and dive back into specifics, similar to a digital whiteboard like Miro. This breaks the linear, one-dimensional constraint of traditional documents and dashboards.
-   **Permissive Structure**: The environment must be highly permissive, allowing any user to contribute to its structure and content (e.g., adding notes, embedding media, linking items).
-   **Signaling (Digital Pheromones)**: Users must be able to place various signals to communicate status, priority, or calls to action. This includes comments, tags, color-coding, or other graphical symbols that let others know what has been done, what is happening, and what can be done next.
-   **Interoperability**: The environment should support building bridges between different contexts or even different organizational networks, allowing for the flow of agents, resources, and visibility between them.

### 2.2. Use Case: Venture Collaboration at Sensorica

A concrete use case illustrates the need for a stigmergic environment. In the Sensorica open venture "Greens for Good," contributors work in separate "activity bubbles":

-   **Anthony (Development)**: Works on hardware design, logs time and purchases, and creates digital assets (CAD files, reports).
-   **Kampesin (Outreach)**: Produces content for outreach, using development reports to create blog posts.
-   **Mayssam (Financing)**: Writes funding proposals, using development reports and past proposals as source material.

Currently, a project coordinator (Tibi) must manually create bridges between these bubbles by:
1.  **Mapping**: Manually identifying relationships between activities (e.g., a new development report can be used for a funding proposal).
2.  **Signaling**: Manually posting messages on Discord, tagging relevant people to draw their attention to new resources or opportunities.

This manual coordination is a bottleneck. The ideal digital environment would make these maps and signals an intrinsic part of the workspace, allowing contributors to discover these connections organically.

## 3. User Stories & High-Level Features (for the PoC)

This section outlines the primary functionalities demonstrated in the PoC from a user's perspective.

### 3.1. Network Visibility

-   **As a user**, I want to see a high-level overview of the network's health and activity, so that I can understand the state of the commons.
    -   Display total number of agents.
    -   Display total number of resources.
    -   Display total number of economic events.
    -   Display total value created within the network.

### 3.2. Agent Management

-   **As a user**, I want to be able to see all the agents (people, organizations) participating in the network, so that I know who is involved.
-   **As a user**, I want to be able to create and manage my own agent profile, so that I can participate in the network.

### 3.3. Resource Management

-   **As a user**, I want to be able to view all the digital resources available in the commons, so that I can see what has been contributed.
-   **As a user**, I want to be able to create a new digital resource, so that I can contribute to the commons.
-   **As a user**, I want to be able to search or filter resources (e.g., by tags), so that I can find what I'm looking for.
-   **As a user**, I want to be able to "use" or "fork" a resource, signaling my interaction with it and creating a corresponding economic event.

### 3.4. Economic Event Tracking

-   **As a user**, I want to see a log of all economic events (e.g., resource creation, use, transfers), so that I have a transparent view of the economic activity within the commons.

## 4. Assumptions

-   Users will have a basic understanding of Holochain and will run a conductor to connect to the network.
-   The system will initially focus on digital resources but may be extended to other resource types in the future.
-   The definition of "value" is determined by the economic events and the logic within the hREA DNA. 