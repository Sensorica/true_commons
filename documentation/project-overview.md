# Project Overview: True Commons

> **Status**: This document describes a **Proof of Concept (PoC)** project. The goal is to demonstrate the feasibility and core architecture of the True Commons vision.

## 1. Introduction

True Commons is a platform for building **"True Commons"**: organization-agnostic, capture-resistant digital assets that exist as standalone entities on a serverless infrastructure.

The primary goal of this PoC is to establish a technical foundation and demonstrate key user interactions for a collaborative ecosystem where resources, agents, and economic events can be tracked in a decentralized manner. A core objective is to design and prototype digital environments that support **stigmergic collaboration**—a form of indirect coordination where individuals are guided by the signals and artifacts left by others.

## 2. What is a "True Common"?

A "True Common" is a digital resource designed to overcome the limitations of current platforms like GitHub or Thingiverse, where assets are subject to platform rules and the proliferation of random copies hinders collaboration. A True Common has the following characteristics:

-   **Organization-Agnostic & Capture-Resistant**: No single entity controls the resource.
-   **Permissionless & Rules-Driven**: Anyone can access the resource under a clear, embedded set of rules that govern interactions.
-   **Unenclosable & Hard to Clone**: Embedded provenance and economic history make the resource difficult to capture or clone without attribution.
-   **Shareable & Composable**: Designed by default for sharing, remixing, and aggregation into larger assets.
-   **Fully Specified & Machine-Readable**: Contains rich metadata about its function, quality, and standards.
-   **Traceable**: The full history of contributions, usage, and transformations is tracked via the ValueFlows vocabulary.

## 3. Core Components

The project is composed of two main parts:

-   **Holochain DNA (`dnas/`)**: The backend logic written in Rust. It defines the data structures and validation rules for all network activities, based on the hREA (Resource-Event-Agent) standard.
-   **User Interface (`ui/`)**: A modern web application built with SvelteKit that serves as the primary user-facing component. It interacts with the Holochain DNA via a GraphQL interface. An older, legacy UI (`ui_old/`) exists as a historical reference.

## 4. Key Concepts

-   **Digital Commons**: A shared repository of digital resources governed by a community.
-   **ValueFlows/hREA**: A standard for modeling economic ecosystems, focusing on the flow of resources, events, and the interactions between agents.
-   **Decentralization**: The system is designed to operate without central servers, giving agency and data ownership to its users.

## 5. Documentation Structure

This project's documentation is structured to provide a clear separation between requirements and specifications.

-   **Requirements**: See [./requirements.md](./requirements.md) for what the project aims to solve from a user and business perspective.
-   **Specifications**: See [./architecture.md](./architecture.md) and [./technical-specs.md](./technical-specs.md) for the technical implementation details. 