# Agent Prompting Guide - Mach Five Portal

## How to Work with Specialized Agents

### 1. Role-Specific Prompting

#### Frontend Agent Prompts
```
"As the Frontend Agent, create a dashboard card that shows 
real-time website visitor count with a live updating chart"

"Frontend Agent: The lead magnet button needs better visibility. 
Make it pulse subtly and add a notification badge"
```

**Key phrases**: UI/UX, Neodigm component, responsive, animation, styling, carousel page

#### API Agent Prompts
```
"API Agent: Implement the endpoint integration for fetching 
lead analytics data with proper error handling"

"As the API specialist, add caching to the invoice API calls 
and handle token refresh scenarios"
```

**Key phrases**: endpoint, authentication, CRUD, token, API response, error handling

#### Features Agent Prompts
```
"Feature Agent: Design a complete email campaign tracker feature 
with open rates, click tracking, and A/B test results"

"As Features specialist, what's the best way to implement 
automated lead scoring based on engagement metrics?"
```

**Key phrases**: feature, dashboard, analytics, integration, business logic, workflow

#### Data Agent Prompts
```
"Data Agent: Optimize the lead table to handle 10,000+ rows 
with virtual scrolling and efficient filtering"

"As the Data specialist, design the state management for 
real-time collaborative editing of client notes"
```

**Key phrases**: state management, caching, data structure, performance, transformation

### 2. Multi-Agent Collaboration Patterns

#### Sequential Handoff
```
1. "Data Agent: Design the data structure for a new CRM integration"
2. "API Agent: Create the endpoints to sync with the CRM data structure"
3. "Frontend Agent: Build the UI to display and edit CRM records"
4. "Feature Agent: Add automation rules for CRM lead routing"
```

#### Parallel Development
```
"I need a new social media dashboard. 
- Frontend Agent: Mock up the UI with placeholder data
- API Agent: List required endpoints and authentication needs  
- Data Agent: Define data models and caching strategy
- Feature Agent: Specify metrics and KPIs to track"
```

#### Problem-Solving Council
```
"All agents: The portal is slow when loading 500+ invoices.
- Data Agent: Analyze the data flow bottlenecks
- API Agent: Suggest pagination or query optimization
- Frontend Agent: Recommend UI lazy loading strategies
- Feature Agent: Propose UX improvements to reduce load"
```

### 3. Effective Prompt Templates

#### Feature Request Template
```
"[Agent Role]: I need to implement [feature name]
Context: [why this is needed]
Current state: [what exists now]
Desired outcome: [specific goals]
Constraints: [technical/business limitations]
Success metrics: [how to measure success]"
```

#### Bug Fix Template
```
"[Agent Role]: Debug and fix [issue description]
When: [steps to reproduce]
Expected: [correct behavior]
Actual: [current wrong behavior]
Impact: [who/what is affected]
Priority: [urgent/high/medium/low]"
```

#### Enhancement Template
```
"[Agent Role]: Enhance [existing feature]
Current limitations: [what's not working well]
User feedback: [specific complaints/requests]
Proposed improvements: [your initial ideas]
Technical considerations: [performance/compatibility]"
```

### 4. Best Practices for Each Agent

#### Frontend Agent Best Practices
- Always provide visual context (screenshots, mockups)
- Specify responsive breakpoints
- Include accessibility requirements
- Reference existing components to maintain consistency

#### API Agent Best Practices
- Include sample request/response payloads
- Specify authentication requirements
- Define rate limits and caching needs
- Provide error scenarios to handle

#### Features Agent Best Practices
- Start with user stories
- Define success metrics upfront
- Consider phased rollout approach
- Include competitive analysis when relevant

#### Data Agent Best Practices
- Provide data volume estimates
- Specify real-time vs batch requirements
- Include data retention policies
- Define relationships between entities

### 5. Progressive Enhancement Strategy

#### Phase 1: Foundation
```
"Frontend Agent: Create basic layout"
"API Agent: Set up authentication"
"Data Agent: Define core models"
```

#### Phase 2: Core Features
```
"Feature Agent: Implement CRUD operations"
"Frontend Agent: Add interactive elements"
"API Agent: Add search and filtering"
```

#### Phase 3: Advanced Features
```
"Data Agent: Add caching layer"
"Feature Agent: Implement analytics"
"Frontend Agent: Add real-time updates"
```

#### Phase 4: Optimization
```
"All agents: Performance audit and optimization"
"Frontend Agent: Progressive web app features"
"Data Agent: Advanced caching strategies"
```

### 6. Communication Patterns

#### Status Updates
```
"[Agent], provide status on [task]:
- What's completed
- What's in progress  
- Blockers or dependencies
- Next steps"
```

#### Code Review Request
```
"[Agent], review this implementation:
- Does it follow best practices?
- Performance considerations?
- Security vulnerabilities?
- Suggested improvements?"
```

#### Knowledge Transfer
```
"[Agent], document this feature:
- How it works
- Key code locations
- Configuration options
- Common issues and fixes"
```

### 7. Success Metrics

#### Frontend Success
- Page load time < 3 seconds
- Mobile responsive score > 95
- Accessibility compliance
- Consistent design system usage

#### API Success  
- Response time < 200ms
- Error rate < 0.1%
- Token refresh handling
- Proper status codes

#### Feature Success
- User adoption rate
- Task completion time
- Error reduction
- Feature usage analytics

#### Data Success
- Query performance
- Cache hit rate > 80%
- Data integrity
- Efficient memory usage

### 8. Escalation and Collaboration

When to involve multiple agents:
- Cross-cutting concerns (performance, security)
- New feature implementation
- Architecture decisions
- Complex debugging

Example escalation:
```
"This needs multi-agent collaboration:
Frontend + API: Real-time notifications
API + Data: Optimize slow queries  
Frontend + Feature: New user onboarding flow
All agents: Portal performance optimization"
```

### 9. Iterative Development Flow

```
1. Clarify requirements with Feature Agent
2. Design data models with Data Agent
3. Create API contracts with API Agent
4. Build UI with Frontend Agent
5. Integrate and test with all agents
6. Optimize with relevant agents
7. Document with responsible agent
```

### 10. Quick Decision Framework

```
Which agent to ask?
- Visual/UX issue → Frontend Agent
- Can't get data → API Agent  
- Need new capability → Feature Agent
- Slow/inefficient → Data Agent
- Integration issue → Multiple agents
```

Remember: Agents work best when given clear context, specific goals, and measurable success criteria. Don't hesitate to involve multiple agents for complex tasks!