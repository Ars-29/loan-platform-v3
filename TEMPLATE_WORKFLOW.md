# Template System Workflow Documentation

## Overview

The template system in this banking application follows a **base template + user customization** architecture. Base templates are stored in the `templates` table and remain unchanged, while user customizations are stored separately in the `page_settings` table and merged at runtime.

## Database Architecture

### Core Tables

#### 1. `templates` Table
- **Purpose**: Stores base template definitions
- **Content**: Template structure, colors, typography, layout, content, advanced settings
- **Behavior**: **Read-only** for users - never modified by user actions
- **Fields**:
  - `id`, `name`, `slug`, `description`
  - `colors`, `typography`, `content`, `layout`, `advanced`, `classes` (JSONB)
  - `is_active`, `is_premium`

#### 2. `page_settings` Table
- **Purpose**: Stores user-specific template customizations
- **Content**: User's custom settings merged with base template
- **Behavior**: **Read/Write** - updated when users customize templates
- **Fields**:
  - `company_id`, `officer_id`, `template_id`
  - `template` (slug for quick access)
  - `settings` (JSONB - user customizations)
  - `is_published`, `published_at`

#### 3. `page_settings_versions` Table
- **Purpose**: Version history of user customizations
- **Content**: Snapshots of user settings for rollback capability
- **Behavior**: **Write-only** - created on each save
- **Fields**:
  - `page_settings_id`, `version`, `settings`
  - `is_auto_generated`, `created_at`

## API Endpoints

### 1. `/api/templates` (Basic Templates)
- **Method**: GET
- **Database**: Drizzle ORM → `templates` table
- **Purpose**: Fetch base templates only
- **Returns**: Raw template data
- **Used by**: Template selector components

```typescript
// Example response
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "slug": "template1",
      "name": "Red Theme",
      "colors": { "primary": "#ec4899" },
      "typography": { "fontFamily": "Inter" }
    }
  ]
}
```

### 2. `/api/templates/user` (User Templates)
- **Method**: GET
- **Database**: Supabase client
- **Operations**:
  1. Fetch all active templates from `templates`
  2. Fetch user's custom settings from `page_settings`
  3. Merge base template with user customizations
- **Returns**: 
  - `userTemplate`: Merged template with customizations
  - `availableTemplates`: All base templates
- **Used by**: Profile page, customizer initialization

```typescript
// Example response
{
  "success": true,
  "data": {
    "userTemplate": {
      "slug": "template1",
      "colors": { "primary": "#custom-color" }, // User customized
      "typography": { "fontFamily": "Inter" },  // From base template
      "isUserCustomized": true
    },
    "availableTemplates": [...],
    "userInfo": { "hasCustomSettings": true }
  }
}
```

### 3. `/api/templates/user/[slug]` (Specific User Template)
- **Method**: GET
- **Database**: Supabase client
- **Operations**:
  1. Fetch base template by slug from `templates`
  2. Fetch user customizations from `page_settings`
  3. Merge them together
- **Returns**: Final merged template
- **Used by**: `useEfficientTemplates` hook

### 4. `/api/templates/user` (Save Template Settings)
- **Method**: POST
- **Database**: Supabase client
- **Operations**:
  1. **Update/Insert** `page_settings` table:
     - `template_id`: Reference to base template
     - `template`: Template slug
     - `settings`: User's custom settings (JSON)
     - `is_published`: Publication status
  2. **Insert** into `page_settings_versions`:
     - Create version history entry
     - Store settings snapshot
- **Important**: **Does NOT modify `templates` table**
- **Used by**: Customizer save functionality

```typescript
// Example request
{
  "templateSlug": "template1",
  "customSettings": {
    "colors": { "primary": "#new-color" },
    "typography": { "fontSize": 18 }
  },
  "isPublished": false
}
```

## Frontend Integration

### `useEfficientTemplates` Hook

**Purpose**: Manages template data fetching, caching, and saving

**Key Methods**:
- `fetchTemplate(slug)`: Fetches merged template from API
- `getTemplateSync(slug)`: Gets cached template synchronously
- `saveTemplateSettings(slug, settings)`: Saves user customizations

**Data Flow**:
```typescript
// Fetch template
const templateData = await fetchTemplate('template1');

// Get cached template
const cachedTemplate = getTemplateSync('template1');

// Save customizations
await saveTemplateSettings('template1', {
  colors: { primary: '#new-color' }
});
```

### Profile Page Integration

**Template Selection**:
- Uses `TemplateSelector` component
- Shows available base templates
- Displays user's current selection

**Template Rendering**:
- Uses `useEfficientTemplates` to fetch user's customized template
- Renders components with merged template data
- Real-time updates when template changes

### Customizer Integration

**Initialization**:
- Loads user's existing customizations from `page_settings`
- Displays current settings in UI controls
- Shows live preview of changes

**Real-time Editing**:
- Updates preview as user makes changes
- Maintains custom settings in component state
- No API calls during editing

**Saving**:
- Calls `saveTemplateSettings` with final customizations
- Updates `page_settings` table
- Creates version history entry
- Refreshes cached template data

## Data Merging Logic

### Template Merging Process

```typescript
// Base template from templates table
const baseTemplate = {
  colors: { primary: '#ec4899', secondary: '#3b82f6' },
  typography: { fontFamily: 'Inter', fontSize: 16 }
};

// User customizations from page_settings.settings
const userSettings = {
  colors: { primary: '#custom-color' },
  typography: { fontSize: 18 }
};

// Merged result
const finalTemplate = {
  colors: { 
    primary: '#custom-color',    // User override
    secondary: '#3b82f6'         // From base template
  },
  typography: { 
    fontFamily: 'Inter',         // From base template
    fontSize: 18                 // User override
  }
};
```

### Deep Merge Implementation

```typescript
const deepMerge = (target: any, source: any) => {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
};
```

## Version Control System

### Version History

**Automatic Versioning**:
- Every save creates a new version entry
- Version format: `v{timestamp}`
- Stores complete settings snapshot

**Version Management**:
- Users can rollback to previous versions
- Version history shows creation date
- Auto-generated vs manual versions tracked

### Rollback Capability

```typescript
// Version history structure
{
  "id": "uuid",
  "page_settings_id": "uuid",
  "version": "v1703123456789",
  "settings": { /* complete settings snapshot */ },
  "created_at": "2023-12-21T10:30:56Z"
}
```

## Performance Optimizations

### Caching Strategy

**Frontend Caching**:
- `useEfficientTemplates` caches merged templates in memory
- Avoids redundant API calls
- Cache invalidation on save

**API Caching**:
- Base templates cached at API level
- User settings fetched only when needed
- Efficient database queries with proper indexing

### Database Optimization

**Indexes**:
- `template_slug_idx` on templates.slug
- `page_settings_officer_idx` on page_settings.officer_id
- `page_settings_template_idx` on page_settings.template_id

**Query Optimization**:
- Single query for base template + user settings
- Efficient JSONB operations
- Proper foreign key relationships

## Security Considerations

### Access Control

**User Isolation**:
- Users can only access their own customizations
- Company-level isolation through `company_id`
- Role-based permissions

**Data Validation**:
- Input validation on custom settings
- Sanitization of user-provided content
- Template slug validation

### Data Integrity

**Referential Integrity**:
- Foreign key constraints
- Cascade deletes for cleanup
- Template existence validation

## Error Handling

### API Error Responses

```typescript
// Standard error format
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

### Frontend Error Handling

**Graceful Degradation**:
- Fallback to base template if customizations fail
- Error boundaries for template rendering
- User-friendly error messages

## Best Practices

### Development Guidelines

1. **Never modify base templates directly**
2. **Always merge user settings with base templates**
3. **Use proper error handling for template operations**
4. **Cache template data appropriately**
5. **Validate user input before saving**

### Performance Guidelines

1. **Use efficient database queries**
2. **Implement proper caching strategies**
3. **Minimize API calls during editing**
4. **Use lazy loading for template components**

## Troubleshooting

### Common Issues

**Template Not Loading**:
- Check user authentication
- Verify template slug exists
- Check database connectivity

**Customizations Not Saving**:
- Verify user permissions
- Check API endpoint availability
- Validate custom settings format

**Performance Issues**:
- Check cache implementation
- Verify database indexes
- Monitor API response times

## Future Enhancements

### Planned Features

1. **Template Sharing**: Allow users to share customizations
2. **Template Marketplace**: Community-created templates
3. **Advanced Customization**: More granular control options
4. **Template Analytics**: Usage tracking and optimization

### Technical Improvements

1. **Real-time Collaboration**: Multiple users editing simultaneously
2. **Template Validation**: Automated template testing
3. **Performance Monitoring**: Advanced caching strategies
4. **API Versioning**: Backward compatibility support
