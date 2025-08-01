# Mach Five Group Client Portal

## Overview
This is a single-page application (SPA) that serves as a client portal for Mach Five Group. The portal is a monorepo containing both the API backend and the frontend application, served from an API endpoint. It provides marketing services management, billing, reporting, and collaboration tools for clients across the Mach Five Group ecosystem.

## Tech Stack
- **Frontend**: Vanilla JavaScript (no framework dependencies)
- **UI Library**: Neodigm UX v3.1
- **Authentication**: JWT tokens
- **Database**: PostgreSQL (user management, roles)
- **API**: RESTful API at https://m5t-client-portal.onrender.com/
- **Data Visualization**: ECharts 5.4.3

## Architecture

### Frontend Structure
The entire UI exists in a single HTML file: `/tmpl/client_portal.html`

Key components:
- **Neodigm Components**: Custom web components for UI elements
- **Carousel Navigation**: Main content area with multiple pages
- **Role-Based Access**: Content visibility based on user roles

### API Structure
Base URL: `https://m5t-client-portal.onrender.com/v1/`

Key endpoints:
- `/app/signin` - User authentication
- `/acct/*` - Account management operations
- `/app/SessionAppMeta` - Application metadata
- `/app/lgo/` - Logo/branding assets
- `/app/img/` - Image assets

## User Roles Hierarchy
1. **sys_admin_role** - System administrator
2. **admin_role** - Internal admin user
3. **staff_role** - Internal staff user
4. **client_admin_role** - External client admin (one per company)
5. **client_standard_role** - External client user

## Key Features

### For Marketing Clients
- **Home Dashboard**: Client score visualization, pending deliverables, team contacts
- **Files**: Upload/download via Synology integration
- **Billing**: Invoice management and tracking
- **FAQ**: Self-service help content
- **Deliverables**: Service-specific content and assets

### For Staff/Admin
- **Gnosis**: Analytics dashboard (staff only)
- **User Management**: Create/edit/delete users
- **Intake Forms**: Client onboarding questionnaires
- **Service Management**: Enable/disable client services
- **Multi-Brand Support**: Manage clients across Tech, Marketing, and future sub-brands

## Core Classes/APIs

### IDPAPI
Main API interface class handling:
- Authentication (`doSignin`, `setStateSignin`)
- Entity CRUD operations
- Token management
- Headers generation with role/company context

### SessionAcctEntity
Manages current user session and entity relationships:
- User profile data
- Company hierarchy
- Service subscriptions
- Invoice data

### ServiceDeliverables
Handles service and deliverable management:
- Service card generation
- Deliverable counting
- Dynamic content based on subscriptions

## Authentication Flow
1. User enters email on signin page
2. User enters password
3. API validates credentials and returns JWT tokens
4. Tokens stored in localStorage as "tjo" (token object)
5. All subsequent API calls include Bearer token

## Key UI Components

### Navigation
- Left sidebar with collapsible states (0, 1, 2)
- Primary navigation: Home, Files, Billing, FAQ, Gnosis
- Service-specific navigation dynamically generated

### Data Tables
- Neodigm Picnic component for sortable/filterable tables
- Export functionality (JSON format)
- Row selection and detail view

### Forms
- Intake form for client onboarding
- User creation/edit forms
- Dynamic service selection

## Upcoming Feature: Lead Magnet Widget
The portal will include a lead generation widget that:
- Loads on marketing client websites
- Captures visitor actions (forms, scheduling, Q&A)
- Dashboards engagement metrics in the portal
- Provides real-time lead tracking

## Development Notes

### Naming Conventions
- Element IDs: `js-[component]-[purpose]--[modifier]`
- CSS classes: `l-` for layout, `h-` for helpers
- Data attributes: `data-n55-*` for Neodigm components

### State Management
- Role-based visibility via `n55RoleDisplayNone` class
- Service enablement via `data-form-service-enabled`
- Navigation state in `data-n55-leftnav-state`

### Security Considerations
- JWT token refresh not implemented (uses placeholder)
- Role validation on both client and server
- Company-based data isolation

## Testing & Deployment

### Key Commands to Run
When making changes, ensure code quality by running:
```bash
# Add lint and typecheck commands here when provided by user
# Example:
# npm run lint
# npm run typecheck
```

### Environment
- Platform: Darwin (macOS)
- Working directory: `/Users/nicholaskrause/2025/m5t_client_portal`
- Git repository: Yes
- Main branch: main

## Branding Strategy
- **Parent Brand**: Mach Five Group (overarching entity)
- **Sub-Brands**: 
  - Mach Five Tech (technology services)
  - Mach Five Marketing (marketing services)
- Portal branded as "Mach Five Portal" to serve all sub-brands
- Initial implementation focuses on marketing services
- Marketing-specific features for machfivemarketing.com clients
- Portal designed to accommodate future expansion to Tech and other sub-brand services

## Specialized Agents Available
- **Frontend Agent** (`CLAUDE_FRONTEND.md`) - UI/UX and Neodigm implementation
- **API Agent** (`CLAUDE_API.md`) - Endpoint integration and authentication
- **Features Agent** (`CLAUDE_FEATURES.md`) - Business logic and new features
- **Data Agent** (`CLAUDE_DATA.md`) - State management and data flow
- **Prompt Engineer** (`CLAUDE_PROMPT_ENGINEER.md`) - Transform requests into structured prompts
- **UI & Branding Agent** (`CLAUDE_UI_BRANDING.md`) - Visual consistency and role-based visibility