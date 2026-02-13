# Meditation Tool APIs

## Overview
The Meditation Tool provides comprehensive meditation resource management with full CRUD operations for admins and read-only access for students. The tool supports different meditation types, categories, and goals with proper authentication and authorization.

## Schema

### Meditation Resource
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "thumbnailUrl": "string?",
  "format": "AUDIO | VIDEO | TEXT",
  "audioUrl": "string?",
  "videoUrl": "string?",
  "durationSec": "number?",
  "instructor": "string?",
  "type": "GUIDED | MUSIC | BREATHING | BODY_SCAN",
  "category": "string?",
  "goal": "string?",
  "status": "DRAFT | PUBLISHED",
  "schoolId": "string?",
  "createdBy": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Meditation Types
- **GUIDED**: Guided meditation sessions with instructor
- **MUSIC**: Background music for meditation
- **BREATHING**: Breathing exercises and techniques
- **BODY_SCAN**: Body scan meditation practices

### Meditation Formats
- **AUDIO**: Audio-only meditation sessions
- **VIDEO**: Video meditation sessions
- **TEXT**: Text-based meditation guides

---

## Admin APIs

### Meditation Categories Management

#### Create Category
```
POST /api/admin/meditation/categories
```

**Body:**
```json
{
  "name": "Mindfulness",
  "description": "Mindfulness meditation practices",
  "icon": "mindfulness-icon",
  "color": "#4CAF50",
  "status": "ACTIVE"
}
```

#### Get Categories
```
GET /api/admin/meditation/categories?page=1&limit=20&search=mindfulness&status=ACTIVE
```

#### Get Category by ID
```
GET /api/admin/meditation/categories?id=category_id
```

#### Update Category
```
PATCH /api/admin/meditation/categories?id=category_id
```

**Body:**
```json
{
  "name": "Updated Mindfulness",
  "description": "Updated description",
  "status": "ACTIVE"
}
```

#### Delete Category
```
DELETE /api/admin/meditation/categories?id=category_id
```

### Meditation Goals Management

#### Create Goal
```
POST /api/admin/meditation/goals
```

**Body:**
```json
{
  "name": "Stress Reduction",
  "description": "Reduce stress and anxiety",
  "icon": "stress-icon",
  "color": "#2196F3"
}
```

#### Get Goals
```
GET /api/admin/meditation/goals?page=1&limit=20&search=stress
```

#### Get Goal by ID
```
GET /api/admin/meditation/goals?id=goal_id
```

#### Update Goal
```
PATCH /api/admin/meditation/goals?id=goal_id
```

**Body:**
```json
{
  "name": "Updated Stress Reduction",
  "description": "Updated description"
}
```

#### Delete Goal
```
DELETE /api/admin/meditation/goals?id=goal_id
```

### Meditation Resources Management

#### Create Meditation
```
POST /api/admin/meditation
```

**Body:**
```json
{
  "title": "Morning Mindfulness",
  "description": "A gentle morning meditation to start your day",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "format": "AUDIO",
  "audioUrl": "https://example.com/meditation.mp3",
  "durationSec": 600,
  "instructor": "Jane Doe",
  "type": "GUIDED",
  "categoryIds": ["category_id_1", "category_id_2"],
  "goalIds": ["goal_id_1"],
  "status": "PUBLISHED"
}
```

### Get Meditations
```
GET /api/admin/meditation?page=1&limit=20&search=mindfulness&type=GUIDED&status=PUBLISHED
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search in title, description, instructor
- `type`: Filter by meditation type
- `status`: Filter by status (DRAFT | PUBLISHED)
- `categoryId`: Filter by category ID
- `goalId`: Filter by goal ID
- `schoolId`: Filter by school ID

### Get Single Meditation
```
GET /api/admin/meditation?id=meditation_id
```

### Update Meditation
```
PATCH /api/admin/meditation?id=meditation_id
```

**Body:**
```json
{
  "title": "Updated Morning Mindfulness",
  "description": "Updated description",
  "status": "PUBLISHED"
}
```

### Delete Meditation
```
DELETE /api/admin/meditation?id=meditation_id
```

### Get Meditations by Type
```
GET /api/admin/meditation/type/GUIDED?page=1&limit=20
```

### Get Meditations by Category
```
GET /api/admin/meditation/category/Mindfulness?page=1&limit=20
```

### Get Meditations by Goal
```
GET /api/admin/meditation/goal/Stress%20Reduction?page=1&limit=20
```

---

## Student APIs (Read-only)

### Meditation Categories Access

#### Get Categories
```
GET /api/student/meditation/categories?page=1&limit=20&search=mindfulness
```

**Note:** Students only see categories with status "ACTIVE"

#### Get Category by ID
```
GET /api/student/meditation/categories?id=category_id
```

### Meditation Goals Access

#### Get Goals
```
GET /api/student/meditation/goals?page=1&limit=20&search=stress
```

#### Get Goal by ID
```
GET /api/student/meditation/goals?id=goal_id
```

### Meditation Resources Access

### Get Meditations
```
GET /api/student/meditation?page=1&limit=20&search=mindfulness&type=GUIDED
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search in title, description, instructor
- `type`: Filter by meditation type
- `category`: Filter by category
- `goal`: Filter by goal

**Note:** Students only see meditations with status "PUBLISHED"

### Get Single Meditation
```
GET /api/student/meditation?id=meditation_id
```

**Note:** Students can only access published meditations

### Get Meditations by Type
```
GET /api/student/meditation/type/GUIDED?page=1&limit=20
```

### Get Meditations by Category
```
GET /api/student/meditation/category/Mindfulness?page=1&limit=20
```

### Get Meditations by Goal
```
GET /api/student/meditation/goal/Stress%20Reduction?page=1&limit=20
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Meditation created successfully",
  "data": {
    "id": "meditation_id",
    "title": "Morning Mindfulness",
    "description": "A gentle morning meditation...",
    "format": "AUDIO",
    "audioUrl": "https://example.com/meditation.mp3",
    "durationSec": 600,
    "instructor": "Jane Doe",
    "type": "GUIDED",
    "category": "Mindfulness",
    "goal": "Stress Reduction",
    "status": "PUBLISHED",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "admin": {
      "id": "user_id",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com"
    }
  }
}
```

### List Response with Pagination
```json
{
  "success": true,
  "message": "Meditations retrieved successfully",
  "data": {
    "meditations": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": 404,
    "message": "Meditation not found"
  }
}
```

---

## Permissions

### Admin Permissions
- **Create**: `selfhelp.meditation.update`
- **Read**: `selfhelp.meditation.update`
- **Update**: `selfhelp.meditation.update`
- **Delete**: `selfhelp.meditation.update`

### Student Permissions
- **Read**: `selfhelp.meditation.read`

---

## Usage Examples

### Admin: Create a New Meditation
```javascript
const response = await fetch('/api/admin/meditation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Evening Relaxation',
    description: 'A calming meditation for evening relaxation',
    format: 'AUDIO',
    audioUrl: 'https://example.com/evening-meditation.mp3',
    durationSec: 900,
    instructor: 'John Smith',
    type: 'GUIDED',
    category: 'Relaxation',
    goal: 'Sleep Improvement',
    status: 'PUBLISHED'
  })
});

const result = await response.json();
console.log(result);
```

### Student: Get Guided Meditations
```javascript
const response = await fetch('/api/student/meditation?type=GUIDED&page=1&limit=10');
const result = await response.json();

console.log('Available guided meditations:', result.data.meditations);
```

### Student: Get Meditation by ID
```javascript
const meditationId = 'meditation_id_here';
const response = await fetch(`/api/student/meditation?id=${meditationId}`);
const result = await response.json();

if (result.success) {
  console.log('Meditation details:', result.data);
  // Play audio or video
  if (result.data.audioUrl) {
    const audio = new Audio(result.data.audioUrl);
    audio.play();
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - No valid session |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Meditation not found |
| 500 | Internal Server Error - Database or server error |

---

## Features

### Search Functionality
- Search across title, description, and instructor fields
- Case-insensitive search
- Partial text matching

### Filtering Options
- Filter by meditation type (GUIDED, MUSIC, BREATHING, BODY_SCAN)
- Filter by category (Mindfulness, Relaxation, etc.)
- Filter by goal (Stress Reduction, Sleep Improvement, etc.)
- Filter by status (Admin only)

### Pagination
- Configurable page size (1-100 items per page)
- Pagination metadata included in list responses
- Efficient database queries for large datasets

### Access Control
- Role-based permissions
- Students only see published content
- Admins have full CRUD access
- School-based filtering (when applicable)

---

## Best Practices

1. **Audio/Video URLs**: Use CDN URLs for better performance
2. **Duration**: Provide accurate duration in seconds
3. **Categories**: Use consistent category naming
4. **Goals**: Use specific, actionable goal descriptions
5. **Status**: Keep drafts private until ready for publication
6. **Search**: Use descriptive titles and descriptions for better searchability
