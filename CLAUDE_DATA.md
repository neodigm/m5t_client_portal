# Data Management Agent - Mach Five Portal

## Role
Specialist in data structures, state management, and data flow within the Mach Five Portal application.

## Primary Responsibilities
- Manage application state
- Handle data transformations
- Implement caching strategies
- Ensure data integrity
- Optimize data queries

## Core Data Structures

### User Entity
```javascript
{
    "guid": "uuid-v4",
    "email": "user@example.com",
    "first": "John",
    "last": "Doe",
    "company": "company-guid",
    "role": "client_standard_role",
    "parent": "parent-company-guid",
    "is_active": true,
    "last_login": "2024-03-15T14:30:00Z",
    "created_time": "2024-01-01T00:00:00Z"
}
```

### Service Entity
```javascript
{
    "guid": "uuid-v4",
    "name": "SEO Optimization",
    "description": "Search engine optimization services",
    "category": "digital_marketing",
    "price": 1500.00,
    "billing_cycle": "monthly",
    "is_active": true,
    "company": "company-guid"
}
```

### Invoice Entity
```javascript
{
    "guid": "uuid-v4",
    "invoice_number": "INV-2024-001",
    "amount": 1500.00,
    "status": "paid|pending|overdue",
    "due_date": "2024-04-01",
    "company": "company-guid",
    "services": ["service-guid-1", "service-guid-2"]
}
```

### Lead Entity
```javascript
{
    "guid": "uuid-v4",
    "timestamp": "2024-03-15T14:30:00Z",
    "website": "clientsite.com",
    "lead_type": "quote_request|schedule_call|newsletter|contact",
    "contact_info": {
        "email": "lead@example.com",
        "name": "Lead Name",
        "phone": "+1234567890"
    },
    "status": "new|contacted|qualified|converted",
    "score": 85,
    "company": "company-guid"
}
```

## Session Management

### SessionAcctEntity
- Current user profile
- Company hierarchy
- Role permissions
- Service subscriptions

### Token Object (TJO)
```javascript
{
    "access_token": "jwt-token",
    "refresh_token": "refresh-jwt",
    "expires_in": 3600,
    "user_guid": "user-uuid",
    "company": "company-uuid",
    "role": "client_standard_role"
}
```

## Data Flow Patterns

### 1. Authentication Flow
```
User Login -> API Validation -> Token Generation -> 
Session Init -> Role Detection -> UI Adaptation
```

### 2. Data Loading Pattern
```javascript
// Check cache first
if (SessionCache.has('entities')) {
    return SessionCache.get('entities');
}

// Fetch from API
IDPAPI.readEntities((data) => {
    SessionCache.set('entities', data);
    updateUI(data);
});
```

### 3. Real-time Updates
```javascript
// Polling pattern for lead updates
setInterval(() => {
    IDPAPI.getLeadUpdates((leads) => {
        updateLeadMetrics(leads);
        refreshLeadTable(leads);
    });
}, 30000); // 30 seconds
```

## Caching Strategy

### Cache Keys
- `entities_[role]` - User lists by role
- `services_[company]` - Company services
- `invoices_[parent]` - Company invoices
- `leads_[timeframe]` - Lead data

### Cache Invalidation
- On user actions (create/update/delete)
- On role change
- On company switch
- After 15 minutes (configurable)

## Data Transformations

### Picnic Table Format
```javascript
// Transform entities to table rows
const tableData = entities.map(entity => [
    entity.company_name,
    `${entity.first} ${entity.last}`,
    entity.role,
    formatDate(entity.last_login)
]);
```

### Chart Data Format
```javascript
// Transform for ECharts
const chartData = leads.reduce((acc, lead) => {
    const type = lead.lead_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
}, {});
```

## Best Practices
1. Always validate data before display
2. Use defensive programming for nested objects
3. Implement proper error boundaries
4. Cache expensive operations
5. Clear sensitive data on logout

## Performance Optimization
- Lazy load large datasets
- Implement virtual scrolling for tables
- Use debouncing for search inputs
- Batch API requests when possible
- Minimize DOM updates