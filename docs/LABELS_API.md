# Labels Management API Documentation

## Overview
The Labels Management API provides endpoints for managing categories, moods, and goals in the psychology buddy application. Both Admin and SuperAdmin roles have full access to all operations.

## File Structure
```
src/components/server/content/labels/
├── category.controller.ts
├── category.service.ts
├── category.validators.ts
├── moods/
│   ├── mood.controller.ts
│   ├── mood.service.ts
│   └── mood.validators.ts
└── goals/
    ├── goal.controller.ts
    ├── goal.service.ts
    └── goal.validators.ts
```

## API Endpoints

### Categories
- **Base URL:** `/api/categories`
- **Features:** Has status (ACTIVE/INACTIVE) for filtering

#### Endpoints:
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `GET /api/categories/[id]` - Get category by ID
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category
- `GET /api/categories/active` - Get active categories only
- `PATCH /api/categories/[id]/status` - Update category status

### Moods
- **Base URL:** `/api/moods`
- **Features:** No status field (always active)

#### Endpoints:
- `GET /api/moods` - Get all moods
- `POST /api/moods` - Create mood
- `GET /api/moods/[id]` - Get mood by ID
- `PUT /api/moods/[id]` - Update mood
- `DELETE /api/moods/[id]` - Delete mood

### Goals
- **Base URL:** `/api/goals`
- **Features:** No status field (always active)

#### Endpoints:
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `GET /api/goals/[id]` - Get goal by ID
- `PUT /api/goals/[id]` - Update goal
- `DELETE /api/goals/[id]` - Delete goal

## Schema Differences

### Categories
```json
{
  "name": "Study Skills",
  "status": "ACTIVE" // or "INACTIVE"
}
```

### Moods & Goals
```json
{
  "name": "Happy" // or "Confidence", etc.
}
```

## Integration with Library
- Categories: Only ACTIVE categories appear in library dropdowns
- Moods: All moods appear in library dropdowns
- Goals: All goals appear in library dropdowns
- Library metadata endpoint: `/api/library/metadata`

## Permissions
- **Admin:** Can view, create, update categories, moods, goals (no delete)
- **SuperAdmin:** Can view, create, update, delete all labels

## Error Handling
All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": 400,
    "type": "ErrorType"
  }
}
```

## Common Error Scenarios
- **409 Conflict:** Name already exists
- **400 Bad Request:** Cannot delete item used by articles
- **404 Not Found:** Item not found
- **500 Internal Server Error:** Database or server error
