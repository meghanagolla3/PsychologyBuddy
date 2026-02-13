# Labels API Testing Guide

This document provides testing instructions for the Labels Management APIs including Categories, Moods, and Goals.

## Base URL
```
http://localhost:3000/api/labels
```

## Authentication Required
All endpoints require authentication with Admin or SuperAdmin role. Include the session cookie or Bearer token in your requests.

---

## 📂 Categories API

### Endpoints
- `GET /api/labels/categories` - Get all categories
- `POST /api/labels/categories` - Create category
- `GET /api/labels/categories/active` - Get active categories only
- `GET /api/labels/categories/[id]` - Get category by ID
- `PUT /api/labels/categories/[id]` - Update category
- `DELETE /api/labels/categories/[id]` - Delete category
- `PATCH /api/labels/categories/[id]/status` - Update category status

### Test Examples

#### 1. Create Category
```bash
curl -X POST http://localhost:3000/api/labels/categories \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=your-session-id" \
  -d '{
    "name": "Study Skills",
    "status": "ACTIVE"
  }'
```

#### 2. Get All Categories
```bash
curl -X GET http://localhost:3000/api/labels/categories \
  -H "Cookie: sessionId=your-session-id"
```

#### 3. Get Active Categories Only
```bash
curl -X GET http://localhost:3000/api/labels/categories/active \
  -H "Cookie: sessionId=your-session-id"
```

#### 4. Update Category
```bash
curl -X PUT http://localhost:3000/api/labels/categories/[category-id] \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=your-session-id" \
  -d '{
    "name": "Updated Study Skills",
    "status": "INACTIVE"
  }'
```

#### 5. Update Category Status Only
```bash
curl -X PATCH http://localhost:3000/api/labels/categories/[category-id]/status \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=your-session-id" \
  -d '{
    "status": "ACTIVE"
  }'
```

#### 6. Delete Category
```bash
curl -X DELETE http://localhost:3000/api/labels/categories/[category-id] \
  -H "Cookie: sessionId=your-session-id"
```

---

## 😊 Moods API

### Endpoints
- `GET /api/labels/moods` - Get all moods
- `POST /api/labels/moods` - Create mood
- `GET /api/labels/moods/[id]` - Get mood by ID
- `PUT /api/labels/moods/[id]` - Update mood
- `DELETE /api/labels/moods/[id]` - Delete mood

### Test Examples

#### 1. Create Mood
```bash
curl -X POST http://localhost:3000/api/labels/moods \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=your-session-id" \
  -d '{
    "name": "Happy"
  }'
```

#### 2. Get All Moods
```bash
curl -X GET http://localhost:3000/api/labels/moods \
  -H "Cookie: sessionId=your-session-id"
```

#### 3. Update Mood
```bash
curl -X PUT http://localhost:3000/api/labels/moods/[mood-id] \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=your-session-id" \
  -d '{
    "name": "Excited"
  }'
```

#### 4. Delete Mood
```bash
curl -X DELETE http://localhost:3000/api/labels/moods/[mood-id] \
  -H "Cookie: sessionId=your-session-id"
```

---

## 🎯 Goals API

### Endpoints
- `GET /api/labels/goals` - Get all goals
- `POST /api/labels/goals` - Create goal
- `GET /api/labels/goals/[id]` - Get goal by ID
- `PUT /api/labels/goals/[id]` - Update goal
- `DELETE /api/labels/goals/[id]` - Delete goal

### Test Examples

#### 1. Create Goal
```bash
curl -X POST http://localhost:3000/api/labels/goals \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=your-session-id" \
  -d '{
    "name": "Build Confidence"
  }'
```

#### 2. Get All Goals
```bash
curl -X GET http://localhost:3000/api/labels/goals \
  -H "Cookie: sessionId=your-session-id"
```

#### 3. Update Goal
```bash
curl -X PUT http://localhost:3000/api/labels/goals/[goal-id] \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=your-session-id" \
  -d '{
    "name": "Improve Self-Esteem"
  }'
```

#### 4. Delete Goal
```bash
curl -X DELETE http://localhost:3000/api/labels/goals/[goal-id] \
  -H "Cookie: sessionId=your-session-id"
```

---

## 📚 Library Integration Test

### Test Library Metadata Endpoint
```bash
curl -X GET http://localhost:3000/api/library/metadata \
  -H "Cookie: sessionId=your-session-id"
```

This should return:
```json
{
  "success": true,
  "message": "Library metadata retrieved successfully",
  "data": {
    "categories": [...], // Only ACTIVE categories
    "moods": [...],       // All moods
    "goals": [...]        // All goals
  }
}
```

---

## 🔧 Testing with Postman/Insomnia

### Import Collection
You can import the following collection into Postman or Insomnia:

```json
{
  "info": {
    "name": "Labels API",
    "description": "Psychology Buddy Labels Management API"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api/labels"
    },
    {
      "key": "sessionId",
      "value": "your-session-id"
    }
  ],
  "item": [
    {
      "name": "Categories",
      "item": [
        {
          "name": "Get All Categories",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Cookie",
                "value": "sessionId={{sessionId}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/categories",
              "host": ["{{baseUrl}}"],
              "path": ["categories"]
            }
          }
        },
        {
          "name": "Create Category",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Cookie",
                "value": "sessionId={{sessionId}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Study Skills\",\n  \"status\": \"ACTIVE\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/categories",
              "host": ["{{baseUrl}}"],
              "path": ["categories"]
            }
          }
        }
      ]
    },
    {
      "name": "Moods",
      "item": [
        {
          "name": "Get All Moods",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Cookie",
                "value": "sessionId={{sessionId}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/moods",
              "host": ["{{baseUrl}}"],
              "path": ["moods"]
            }
          }
        },
        {
          "name": "Create Mood",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Cookie",
                "value": "sessionId={{sessionId}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Happy\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/moods",
              "host": ["{{baseUrl}}"],
              "path": ["moods"]
            }
          }
        }
      ]
    },
    {
      "name": "Goals",
      "item": [
        {
          "name": "Get All Goals",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Cookie",
                "value": "sessionId={{sessionId}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/goals",
              "host": ["{{baseUrl}}"],
              "path": ["goals"]
            }
          }
        },
        {
          "name": "Create Goal",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Cookie",
                "value": "sessionId={{sessionId}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Build Confidence\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/goals",
              "host": ["{{baseUrl}}"],
              "path": ["goals"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## ✅ Expected Responses

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
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

---

## 🧪 Quick Test Script

Save this as `test-labels-api.sh` and run it:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api/labels"
SESSION_ID="your-session-id"

echo "Testing Labels API..."
echo "===================="

# Test Categories
echo "1. Creating category..."
curl -X POST "$BASE_URL/categories" \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=$SESSION_ID" \
  -d '{"name": "Test Category", "status": "ACTIVE"}' \
  | jq '.'

echo "2. Getting all categories..."
curl -X GET "$BASE_URL/categories" \
  -H "Cookie: sessionId=$SESSION_ID" \
  | jq '.'

# Test Moods
echo "3. Creating mood..."
curl -X POST "$BASE_URL/moods" \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=$SESSION_ID" \
  -d '{"name": "Test Mood"}' \
  | jq '.'

echo "4. Getting all moods..."
curl -X GET "$BASE_URL/moods" \
  -H "Cookie: sessionId=$SESSION_ID" \
  | jq '.'

# Test Goals
echo "5. Creating goal..."
curl -X POST "$BASE_URL/goals" \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=$SESSION_ID" \
  -d '{"name": "Test Goal"}' \
  | jq '.'

echo "6. Getting all goals..."
curl -X GET "$BASE_URL/goals" \
  -H "Cookie: sessionId=$SESSION_ID" \
  | jq '.'

echo "7. Testing library integration..."
curl -X GET "http://localhost:3000/api/library/metadata" \
  -H "Cookie: sessionId=$SESSION_ID" \
  | jq '.'

echo "Test completed!"
```

Make it executable and run:
```bash
chmod +x test-labels-api.sh
./test-labels-api.sh
```

---

## 🔍 Common Issues & Solutions

### 1. Authentication Errors
- Ensure you have a valid session ID
- Check that your user has Admin or SuperAdmin role

### 2. Validation Errors
- Category names must be unique
- Category names max 100 characters
- Status must be "ACTIVE" or "INACTIVE"

### 3. Delete Constraints
- Cannot delete categories/moods/goals used by articles
- Deactivate categories instead of deleting if used

### 4. Permission Errors
- Admin users: Can create, view, update (no delete)
- SuperAdmin users: Full CRUD access

---

## 📝 Notes

- Categories support status (ACTIVE/INACTIVE)
- Moods and Goals are always active (no status field)
- Library metadata only returns ACTIVE categories
- All names must be unique within their type
- Maximum name length: 100 characters
