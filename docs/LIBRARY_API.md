# Psychoeducation Library API Documentation

## Overview
The Psychoeducation Library API provides endpoints for managing articles in the psychology buddy application. Both Admin and SuperAdmin roles have full access to all operations.

## Base URL
```
/api/library
```

## Endpoints

### 1. Get All Articles
- **URL:** `GET /api/library`
- **Permissions:** `PSYCHO_EDUCATION.VIEW`
- **Access:** Admin & SuperAdmin
- **Response:** Array of articles with relations

### 2. Create Article
- **URL:** `POST /api/library`
- **Permissions:** `PSYCHO_EDUCATION.CREATE`
- **Access:** Admin & SuperAdmin
- **Body:**
```json
{
  "title": "Article Title",
  "author": "Dr. Jane Smith",
  "thumbnailUrl": "https://example.com/image.jpg",
  "readTime": 5,
  "description": "Short description",
  "categoryIds": ["category-id-1"],
  "moodIds": ["mood-id-1"],
  "goalIds": ["goal-id-1"],
  "status": "DRAFT"
}
```

### 3. Get Article by ID
- **URL:** `GET /api/library/[id]`
- **Permissions:** `PSYCHO_EDUCATION.VIEW`
- **Access:** Admin & SuperAdmin
- **Response:** Single article with relations

### 4. Update Article
- **URL:** `PUT /api/library/[id]`
- **Permissions:** `PSYCHO_EDUCATION.UPDATE`
- **Access:** Admin & SuperAdmin
- **Body:** Same as create, all fields optional

### 5. Delete Article
- **URL:** `DELETE /api/library/[id]`
- **Permissions:** `PSYCHO_EDUCATION.DELETE`
- **Access:** Admin & SuperAdmin
- **Response:** Success confirmation

### 6. Get Library Metadata
- **URL:** `GET /api/library/metadata`
- **Permissions:** `PSYCHO_EDUCATION.VIEW`
- **Access:** Admin & SuperAdmin
- **Response:** Categories, moods, and goals for dropdowns

## Schema Fields
All form fields from the image are supported:
- **Thumbnail:** PNG/JPG up to 2MB (stored as URL)
- **Article Title:** Required string
- **Author:** Required string
- **Read Time:** Optional integer (minutes)
- **Short Description:** Required string
- **Category:** Optional array of category IDs
- **Supported Moods:** Optional array of mood IDs
- **Goal:** Optional array of goal IDs
- **Status:** DRAFT, PUBLISHED, or ARCHIVED

## Permissions
- **Admin:** Can view, create, update articles (no delete)
- **SuperAdmin:** Can view, create, update, and delete articles

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
