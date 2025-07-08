# Technical Specifications

## 1. Frontend (`ui/`)

The user interface is a modern web application built with the following technologies:

| Technology                  | Version/Details                                        | Purpose                                |
| --------------------------- | ------------------------------------------------------ | -------------------------------------- |
| **Framework**               | SvelteKit                                              | Core application framework             |
| **Language**                | TypeScript                                             | Type safety and modern JavaScript      |
| **UI Library**              | Svelte 5                                               | Component model and reactivity         |
| **Styling**                 | Tailwind CSS                                           | Utility-first CSS framework          |
| **GraphQL Client**          | `graphql-request`                                      | Lightweight client for GraphQL queries |
| **Build Tool**              | Vite                                                   | Frontend development and build server  |
| **Package Manager**         | npm                                                    | Dependency management                  |

## 2. Backend (`dnas/`)

The backend is a Holochain application with the following components:

| Technology          | Version/Details                          | Purpose                                 |
| ------------------- | ---------------------------------------- | --------------------------------------- |
| **Framework**       | Holochain                                | Distributed application framework       |
| **Language**        | Rust                                     | Core language for DNA development       |
| **Economic Model**  | hREA (Holochain REA)                     | ValueFlows implementation for Holochain |
| **API Layer**       | GraphQL                                  | Primary interface for the frontend      |

## 3. Development & Tooling

| Tool                | Purpose                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| **Version Control** | Git                                                                     |
| **Linting**         | ESLint                                                                  |
| **Formatting**      | Prettier                                                                |
| **Nix**             | (`flake.nix`) Used for creating a reproducible development environment. |

## 4. API Reference

The primary API for this project is the hREA GraphQL API. Detailed documentation for the available queries, mutations, and types can be found in the `graphql-developer-docs/reference/graphql-api-reference/` directory provided in the project. Developers **must** consult this reference before implementing new features. 