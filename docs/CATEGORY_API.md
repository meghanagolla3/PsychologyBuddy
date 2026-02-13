# Category Management API Documentation

## Overview
The Category Management API provides endpoints for managing categories in the psychology buddy application. Both Admin and SuperAdmin roles have full access to all operations.

## Base URL
```
/api/admin/content/categories
```

## Endpoints

### 1. Get All Categories
- **URL:** `GET /api/admin/content/categories`
- **Permissions:** `PSYCHO_EDUCATION.VIEW`
- **Access:** Admin & SuperAdmin
- **Response:** Array of all categories (ACTIVE first, then INACTIVE)

### 2. Get Active Categories Only
- **URL:** `GET /api/admin/content/categories/active`
- **Permissions:** `PSYCHO_EDUCATION.VIEW`
- **Access:** Admin & SuperAdmin
- **Response:** Array of active categories only (for dropdowns)

### 3. Create Category
- **URL:** `POST /api/admin/content/categories`
- **Permissions:** `PSYCHO_EDUCATION.CREATE`
- **Access:** Admin & SuperAdmin
- **Body:**
```json
{
  "name": "Study Skills",
  "status": "ACTIVE"
}
```

### 4. Get Category by ID
- **URL:** `GET /api/admin/content/categories/[id]`
- **Permissions:** `PSYCHO_EDUCATION.VIEW`
- **Access:** Admin & SuperAdmin
- **Response:** Single category details

### 5. Update Category
- **URL:** `PUT /api/admin/content/categories/[id]`
- **Permissions:** `PSYCHO_EDUCATION.UPDATE`
- **Access:** Admin & SuperAdmin
- **Body:**
```json
{
  "name": "Updated Category Name",
  "status": "INACTIVE"
}
```

### 6. Update Category Status
- **URL:** `PATCH /api/admin/content/categories/[id]/status`
- **Permissions:** `PSYCHO_EDUCATION.UPDATE`
- **Access:** Admin & SuperAdmin
- **Body:**
```json
{
  "status": "ACTIVE"
}
```

### 7. Delete Category
- **URL:** `DELETE /api/admin/content/categories/[id]`
- **Permissions:** `PSYCHO_EDUCATION.DELETE`
- **Access:** Admin & SuperAdmin
- **Response:** Success confirmation
- **Note:** Cannot delete categories that are being used by articles

## Schema Fields
- **name:** Required string, max 100 characters, must be unique
- **status:** Required enum, either "ACTIVE" or "INACTIVE"
  - ACTIVE: Category appears in article filters and dropdowns
  - INACTIVE: Category is hidden from filters and dropdowns

## Integration with Library
- Categories are automatically available in the library metadata endpoint
- Only ACTIVE categories are returned for article creation/update forms
- Category status changes immediately affect availability in the library

## File Structure
```
src/components/server/content/
├── library/
│   ├── library.controller.ts
│   ├── library.service.ts
│   └── library.validators.ts
└── categories/
    ├── category.controller.ts
    ├── category.service.ts
    └── category.validators.ts
```

## Permissions
- **Admin:** Can view, create, update categories (no delete)
- **SuperAdmin:** Can view, create, update, and delete categories

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
- **409 Conflict:** Category name already exists
- **400 Bad Request:** Cannot delete category used by articles
- **404 Not Found:** Category not found
- **500 Internal Server Error:** Database or server error
