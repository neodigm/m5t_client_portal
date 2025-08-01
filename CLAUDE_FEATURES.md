# Feature Development Agent - Mach Five Portal

## Role
Specialist in implementing new features and business logic for the Mach Five Portal, focusing on marketing services functionality.

## Primary Responsibilities
- Implement new business features
- Create data visualizations and dashboards
- Develop lead generation tools
- Build reporting functionality
- Integrate third-party services

## Current Features

### 1. Lead Magnet Widget
- Real-time lead tracking dashboard
- Widget implementation code generator
- Lead type analytics (pie charts)
- Activity table with export functionality
- Conversion rate tracking

### 2. Client Score System
- Visual gauge display (0-100)
- Automated scoring based on:
  - Service utilization
  - Invoice payment history
  - User engagement
  - Support ticket resolution

### 3. Service Management
- Dynamic service cards
- Deliverable tracking
- Service-specific navigation
- Enable/disable per client

### 4. Billing Integration
- Invoice listing and filtering
- Payment status tracking
- Export to JSON/CSV
- Payment history

## Feature Templates

### Adding a New Dashboard Widget
```javascript
// 1. Add navigation item
<a id="js-left-nav__caro_[feature]" 
   onClick="doClick_CaroNav(this, 'caro_[feature]')">
   <span>[Feature Name]</span>
</a>

// 2. Add carousel page
<section data-n55-carousel-page-name="caro_[feature]">
    <section class="pfmf-grid pfmf-grid__100">
        <!-- Feature content -->
    </section>
</section>

// 3. Add data initialization
loadWhenCaroChange('caro_[feature]', () => {
    // Initialize feature data
});
```

### Creating KPI Cards
```html
<neodigm-kpi data-n55-kpi 
             data-n55-kpi-percent="false" 
             data-n55-theme="primary">
    <h5>1,247</h5>
    <h6>Metric Label</h6>
</neodigm-kpi>
```

## Upcoming Features

### Phase 1: Lead Generation
- [x] Lead magnet widget dashboard
- [ ] Real-time lead notifications
- [ ] Lead scoring algorithm
- [ ] Automated lead routing

### Phase 2: Analytics Enhancement
- [ ] Custom report builder
- [ ] Automated insights generation
- [ ] Competitor tracking
- [ ] ROI calculators

### Phase 3: Automation
- [ ] Email campaign integration
- [ ] Social media scheduling
- [ ] Review management
- [ ] Chat widget integration

## Integration Points

### External Services
- Synology (file storage)
- Google Analytics
- Facebook Ads
- Google Ads
- Email platforms

### Data Sources
- CRM systems
- Payment processors
- Analytics platforms
- Social media APIs

## Best Practices
1. Use existing UI patterns
2. Implement loading states
3. Add data export options
4. Include help tooltips
5. Make features role-aware

## Testing Checklist
- [ ] Feature works in all nav states
- [ ] Data loads correctly
- [ ] Export functionality works
- [ ] Mobile responsive
- [ ] Role permissions respected
- [ ] Error states handled