import { AppWebsocket } from '@holochain/client';
import './index.css';

// Types for our True Commons application
interface Agent {
  name: string;
  agent_type: 'Person' | 'Organization' | 'EcologicalAgent';
  primary_location?: string;
  note?: string;
}

interface DigitalResource {
  name: string;
  description: string;
  content_hash: string;
  resource_type: 'Document' | 'Software' | 'Design' | 'Dataset' | 'Media' | 'Knowledge';
  version: string;
  parent_versions: string[];
  license: string;
  tags: string[];
  access_rules: AccessRule[];
  created_by: string;
}

interface AccessRule {
  rule_type: 'Read' | 'Write' | 'Fork' | 'Merge' | 'Admin';
  condition: string;
  action: string;
}

interface EconomicEvent {
  action: string;
  provider: string;
  receiver?: string;
  resource_inventoried_as?: string;
  resource_quantity?: Measure;
  effort_quantity?: Measure;
  has_beginning: number;
  has_end?: number;
  note?: string;
  in_scope_of?: string;
}

interface Measure {
  has_numerical_value: number;
  has_unit: 'Hour' | 'Day' | 'Each' | 'Byte' | 'Kilobyte' | 'Megabyte' | 'Gigabyte';
}

interface NetworkStats {
  total_agents: number;
  total_resources: number;
  total_events: number;
}

class TrueCommonsApp {
  private client: AppWebsocket | null = null;
  private currentAgent: Agent | null = null;

  async init() {
    // Always setup UI first - show interface even without Holochain
    await this.setupUI();

    try {
      this.client = await AppWebsocket.connect();
      console.log('Connected to Holochain!');

      // Load real data from Holochain
      await this.loadNetworkStats();
      await this.loadCurrentAgent();

    } catch (error) {
      console.error('Failed to connect to Holochain:', error);
      this.showError('Holochain conductor not running. UI works in demo mode.');

      // Show demo data instead
      this.showDemoData();
    }
  }

  private async setupUI() {
    const app = document.getElementById('app')!;
    app.innerHTML = `
      <div class="container">
        <header class="header">
          <h1>🌐 True Commons</h1>
          <p>Organization-agnostic digital assets with ValueFlows economic modeling</p>
        </header>

        <div class="tabs">
          <button class="tab-button active" data-tab="resources">Resources</button>
          <button class="tab-button" data-tab="agents">Agents</button>
          <button class="tab-button" data-tab="events">Economic Events</button>
          <button class="tab-button" data-tab="create">Create Resource</button>
        </div>

        <div class="tab-content">
          <div id="resources-tab" class="tab-panel active">
            <div class="section">
              <h2>Digital Resources</h2>
              <div class="search-box">
                <input type="text" id="search-input" placeholder="Search resources by tag...">
                <button id="search-btn">Search</button>
              </div>
              <div id="resources-list" class="list-container">
                <div class="loading">Loading resources...</div>
              </div>
            </div>
          </div>

          <div id="agents-tab" class="tab-panel">
            <div class="section">
              <h2>Network Agents</h2>
              <div id="agent-profile" class="profile-section">
                <h3>Your Profile</h3>
                <div id="current-agent">
                  <div class="loading">Loading profile...</div>
                </div>
                <button id="create-agent-btn" class="btn btn-primary" style="display: none;">Create Profile</button>
              </div>
              <div id="agents-list" class="list-container">
                <div class="loading">Loading agents...</div>
              </div>
            </div>
          </div>

          <div id="events-tab" class="tab-panel">
            <div class="section">
              <h2>Economic Activity</h2>
              <div id="events-list" class="list-container">
                <div class="loading">Loading economic events...</div>
              </div>
            </div>
          </div>

          <div id="create-tab" class="tab-panel">
            <div class="section">
              <h2>Create New Resource</h2>
              <form id="create-resource-form" class="form">
                <div class="form-group">
                  <label for="resource-name">Name:</label>
                  <input type="text" id="resource-name" required>
                </div>
                <div class="form-group">
                  <label for="resource-description">Description:</label>
                  <textarea id="resource-description" required></textarea>
                </div>
                <div class="form-group">
                  <label for="resource-type">Type:</label>
                  <select id="resource-type" required>
                    <option value="Document">Document</option>
                    <option value="Software">Software</option>
                    <option value="Design">Design</option>
                    <option value="Dataset">Dataset</option>
                    <option value="Media">Media</option>
                    <option value="Knowledge">Knowledge</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="resource-content">Content:</label>
                  <textarea id="resource-content" placeholder="Enter the content of your resource..." required></textarea>
                </div>
                <div class="form-group">
                  <label for="resource-license">License:</label>
                  <select id="resource-license" required>
                    <option value="CC0">CC0 - Public Domain</option>
                    <option value="CC-BY">CC BY - Attribution</option>
                    <option value="CC-BY-SA">CC BY-SA - Attribution-ShareAlike</option>
                    <option value="MIT">MIT License</option>
                    <option value="GPL-3.0">GPL v3</option>
                    <option value="Apache-2.0">Apache 2.0</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="resource-tags">Tags (comma-separated):</label>
                  <input type="text" id="resource-tags" placeholder="e.g., irrigation, open-source, agriculture">
                </div>
                <button type="submit" class="btn btn-primary">Create Resource</button>
              </form>
            </div>
          </div>
        </div>

        <div class="stats">
          <div class="stat-card">
            <div class="stat-number" id="agents-count">-</div>
            <div class="stat-label">Agents</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" id="resources-count">-</div>
            <div class="stat-label">Resources</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" id="events-count">-</div>
            <div class="stat-label">Events</div>
          </div>
        </div>

        <div id="error-message" class="error" style="display: none;"></div>
      </div>
    `;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const tabName = target.dataset.tab!;
        this.switchTab(tabName);
      });
    });

    // Create resource form
    const createForm = document.getElementById('create-resource-form') as HTMLFormElement;
    createForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.createResource();
    });

    // Search functionality
    const searchBtn = document.getElementById('search-btn')!;
    const searchInput = document.getElementById('search-input') as HTMLInputElement;

    searchBtn.addEventListener('click', () => {
      this.searchResources(searchInput.value);
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.searchResources(searchInput.value);
      }
    });

    // Create agent profile
    const createAgentBtn = document.getElementById('create-agent-btn')!;
    createAgentBtn.addEventListener('click', () => {
      this.createAgentProfile();
    });
  }

  private switchTab(tabName: string) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(`${tabName}-tab`)?.classList.add('active');

    // Load tab-specific content
    switch (tabName) {
      case 'resources':
        this.loadResources();
        break;
      case 'agents':
        this.loadAgents();
        break;
      case 'events':
        this.loadEvents();
        break;
    }
  }

  private async loadNetworkStats() {
    try {
      const stats: NetworkStats = await this.client!.callZome({
        cap_secret: null,
        role_name: 'true_commons',
        zome_name: 'hello_world',
        fn_name: 'get_network_stats',
        payload: null,
      });

      document.getElementById('agents-count')!.textContent = stats.total_agents.toString();
      document.getElementById('resources-count')!.textContent = stats.total_resources.toString();
      document.getElementById('events-count')!.textContent = stats.total_events.toString();
    } catch (error) {
      console.error('Failed to load network stats:', error);
    }
  }

  private async loadCurrentAgent() {
    try {
      const agentInfo = await this.client!.appInfo();
      const agentPubKey = agentInfo.agent_pub_key;

      const agent: Agent | null = await this.client!.callZome({
        cap_secret: null,
        role_name: 'true_commons',
        zome_name: 'hello_world',
        fn_name: 'get_agent',
        payload: agentPubKey,
      });

      const currentAgentDiv = document.getElementById('current-agent')!;
      const createAgentBtn = document.getElementById('create-agent-btn')!;

      if (agent) {
        this.currentAgent = agent;
        currentAgentDiv.innerHTML = `
          <div class="agent-card">
            <h4>${agent.name}</h4>
            <p><strong>Type:</strong> ${agent.agent_type}</p>
            ${agent.primary_location ? `<p><strong>Location:</strong> ${agent.primary_location}</p>` : ''}
            ${agent.note ? `<p><strong>Note:</strong> ${agent.note}</p>` : ''}
          </div>
        `;
        createAgentBtn.style.display = 'none';
      } else {
        currentAgentDiv.innerHTML = '<p>No profile found. Create one to get started!</p>';
        createAgentBtn.style.display = 'block';
      }
    } catch (error) {
      console.error('Failed to load current agent:', error);
    }
  }

  private async createAgentProfile() {
    const name = prompt('Enter your name:');
    const agentType = prompt('Enter agent type (Person/Organization/EcologicalAgent):') || 'Person';
    const location = prompt('Enter your location (optional):');
    const note = prompt('Enter a note about yourself (optional):');

    if (!name) return;

    try {
      const agent: Agent = {
        name,
        agent_type: agentType as any,
        primary_location: location || undefined,
        note: note || undefined,
      };

      await this.client!.callZome({
        cap_secret: null,
        role_name: 'true_commons',
        zome_name: 'hello_world',
        fn_name: 'create_agent',
        payload: agent,
      });

      this.showSuccess('Agent profile created successfully!');
      await this.loadCurrentAgent();
      await this.loadNetworkStats();
    } catch (error) {
      console.error('Failed to create agent:', error);
      this.showError('Failed to create agent profile');
    }
  }

  private async loadResources() {
    try {
      const resources = await this.client!.callZome({
        cap_secret: null,
        role_name: 'true_commons',
        zome_name: 'hello_world',
        fn_name: 'get_all_resources',
        payload: null,
      });

      this.displayResources(resources);
    } catch (error) {
      console.error('Failed to load resources:', error);
      this.showError('Failed to load resources');
    }
  }

  private async searchResources(tag: string) {
    if (!tag.trim()) {
      this.loadResources();
      return;
    }

    try {
      const resources = await this.client!.callZome({
        cap_secret: null,
        role_name: 'true_commons',
        zome_name: 'hello_world',
        fn_name: 'search_resources_by_tag',
        payload: tag.trim(),
      });

      this.displayResources(resources);
    } catch (error) {
      console.error('Failed to search resources:', error);
      this.showError('Failed to search resources');
    }
  }

  private displayResources(resources: any[]) {
    const container = document.getElementById('resources-list')!;

    if (resources.length === 0) {
      container.innerHTML = '<p>No resources found. Create the first one!</p>';
      return;
    }

    container.innerHTML = resources.map(item => `
      <div class="resource-card">
        <h3>${item.resource.name}</h3>
        <p>${item.resource.description}</p>
        <div class="resource-meta">
          <span class="tag">${item.resource.resource_type}</span>
          <span class="tag">${item.resource.license}</span>
          <span class="tag">v${item.resource.version}</span>
        </div>
        <div class="tags">
          ${item.resource.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="resource-stats" style="margin: 1rem 0; color: rgba(255, 255, 255, 0.7);">
          <span>👥 ${item.metadata.usage_count} uses</span>
          <span style="margin-left: 1rem;">🍴 ${item.metadata.fork_count} forks</span>
          <span style="margin-left: 1rem;">💬 ${item.metadata.collaboration_sessions} sessions</span>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" onclick="app.useResource('${item.action_hash}')">Use</button>
          <button class="btn btn-secondary" onclick="app.forkResource('${item.action_hash}')">Fork</button>
          <button class="btn btn-secondary" onclick="app.viewResource('${item.action_hash}')">View</button>
        </div>
      </div>
    `).join('');
  }

  private async loadAgents() {
    try {
      const agents = await this.client!.callZome({
        cap_secret: null,
        role_name: 'true_commons',
        zome_name: 'hello_world',
        fn_name: 'get_all_agents',
        payload: null,
      });

      const container = document.getElementById('agents-list')!;

      if (agents.length === 0) {
        container.innerHTML = '<p>No agents found.</p>';
        return;
      }

      container.innerHTML = agents.map((item: any) => `
        <div class="agent-card">
          <h4>${item.agent.name}</h4>
          <p><strong>Type:</strong> ${item.agent.agent_type}</p>
          ${item.agent.primary_location ? `<p><strong>Location:</strong> ${item.agent.primary_location}</p>` : ''}
          ${item.agent.note ? `<p><strong>Note:</strong> ${item.agent.note}</p>` : ''}
          <small>Joined: ${new Date(item.created_at / 1000).toLocaleDateString()}</small>
        </div>
      `).join('');
    } catch (error) {
      console.error('Failed to load agents:', error);
      this.showError('Failed to load agents');
    }
  }

  private async loadEvents() {
    // For now, we'll just show a placeholder
    const container = document.getElementById('events-list')!;
    container.innerHTML = '<p>Economic events tracking coming soon...</p>';
  }

  private async createResource() {
    const form = document.getElementById('create-resource-form') as HTMLFormElement;
    const formData = new FormData(form);

    const name = (document.getElementById('resource-name') as HTMLInputElement).value;
    const description = (document.getElementById('resource-description') as HTMLTextAreaElement).value;
    const resourceType = (document.getElementById('resource-type') as HTMLSelectElement).value;
    const content = (document.getElementById('resource-content') as HTMLTextAreaElement).value;
    const license = (document.getElementById('resource-license') as HTMLSelectElement).value;
    const tagsInput = (document.getElementById('resource-tags') as HTMLInputElement).value;

    if (!name || !description || !content) {
      this.showError('Please fill in all required fields');
      return;
    }

    if (!this.currentAgent) {
      this.showError('Please create an agent profile first');
      return;
    }

    try {
      // Simple content hash (in real implementation, use proper hashing)
      const contentHash = btoa(content).substring(0, 32);

      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      const resource: DigitalResource = {
        name,
        description,
        content_hash: contentHash,
        resource_type: resourceType as any,
        version: '1.0.0',
        parent_versions: [],
        license,
        tags,
        access_rules: [], // Default open access
        created_by: '', // Will be set by the zome
      };

      await this.client!.callZome({
        cap_secret: null,
        role_name: 'true_commons',
        zome_name: 'hello_world',
        fn_name: 'create_resource',
        payload: resource,
      });

      this.showSuccess('Resource created successfully!');
      form.reset();
      await this.loadNetworkStats();
      this.switchTab('resources');
    } catch (error) {
      console.error('Failed to create resource:', error);
      this.showError('Failed to create resource');
    }
  }

  // Global methods for button actions
  async useResource(resourceHash: string) {
    try {
      await this.client!.callZome({
        cap_secret: null,
        role_name: 'true_commons',
        zome_name: 'hello_world',
        fn_name: 'use_resource',
        payload: {
          resource_hash: resourceHash,
          effort_quantity: null,
          note: 'Resource used via web interface',
        },
      });

      this.showSuccess('Resource usage recorded!');
      await this.loadNetworkStats();
    } catch (error) {
      console.error('Failed to record resource usage:', error);
      this.showError('Failed to record resource usage');
    }
  }

  async forkResource(resourceHash: string) {
    const newName = prompt('Enter name for the forked resource:');
    if (!newName) return;

    // This is a simplified fork - in a real implementation, you'd have a proper UI
    this.showError('Fork functionality coming soon!');
  }

  async viewResource(resourceHash: string) {
    // This would open a detailed view of the resource
    this.showError('Detailed resource view coming soon!');
  }

  private showError(message: string) {
    const errorDiv = document.getElementById('error-message')!;
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.className = 'error';
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }

  private showSuccess(message: string) {
    const errorDiv = document.getElementById('error-message')!;
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.className = 'success';
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 3000);
  }

  private showDemoData() {
    // Show demo stats
    document.getElementById('agents-count')!.textContent = '12';
    document.getElementById('resources-count')!.textContent = '47';
    document.getElementById('events-count')!.textContent = '156';
    
    // Demo resources
    const demoResources = [
      {
        name: "Solar Drip Irrigation System",
        description: "Arduino-controlled irrigation with moisture sensors and solar power",
        resource_type: "Design",
        license: "CC BY-SA",
        tags: ["irrigation", "solar", "arduino", "agriculture"],
        created_by: "Bob (Farmer)"
      },
      {
        name: "Community Water Purification Plans",
        description: "Low-cost water filtration system using local materials",
        resource_type: "Document", 
        license: "CC0",
        tags: ["water", "filtration", "community", "health"],
        created_by: "Lynn (Engineer)"
      },
      {
        name: "Permaculture Design Software",
        description: "Open-source tool for designing sustainable agricultural systems",
        resource_type: "Software",
        license: "GPL-3.0", 
        tags: ["permaculture", "software", "design", "sustainability"],
        created_by: "Alex (Developer)"
      }
    ];
    
    // Display demo resources
    const resourcesList = document.getElementById('resources-list')!;
    resourcesList.innerHTML = demoResources.map(resource => `
      <div class="resource-card">
        <h3>${resource.name}</h3>
        <p>${resource.description}</p>
        <div class="metadata">
          <span class="type">${resource.resource_type}</span>
          <span class="license">${resource.license}</span>
          <span class="creator">by ${resource.created_by}</span>
        </div>
        <div class="tags">
          ${resource.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="actions">
          <button class="btn btn-secondary" onclick="alert('Demo: Would use this resource')">Use</button>
          <button class="btn btn-secondary" onclick="alert('Demo: Would fork this resource')">Fork</button>
          <button class="btn btn-secondary" onclick="alert('Demo: Would view details')">View</button>
        </div>
      </div>
    `).join('');
    
    // Demo agents
    const agentsList = document.getElementById('agents-list')!;
    agentsList.innerHTML = `
      <div class="agent-card">
        <h3>Bob Martinez</h3>
        <p><strong>Type:</strong> Person</p>
        <p><strong>Location:</strong> Rural California</p>
        <p><strong>Speciality:</strong> Sustainable farming practices</p>
      </div>
      <div class="agent-card">
        <h3>Lynn Chen</h3>
        <p><strong>Type:</strong> Person</p>
        <p><strong>Location:</strong> Portland, Oregon</p>
        <p><strong>Speciality:</strong> Water systems engineering</p>
      </div>
      <div class="agent-card">
        <h3>Community Gardens Collective</h3>
        <p><strong>Type:</strong> Organization</p>
        <p><strong>Location:</strong> Global network</p>
        <p><strong>Focus:</strong> Urban agriculture and education</p>
      </div>
    `;
    
    // Demo economic events
    const eventsList = document.getElementById('events-list')!;
    eventsList.innerHTML = `
      <div class="event-card">
        <h3>Resource Creation</h3>
        <p><strong>Action:</strong> Create</p>
        <p><strong>Resource:</strong> Solar Drip Irrigation System</p>
        <p><strong>Provider:</strong> Bob Martinez</p>
        <p><strong>Time:</strong> 2 hours ago</p>
      </div>
      <div class="event-card">
        <h3>Resource Fork</h3>
        <p><strong>Action:</strong> Fork</p>
        <p><strong>Resource:</strong> Water Purification Plans</p>
        <p><strong>Provider:</strong> Lynn Chen</p>
        <p><strong>Time:</strong> 1 day ago</p>
      </div>
      <div class="event-card">
        <h3>Resource Use</h3>
        <p><strong>Action:</strong> Use</p>
        <p><strong>Resource:</strong> Permaculture Design Software</p>
        <p><strong>Provider:</strong> Community Gardens Collective</p>
        <p><strong>Time:</strong> 3 days ago</p>
      </div>
    `;
    
    // Update profile section
    document.getElementById('current-agent')!.innerHTML = `
      <div class="profile-info">
        <h4>Demo User</h4>
        <p><strong>Type:</strong> Person</p>
        <p><strong>Status:</strong> Demo mode - create profile to join True Commons</p>
      </div>
    `;
  }
}

// Initialize the app
const app = new TrueCommonsApp();
(window as any).app = app; // Make it globally accessible for button clicks

app.init().catch(console.error); 