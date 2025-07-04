# True Commons

> **Note**: This project is currently a **Proof of Concept (PoC)**. It demonstrates the core architectural patterns and user interface for a decentralized digital commons platform. The backend is not fully integrated, and the UI currently operates with mock data.

A **digital commons platform** that enables organization-agnostic, capture-resistant resource sharing built on **Holochain** and **ValueFlows** economic modeling.

## 🌍 Vision: What are True Commons?

True Commons represent a new paradigm for digital resources that are:

- **🔒 Capture-Resistant**: Built on Holochain's decentralized architecture to resist corporate capture
- **🏛️ Organization-Agnostic**: No single entity controls resources; governed by embedded rules
- **📊 Value-Tracking**: Uses ValueFlows ontology to track all economic activities and contributions  
- **🔓 Permissionless**: Open access under defined rules - anyone can contribute and use
- **🌱 Shareable by Default**: Resources are designed for sharing and collaborative improvement
- **📈 Unenclosable**: Hard to clone or capture due to network effects and embedded governance

### Use Case Example

**Bob** creates an open-source irrigation system as a digital artifact containing build instructions, economic data (time, materials, organizational context), and embedded access rules. **Lynn** discovers it, builds the system, adds improvements, and contributes back. The artifact exists independently with no central owner but is governed by its embedded rules, creating value for the entire commons.

## 🏗️ Current Implementation

### ✅ What Works

#### **Frontend (SvelteKit + TypeScript)**
- 🎨 **Modern Dashboard**: Beautiful, responsive interface showcasing True Commons principles
- 📊 **Network Statistics**: Real-time display of agents, resources, economic events, and value created
- 🔍 **Resource Discovery**: Browse and search digital resources with metadata, tags, and licensing
- 👥 **Agent Profiles**: View contributors, organizations, and their reputation/contributions
- 📈 **Economic Events**: Track all ValueFlows activities (create, use, fork, collaborate)
- 🎯 **True Commons Principles**: Visual representation of core concepts and values

#### **Services & Architecture**
- 🔌 **GraphQL Service**: Clean API layer for hREA (Holochain Resource-Event-Agent) integration  
- 🌐 **Holochain Client**: Service for connecting to Holochain conductor
- 🧩 **True Commons Service**: Orchestrates GraphQL and Holochain for True Commons-specific functionality
- 📝 **TypeScript Types**: Comprehensive interfaces extending hREA with True Commons concepts
- ✨ **Demo Data**: Rich examples showing solar irrigation systems, water purification plans, and permaculture software

#### **Developer Experience**
- 🔧 **Type Safety**: Full TypeScript implementation with zero linting errors
- 🎨 **TailwindCSS**: Modern, responsive styling with dark mode support
- 📦 **Clean Architecture**: Modular services with clear separation of concerns
- ✅ **Quality Assurance**: ESLint, Prettier, and svelte-check all passing

### 🚧 What's In Progress

- **hREA Backend**: GraphQL endpoint not yet configured (UI runs with demo data)
- **Holochain Conductor**: Backend services not yet deployed
- **Real Resource Operations**: Creating, forking, and collaborating on actual resources
- **Agent Authentication**: Proper identity and reputation management

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     True Commons UI (SvelteKit)                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐│
│  │   Dashboard     │ │   Resources     │ │   Economic Events   ││
│  │   - Network     │ │   - Discovery   │ │   - ValueFlows      ││
│  │   - Stats       │ │   - Metadata    │ │   - Tracking        ││
│  └─────────────────┘ └─────────────────┘ └─────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
         ┌─────────────┐  ┌──────────────┐  ┌─────────────┐
         │   GraphQL   │  │ True Commons │  │  Holochain  │
         │   Service   │  │   Service    │  │   Client    │
         │   (hREA)    │  │ (Orchestor)  │  │  Service    │
         └─────────────┘  └──────────────┘  └─────────────┘
                │                                   │
         ┌─────────────┐                    ┌─────────────┐
         │    hREA     │                    │  Holochain  │
         │  Backend    │                    │  Conductor  │
         │ (GraphQL)   │                    │    (P2P)    │
         └─────────────┘                    └─────────────┘
```

### Core Technologies

- **Frontend**: SvelteKit, TypeScript, TailwindCSS
- **Backend**: Holochain, hREA (Holochain Resource-Event-Agent)
- **Economic Model**: ValueFlows ontology for resource tracking
- **Data Layer**: GraphQL for hREA integration
- **Architecture**: Microservices with clean separation of concerns

## 🚀 Getting Started

### Prerequisites

Set up the [Holochain development environment](https://developer.holochain.org/docs/install/):

```bash
# Enter nix development shell
nix develop
```

### Development Setup

1. **Install Dependencies**
```bash
# Install project dependencies
bun install

# Install UI dependencies  
cd ui
npm install
```

2. **Start Development Server**
```bash
# From the ui directory
npm run dev
```

3. **View True Commons Dashboard**
```bash
# Open in browser
open http://localhost:5173
```

You'll see the True Commons dashboard with demo data showcasing:
- Network statistics (47 agents, 156 resources, 892 economic events)
- Example resources (Solar Irrigation, Water Purification, Permaculture Software)
- Active agents (Bob Martinez, Lynn Chen, Community Gardens Collective)
- True Commons principles visualization

### Quality Assurance

```bash
# Run all checks (from ui directory)
npm run lint        # ESLint + Prettier
npx svelte-check    # TypeScript validation
npm run format      # Auto-fix formatting
```

## 📋 Next Steps

### Phase 1: Backend Integration (Immediate)
- [ ] **Deploy hREA Backend**: Set up GraphQL endpoint with ValueFlows schema
- [ ] **Configure Holochain Conductor**: Connect P2P networking and DHT
- [ ] **Connect Real Data**: Replace demo data with live hREA queries
- [ ] **Agent Authentication**: Implement proper identity management

### Phase 2: Core Functionality (Short-term)
- [ ] **Resource Creation**: Enable users to create digital resources with metadata
- [ ] **Resource Forking**: Implement derivation and attribution tracking  
- [ ] **Economic Events**: Record all ValueFlows activities (create, use, fork, transfer)
- [ ] **Search & Discovery**: Tag-based and semantic resource discovery
- [ ] **Reputation System**: Track contributions and build agent reputation

### Phase 3: Advanced Features (Medium-term)  
- [ ] **Collaboration Sessions**: Real-time co-creation and editing
- [ ] **Governance Mechanisms**: Embedded rules and community decision-making
- [ ] **Value Distribution**: Economic models for rewarding contributors
- [ ] **Cross-Network Integration**: Federate with other commons networks
- [ ] **Mobile Applications**: Native apps for broader accessibility

### Phase 4: Ecosystem Growth (Long-term)
- [ ] **Domain-Specific Commons**: Agriculture, software, research, education
- [ ] **Enterprise Integration**: APIs for organizations to contribute/consume
- [ ] **Educational Resources**: Tutorials, documentation, case studies
- [ ] **Policy Research**: Study impacts on innovation and collaboration
- [ ] **Global Network**: Scale to thousands of participating communities

## 📚 Key Documents

- **[TRUE_COMMONS_ARCHITECTURE.md](documentation/TRUE_COMMONS_ARCHITECTURE.md)**: Detailed technical architecture
- **[ValueFlows Documentation](https://valueflo.ws/)**: Economic modeling foundation  
- **[hREA Project](https://github.com/holo-rea/holo-rea)**: Holochain Resource-Event-Agent implementation
- **[Holochain Docs](https://developer.holochain.org/)**: Decentralized application platform

## 🤝 Contributing

This project demonstrates a new model for digital commons that could transform how we create, share, and govern digital resources. Contributions welcome!

### Development Commands

```bash
# Development (from ui directory)
npm run dev          # Start SvelteKit dev server
npm run build        # Build for production  
npm run preview      # Preview production build

# Quality Assurance
npm run lint         # Check formatting and linting
npm run format       # Auto-fix code style
npx svelte-check     # TypeScript validation

# Holochain (when backend is configured)
hc app pack workdir/ # Package Holochain app
bun run test         # Run backend tests (from project root)
```

## 🌱 Vision Impact

True Commons represent a paradigm shift toward:
- **Sustainable Innovation**: Resources improve through collaborative use
- **Economic Justice**: Value flows to contributors, not extractors  
- **Technological Sovereignty**: Communities control their digital resources
- **Global Collaboration**: Knowledge sharing transcends organizational boundaries
- **Regenerative Systems**: Commons that grow stronger through participation

*Together, we're building the infrastructure for a more collaborative, equitable, and innovative digital future.*
