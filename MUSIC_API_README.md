# 🎵 Music API Documentation

A comprehensive music therapy API system for the Psychology Buddy platform, allowing admins to manage music resources and students to access therapeutic music content.

## 📋 Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Database Schema](#database-schema)
- [Admin APIs](#admin-apis)
- [Student APIs](#student-apis)
- [Postman Testing](#postman-testing)
- [Error Handling](#error-handling)
- [Security](#security)

---

## 🎯 Overview

The Music API provides a complete music therapy management system with:

- **Admin Features**: Full CRUD operations for music resources, categories, goals, and instructions
- **Student Features**: Browse, search, and access published music content
- **Security**: Role-based access control and content filtering
- **Scalability**: Pagination, filtering, and search capabilities

---

## 🚀 Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Prisma ORM configured
- Authentication middleware (for production)

### Environment Variables
```env
DATABASE_URL=your_postgresql_connection_string
```

### Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed initial data (optional)
npx prisma db seed
```

---

## 🗄 Database Schema

### Core Models

#### MusicResource
```typescript
{
  id: string
  title: string
  description?: string
  url: string
  duration?: number (seconds)
  artist?: string
  album?: string
  coverImage?: string
  isPublic: boolean
  schoolId?: string
  status: "DRAFT" | "PUBLISHED"
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### MusicCategory
```typescript
{
  id: string
  name: string (unique)
  description?: string
  icon?: string
  color?: string
  status: "ACTIVE" | "INACTIVE"
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### MusicGoal
```typescript
{
  id: string
  name: string (unique)
  description?: string
  icon?: string
  color?: string
  status: "ACTIVE" | "INACTIVE"
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Relationships
- **MusicResource ↔ MusicCategory**: Many-to-many
- **MusicResource ↔ MusicGoal**: Many-to-many
- **MusicResource → School**: Many-to-one (optional)

---

## 🔧 Admin APIs

### Music Resources

#### Create Music Resource
```http
POST /api/admin/music/resources
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "title": "Relaxing Piano Melody",
  "description": "Calming instrumental music for relaxation",
  "url": "https://example.com/audio.mp3",
  "duration": 180,
  "artist": "Peaceful Piano",
  "album": "Relaxation Collection",
  "coverImage": "https://example.com/thumbnail.jpg",
  "isPublic": true,
  "status": "PUBLISHED",
  "categoryIds": ["category_id_1"],
  "goalIds": ["goal_id_1"]
}
```

#### Get Music Resources
```http
GET /api/admin/music/resources?category=Classical&goal=stress-relief&status=PUBLISHED&page=1&limit=20
Authorization: Bearer {admin_token}
```

#### Update Music Resource
```http
PATCH /api/admin/music/resources?id=music_id
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "title": "Updated Title",
  "status": "PUBLISHED"
}
```

#### Delete Music Resource
```http
DELETE /api/admin/music/resources?id=music_id
Authorization: Bearer {admin_token}
```

### Music Categories

#### Create Category
```http
POST /api/admin/music/categories
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "name": "Classical",
  "description": "Classical music for relaxation",
  "icon": "music-note",
  "color": "#3B82F6",
  "status": "ACTIVE"
}
```

#### Get Categories
```http
GET /api/admin/music/categories?status=ACTIVE
Authorization: Bearer {admin_token}
```

#### Update Category
```http
PATCH /api/admin/music/categories?id=category_id
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "name": "Updated Category Name"
}
```

#### Delete Category
```http
DELETE /api/admin/music/categories?id=category_id
Authorization: Bearer {admin_token}
```

### Music Goals

#### Create Goal
```http
POST /api/admin/music/goals
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "name": "Stress Relief",
  "description": "Music to help reduce stress",
  "icon": "heart",
  "color": "#10B981"
}
```

#### Get Goals
```http
GET /api/admin/music/goals?status=ACTIVE
Authorization: Bearer {admin_token}
```

#### Update Goal
```http
PATCH /api/admin/music/goals?id=goal_id
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "name": "Updated Goal Name"
}
```

#### Delete Goal
```http
DELETE /api/admin/music/goals?id=goal_id
Authorization: Bearer {admin_token}
```

---

## 🎧 Student APIs

### Music Resources

#### Get All Music Resources
```http
GET /api/student/music/resources?category=Classical&goal=stress-relief&page=1&limit=20
Authorization: Bearer {student_token}
```

#### Get Single Music Resource
```http
GET /api/student/music/resources?id=music_id
Authorization: Bearer {student_token}
```

#### Get Music by Category
```http
GET /api/student/music/category?category=Classical&goal=stress-relief&page=1&limit=20
Authorization: Bearer {student_token}
```

#### Get Music by Goal
```http
GET /api/student/music/goal?goal=stress-relief&category=Classical&page=1&limit=20
Authorization: Bearer {student_token}
```

#### Get Featured Music
```http
GET /api/student/music/featured?limit=10
Authorization: Bearer {student_token}
```

#### Search Music
```http
GET /api/student/music/search?query=relaxing&page=1&limit=20
Authorization: Bearer {student_token}
```

#### Get Recommended Music
```http
GET /api/student/music/recommended?limit=10&mood=calm&goal=stress-relief
Authorization: Bearer {student_token}
```

### Discovery Endpoints

#### Get Categories
```http
GET /api/student/music/categories
Authorization: Bearer {student_token}
```

#### Get Goals
```http
GET /api/student/music/goals
Authorization: Bearer {student_token}
```

---

## 🧪 Postman Testing

### 1. Import Collection

Download the Postman collection JSON:

```json
{
  "info": {
    "name": "Music API",
    "description": "Complete Music Therapy API Collection",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "adminToken",
      "value": "your_admin_jwt_token",
      "type": "string"
    },
    {
      "key": "studentToken",
      "value": "your_student_jwt_token",
      "type": "string"
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{adminToken}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Admin - Music Resources",
      "item": [
        {
          "name": "Create Music Resource",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Relaxing Piano Melody\",\n  \"description\": \"Calming instrumental music for relaxation\",\n  \"url\": \"https://example.com/audio.mp3\",\n  \"duration\": 180,\n  \"artist\": \"Peaceful Piano\",\n  \"album\": \"Relaxation Collection\",\n  \"coverImage\": \"https://example.com/thumbnail.jpg\",\n  \"isPublic\": true,\n  \"status\": \"PUBLISHED\",\n  \"categoryIds\": [\"category_id_1\"],\n  \"goalIds\": [\"goal_id_1\"]\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/admin/music/resources"
            }
          }
        },
        {
          "name": "Get Music Resources",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/admin/music/resources?page=1&limit=20"
            }
          }
        }
      ]
    },
    {
      "name": "Student - Music Access",
      "item": [
        {
          "name": "Get All Music Resources",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/student/music/resources?page=1&limit=20"
            }
          }
        },
        {
          "name": "Get Featured Music",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/student/music/featured?limit=10"
            }
          }
        }
      ]
    }
  ]
}
```

### 2. Setup Environment

1. **Create Environment Variables**:
   - `baseUrl`: `http://localhost:3000` (or your server URL)
   - `adminToken`: Your admin JWT token
   - `studentToken`: Your student JWT token

2. **Configure Authentication**:
   - Set Authorization type to `Bearer Token`
   - Use `{{adminToken}}` for admin endpoints
   - Use `{{studentToken}}` for student endpoints

### 3. Test Workflow

#### **Admin Testing Flow**:

1. **Create Category**:
   ```http
   POST /api/admin/music/categories
   {
     "name": "Classical",
     "description": "Classical music for relaxation",
     "icon": "music-note",
     "color": "#3B82F6"
   }
   ```

2. **Create Goal**:
   ```http
   POST /api/admin/music/goals
   {
     "name": "Stress Relief",
     "description": "Music to help reduce stress",
     "icon": "heart",
     "color": "#10B981"
   }
   ```

3. **Create Music Resource**:
   ```http
   POST /api/admin/music/resources
   {
     "title": "Relaxing Piano Melody",
     "description": "Calming instrumental music",
     "url": "https://example.com/audio.mp3",
     "duration": 180,
     "artist": "Peaceful Piano",
     "status": "PUBLISHED",
     "categoryIds": ["category_id_from_step_1"],
     "goalIds": ["goal_id_from_step_2"]
   }
   ```

4. **Get Resources**:
   ```http
   GET /api/admin/music/resources?status=PUBLISHED
   ```

#### **Student Testing Flow**:

1. **Get Categories**:
   ```http
   GET /api/student/music/categories
   ```

2. **Get Goals**:
   ```http
   GET /api/student/music/goals
   ```

3. **Get Featured Music**:
   ```http
   GET /api/student/music/featured?limit=5
   ```

4. **Search Music**:
   ```http
   GET /api/student/music/search?query=relaxing
   ```

5. **Get Music by Category**:
   ```http
   GET /api/student/music/category?category=Classical
   ```

### 4. Test Scripts

**Response Time Test**:
```javascript
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

**Status Code Test**:
```javascript
pm.test("Status code is 200", function () {
    pm.expect(pm.response.code).to.equal(200);
});
```

**Response Structure Test**:
```javascript
pm.test("Response has correct structure", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData).to.have.property('message');
    if (jsonData.success) {
        pm.expect(jsonData).to.have.property('data');
    }
});
```

---

## 🚨 Error Handling

### Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common Error Codes

| Status | Error | Description |
|---------|--------|-------------|
| 400 | Bad Request | Invalid input data or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server | Server error occurred |

### Validation Errors
```json
{
  "success": false,
  "message": "Invalid request data",
  "error": "Title is required and must be less than 200 characters"
}
```

---

## 🔒 Security

### Authentication
- **JWT Bearer Tokens** required for all endpoints
- **Role-based access** (Admin vs Student)
- **Session validation** for user context

### Authorization
- **Admin Access**: Full CRUD operations
- **Student Access**: Read-only access to published content
- **Content Filtering**: Students cannot access DRAFT resources

### Data Protection
- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Prevention**: Proper response sanitization

---

## 📊 Usage Examples

### **cURL Examples**

#### Create Music Resource (Admin)
```bash
curl -X POST http://localhost:3000/api/admin/music/resources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_admin_token" \
  -d '{
    "title": "Ocean Waves",
    "description": "Calming ocean sounds",
    "url": "https://example.com/ocean.mp3",
    "duration": 300,
    "artist": "Nature Sounds",
    "status": "PUBLISHED"
  }'
```

#### Get Featured Music (Student)
```bash
curl -X GET "http://localhost:3000/api/student/music/featured?limit=5" \
  -H "Authorization: Bearer your_student_token"
```

### **JavaScript Examples**

#### Admin - Create Resource
```javascript
const createMusicResource = async (resourceData) => {
  const response = await fetch('/api/admin/music/resources', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(resourceData)
  });
  
  const result = await response.json();
  return result;
};
```

#### Student - Get Music
```javascript
const getMusicResources = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/student/music/resources?${params}`, {
    headers: {
      'Authorization': `Bearer ${studentToken}`
    }
  });
  
  const result = await response.json();
  return result;
};
```

---

## 🎯 Next Steps

1. **Authentication Integration**: Implement proper JWT middleware
2. **File Upload**: Add audio file upload capability
3. **Analytics**: Track music usage and engagement
4. **Recommendations**: AI-powered music suggestions
5. **Offline Support**: Download capabilities for mobile

---

## 📞 Support

For issues or questions:
- Check the error responses for detailed information
- Verify authentication tokens are valid
- Ensure database is properly configured
- Review the validation schemas for required fields

---

*Music API v1.0 - Complete therapeutic music management system* 🎵
