# Project Overview: True Commons

> **Status**: This document describes a **Proof of Concept (PoC)** project. The goal is to demonstrate the feasibility and core architecture of the True Commons vision.

## 1. Introduction

True Commons is a platform for building **"True Commons"**: organization-agnostic, capture-resistant digital assets that exist as standalone entities on a serverless infrastructure. 

Note that in Valueflows vocabulary, based on REA ontology, "digital assets" are **"Resources"**.

The primary goal of this PoC is to establish a technical foundation and demonstrate key user interactions for a collaborative ecosystem where **Resources**, **Agents**, and economic **Events** (the basis of the REA ontology and the Valueflows vocabulary) can be tracked in a decentralized manner. A core objective is to design and prototype a digital environment that supports **stigmergic collaboration**—a form of indirect coordination where individuals are guided by the signals and artifacts left by others.

One simple and cocize way to put it is that Agents use Resources in Processes to create something, to fullfill a shared goal, including the creation of other Resources. The Agent's activity around a Resource constitutes and **organization**. We believe that economi organizations are determined by the Resources that they use and produce and the type of **Processes** that they use. In other words, aspects of organization such as culture, ethos, governance, methodologies of work etc. are to some degree determined by the Resources that they use and produce and the type of Processes that they use. An economy is a complex set relations between Agents and Resources of a specific type. Agents can chose the economic framework in which they operate, which further influences the nature of the organization. 



## Motivations

Commons-based peer production (CBPP) is a new mode of production mediated by Internet technology, first described by Yochai Benkler in 2002, in the context of open source software. Since then, the practice has evolved in all spheres of human activity, including material peer production. In essence, people coordinate globally to create various types of digital assets, which are openly shared under various permissive licences, as commons. Shared assets may represent code (software), or CAD files (3D models of hardware), and usually include instructions on how to use or build, as well as context. Eventually, these designs are materialized / fabricated by users (as in DIY -do it yourself) or intermediaries (local fabrication).
Hearing the term ‘digital commons’ we assume that it refers to assets shared-by-default, portable and uncapturable, allowing anyone, regardless of organizational affiliation, to further contribute to their development, fork and remix. In the current technological reality, these shared digital assets are stored on proprietary platforms like Github for software, or Thingiverse for hardware designs, where they are subject to the platform’s rules and limitations and are not very portable (transportable accros platforms). True Commons allows digital assets to exist on an open, decentralized and uncapturable medium, using Holochain. 

Another major issue that plagues CBPP is the proliferation of random copies of files representing digital assets, which hinders practical collaboration. One purpose of True Commons is to greatly reduce proliferation of clones, copies, versions of some designs, especially unrelated versions that evolve in silos. The problem of proliferation plagues the open source hardware communities, as it adds costs to getting the proper version for a specific application. In order to reduce this proliferation we can act on both sides of the problem:
1. Reduce friction to collaboration and generate positive incentives to collaboration. The current situation in open source hardware development and fabrication is spoiled by bureaucracy. Each project is managed by a group of individuals who have the power to accept or reject contributions from others. This is the situation on Github for example, where various governance models are used on the wide spectrum, from benevolent dictator to more democratic and consensus based. Apart from the human factor, which introduces preferences that are detached from the technical development itself, friction also arises from the fact that one needs to develop some type of relation with those in charge, in order to have their contribution inserted into the canonical version of the design (into the distro). We can contrast this with Wikipedia or Bitcoin, offering permissionless (identity-blind and frictionless) access to participation. Keep these systems in mind for a second... 
2. Generate positive incentives to incite collaboration on a shared digital resource, rather than making a copy and developing it in another silo. First, there is a reputation reward for contributing to a shared digital resource. Your contribution in this context is submitted to a peer review process, to analysis and testing by other parties, to a shared and transparent process of quality control. Thus, your contribution is already vetted, validated, it acquires value, which is not necessarily the case if you just publish your work on your personal blog. Second, if these autonomous resources are augmented with contribution accounting and tied into tangible reward schemes, you can be paid for your contributions. That is precisely the goal of Sensorica, to use these autonomous resources, with autonomous processes within NRP-type systems, in order to make commons-based peer production self-sustainable. By tracking content (in particular complex 3D models) and the economic activity data (use of resources, contributions with time, materials, money, etc.) using Valueflows, we can generate incentives for collaboration around canonical digital resources, similar to how collaboration is structured on Github, but without the aspects of platform centralization.



Another motivation for the development of True Commons is to make them organization agnostic and detach them from any type of admin agent, as an entity that has special privileges over the Resource. This requires solving a few problems: 
1. Mitigate spam or vandalism in a context without admin functionality. Various methods can be used, inspired from existing permissionless schemes: voting, consensus building, red flagging, etc. 
3. Recover quality control and adherence to standards. The solution lies in the Governance layer, implementing access (inclusion) and validation rules for new contributors and contributions, coupled to incentive systems to increase the likelihood of quality outputs, respecting sound standard. 

Lastly, we need to append the mechanics of versioning, forking and remix for the residual propagation and diversification of these resources, in order to keep track of their proliferation, taking into consideration signals of trust / quality, application context, etc. associated with every branch.


## Overview

True Commons is a Holochain-based implementation that creates organization-agnostic, capture-resistant digital assets using ValueFlows economic modeling. This system enables the creation, sharing, and collaborative development of Resources that exist as standalone entities with embedded economic activity tracking.

## Core Principles
A "True Common" is a digital resource designed to overcome the limitations of current platforms like GitHub or Thingiverse, where assets are subject to platform rules and the proliferation of random copies hinders collaboration. A True Common has the following characteristics:

1. **Permissionless Access**: Anyone can access resources under defined rules
2. **Organization Agnostic**: Exist independently of any single organization. They are only associated with individuals as creators and contributors, not with organizations.
3. **Capture Resistant** or **Unenclosable**: No single party can control or delete resources, Cannot be captured or monopolized
4. **Self-governed**: Rules driven (govern interactions with it, including modification)
4.1 **Roles**: Set of activities or types of interactions that an agent can access with respect to the resource. Also related to custody (responsibility), maintenance (obligations), validation of modification requests, etc.
4.2 **Access control**: Rules associated with **roles**, membranes, to grant permissions to modify resources and to validate requests to modify - can be anonymous using zero-knowledge proof.
5. **Self-regulated**: Peer reviewed, verified and tested (quality control)
6. **Fully specified**: Machine readable in terms of function, design architecture, standards (dimensions, tolerances, quality), etc.
7. **Composable**: Resources can be combined into come complex resources, allow fork and remix
6. **Hard to Clone**: Governance (rules) and incentives to make unnecessary copying of a resource unlikely.
7. **Shareable by Default**: Resources are designed for sharing and open collaboration
9. **Traceable**: Full provenance and economic activity tracking, affiliation to component resources 


## Core Components

The project is composed of two main parts:

-   **Holochain DNA (`dnas/`)**: The backend logic written in Rust. It defines the data structures and validation rules for all network activities, based on the hREA (Resource-Event-Agent) standard.
-   **User Interface (`ui/`)**: A modern web application built with SvelteKit that serves as the primary user-facing component. It interacts with the Holochain DNA via a GraphQL interface. An older, legacy UI (`ui_old/`) exists as a historical reference.


## Documentation Structure

This project's documentation is structured to provide a clear separation between requirements and specifications.

-   **Architecture**: See [./architecture.md](./architecture.md) for how the project is structured
-   **Requirements**: See [./requirements.md](./requirements.md) for what the project aims to solve from a user and business perspective.
-   **Specifications**: See [./specifications.md](./specifications.md) for the technical implementation details.