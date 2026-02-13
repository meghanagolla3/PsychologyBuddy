# Music Tool APIs Documentation

## 🎵 Overview

The Music Tool provides therapeutic music resources for students with comprehensive admin management capabilities.

### **Security Architecture**
- ✅ **Student Access**: Read-only access to published music resources
- ✅ **Admin Access**: Full CRUD for resources, categories, and goals
- ✅ **Permissions**: `selfhelp.music.view`, `selfhelp.music.create`, `selfhelp.music.update`
- ✅ **Role-Based**: Students vs Admin access control
- ✅ **Dedicated Models**: Music-specific categories and goals (separate from shared system)

---

## 🛠 Admin Music Management APIs

### Music Resources Management

#### Create Music Resource
```
POST /api/admin/music/resources
```

**Body:**
```json
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

**Permissions Required:**
- ✅ `selfhelp.music.update`

**Response:**
```json
{
  "success": true,
  "message": "Music resource created successfully",
  "data": {
    "id": "music_id",
    "title": "Relaxing Piano Melody",
    "description": "Calming instrumental music for relaxation",
    "url": "https://example.com/audio.mp3",
    "duration": 180,
    "artist": "Peaceful Piano",
    "album": "Relaxation Collection",
    "coverImage": "https://example.com/thumbnail.jpg",
    "isPublic": true,
    "schoolId": "school_id",
    "status": "PUBLISHED",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "categories": [
      {
        "id": "category_id_1",
        "name": "Classical",
        "description": "Classical music for relaxation",
        "status": "ACTIVE"
      }
    ],
    "goals": [
      {
        "id": "goal_id_1",
        "name": "Stress Relief",
        "description": "Music to help reduce stress"
      }
    ]
  }
}
```

#### Get Music Resources
```
GET /api/admin/music/resources?category=Classical&goal=stress-relief&status=PUBLISHED&page=1&limit=20
```

**Query Parameters:**
- `category`: Filter by category name
- `goal`: Filter by goal name
- `status`: Filter by status (DRAFT | PUBLISHED)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Permissions Required:**
- ✅ `selfhelp.music.view`

#### Get Single Music Resource
```
GET /api/admin/music/resources?id=music_id
```

#### Update Music Resource
```
PATCH /api/admin/music/resources?id=music_id
```

**Body:** Same as create, all fields optional

#### Delete Music Resource
```
DELETE /api/admin/music/resources?id=music_id
```

---

### Categories Management

#### Create Category
```
POST /api/admin/music/categories
```

**Body:**
```json
{
  "name": "Classical",
  "description": "Classical music for relaxation",
  "icon": "music-note",
  "color": "#3B82F6",
  "status": "ACTIVE"
}
```

#### Get Categories
```
GET /api/admin/music/categories
```

#### Update Category
```
PATCH /api/admin/music/categories?id=category_id
```

**Body:**
```json
{
  "name": "Classical",
  "description": "Classical music for relaxation",
  "icon": "music-note",
  "color": "#3B82F6",
  "status": "ACTIVE"
}
```

#### Delete Category
```
DELETE /api/admin/music/categories?id=category_id
```

---

### Goals Management

#### Create Goal
```
POST /api/admin/music/goals
```

**Body:**
```json
{
  "name": "Stress Relief",
  "description": "Music to help reduce stress",
  "icon": "heart",
  "color": "#10B981"
}
```

#### Get Goals
```
GET /api/admin/music/goals
```

#### Update Goal
```
PATCH /api/admin/music/goals?id=goal_id
```

**Body:**
```json
{
  "name": "Stress Relief",
  "description": "Music to help reduce stress",
  "icon": "heart",
  "color": "#10B981"
}
```

#### Delete Goal
```
DELETE /api/admin/music/goals?id=goal_id
```

---

### Music Listening Instructions Management

#### Create Instruction
```
POST /api/admin/music/instructions
```

**Body:**
```json
{
  "title": "Mindful Piano Listening",
  "description": "A guided session for mindful piano music listening",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Find a comfortable position",
      "description": "Sit or lie down in a comfortable position where you won't be disturbed",
      "duration": 2
    },
    {
      "stepNumber": 2,
      "title": "Start the music",
      "description": "Play the piano piece at a comfortable volume",
      "duration": 1
    },
    {
      "stepNumber": 3,
      "title": "Focus on breathing",
      "description": "Close your eyes and focus on your breath while listening",
      "duration": 5
    }
  ],
  "duration": 15,
  "difficulty": "BEGINNER",
  "status": "PUBLISHED",
  "resourceId": "music_resource_id"
}
```

#### Get Instructions
```
GET /api/admin/music/instructions?difficulty=BEGINNER&status=PUBLISHED&page=1&limit=20
```

**Query Parameters:**
- `difficulty`: Filter by difficulty level (BEGINNER | INTERMEDIATE | ADVANCED)
- `status`: Filter by status (DRAFT | PUBLISHED)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Get Single Instruction
```
GET /api/admin/music/instructions?id=instruction_id
```

#### Update Instruction
```
PATCH /api/admin/music/instructions?id=instruction_id
```

**Body:** Same as create, all fields optional

#### Delete Instruction
```
DELETE /api/admin/music/instructions?id=instruction_id
```

#### Get Instructions by Resource
```
GET /api/admin/music/instructions/resource?resourceId=music_resource_id
```

---

## 🎧 Student Music Instruction APIs

### Music Discovery & Access

#### Get All Music Resources
```
GET /api/student/music/resources?category=Classical&goal=stress-relief&page=1&limit=20
```

**Features:**
- ✅ Only returns PUBLISHED resources
- ✅ Supports filtering by category, goal
- ✅ Pagination support
- ✅ Search functionality

**Permissions Required:**
- ✅ `STUDENT` role

#### Get Single Music Resource
```
GET /api/student/music/resources?id=music_id
```

**Security:**
- ✅ Only accessible if resource is PUBLISHED
- ✅ Returns 403 for DRAFT resources

#### Get Music by Category
```
GET /api/student/music/category?category=Classical&goal=stress-relief&page=1&limit=20
```

#### Get Music by Goal
```
GET /api/student/music/goal?goal=stress-relief&category=Classical&page=1&limit=20
```

#### Get Featured Music
```
GET /api/student/music/featured?limit=10
```

**Returns:** Curated list of featured music resources

---

### Music Listening Instructions

#### Get Instructions
```
GET /api/student/music/instructions?difficulty=BEGINNER&page=1&limit=20
```

**Features:**
- ✅ Only returns PUBLISHED instructions
- ✅ Filter by difficulty level
- ✅ Pagination support
- ✅ Includes creator and resource information

**Permissions Required:**
- ✅ `STUDENT` role

#### Get Single Instruction
```
GET /api/student/music/instructions?id=instruction_id
```

**Security:**
- ✅ Only accessible if instruction is PUBLISHED
- ✅ Returns 403 for DRAFT instructions

#### Get Instructions by Difficulty
```
GET /api/student/music/instructions/difficulty/BEGINNER?page=1&limit=20
```

**Supported Difficulty Levels:**
- `BEGINNER`: Simple, basic instructions
- `INTERMEDIATE`: Moderate complexity
- `ADVANCED`: Complex, detailed instructions

#### Get Instructions with Resource
```
GET /api/student/music/instructions/resource?resourceId=music_resource_id
```

**Features:**
- ✅ Returns instructions that include the specified music resource
- ✅ Only published instructions
- ✅ Includes full step-by-step guidance

---

## 🔒 Security Features

### **Access Control**
- ✅ **Students**: Read-only access to published content
- ✅ **Admins**: Full CRUD with permission checks
- ✅ **Super Admins**: Access to all schools' content

### **Data Protection**
- ✅ Students cannot access DRAFT resources
- ✅ Admin operations require proper permissions
- ✅ Session-based authentication
- ✅ Input validation with Zod schemas

### **Privacy & Safety**
- ✅ No student data exposure in admin APIs
- ✅ Proper error handling without data leakage
- ✅ SQL injection prevention with Prisma ORM

---

## 📁 File Structure

```
src/components/server/content/selfhelptools/music/
├── music.validators.ts          # Zod validation schemas
├── music.repository.ts          # Database operations
├── music.admin.service.ts       # Admin business logic
├── music.student.service.ts     # Student business logic
├── music.admin.controller.ts    # Admin API handlers
└── music.student.controller.ts  # Student API handlers

app/api/
├── admin/music/
│   ├── resources/
│   │   ├── route.ts          # GET, POST
│   │   └── [id]/route.ts     # GET, PATCH, DELETE
│   ├── categories/
│   │   ├── route.ts          # GET, POST
│   │   └── [id]/route.ts     # PATCH, DELETE
│   └── goals/
│       ├── route.ts          # GET, POST
│       └── [id]/route.ts     # PATCH, DELETE
├── admin/music/instructions/
│   ├── route.ts              # GET, POST
│   └── [id]/route.ts         # GET, PATCH, DELETE
└── student/music/
    ├── resources/
    │   ├── route.ts          # GET
    │   └── [id]/route.ts     # GET
    ├── category/route.ts       # GET
    ├── mood/route.ts         # GET
    ├── goal/route.ts         # GET
    └── featured/route.ts     # GET
```

---

## 🗄 Database Schema

### **MusicResource** (Main Resource)
```sql
- id: String (Primary Key)
- title: String
- description: String?
- url: String
- duration: Int? (in seconds)
- artist: String?
- album: String?
- coverImage: String?
- isPublic: Boolean (default: true)
- schoolId: String? (Foreign Key to School)
- status: String (DRAFT | PUBLISHED)
- createdAt: DateTime
- updatedAt: DateTime
```

### **MusicCategory** (Dedicated Categories)
```sql
- id: String (Primary Key)
- name: String (Unique)
- description: String?
- icon: String?
- color: String?
- status: String (ACTIVE | INACTIVE)
- createdAt: DateTime
- updatedAt: DateTime
```

### **MusicGoal** (Dedicated Goals)
```sql
- id: String (Primary Key)
- name: String (Unique)
- description: String?
- icon: String?
- color: String?
- createdAt: DateTime
- updatedAt: DateTime
```

### **Many-to-Many Relations**
- **MusicResource ↔ MusicCategory**: Direct many-to-many
- **MusicResource ↔ MusicGoal**: Direct many-to-many

---

## 🧪 Testing Checklist

### **Admin APIs**
- [ ] Create music resource with all fields
- [ ] Create music resource with minimal fields
- [ ] Get music resources with filters
- [ ] Update music resource
- [ ] Delete music resource
- [ ] Create/update/delete categories
- [ ] Create/update/delete goals
- [ ] Permission validation (view/update)
- [ ] Role validation (admin only)

### **Student APIs**
- [ ] Get all music resources
- [ ] Get single music resource
- [ ] Filter by category
- [ ] Filter by mood
- [ ] Filter by goal
- [ ] Get featured music
- [ ] Pagination functionality
- [ ] Access denied for DRAFT resources
- [ ] Role validation (student only)

### **Security Tests**
- [ ] Unauthorized access attempts
- [ ] Permission boundary violations
- [ ] Input validation bypasses
- [ ] SQL injection attempts
- [ ] XSS prevention
- [ ] Session hijacking prevention

---

## 📝 Usage Examples

### **Admin: Create New Music Resource**
```bash
curl -X POST http://localhost:3000/api/admin/music/resources \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=admin_session" \
  -d '{
    "title": "Ocean Waves",
    "description": "Calming ocean sounds for relaxation",
    "url": "https://example.com/ocean.mp3",
    "duration": 300,
    "artist": "Nature Sounds",
    "album": "Relaxation Collection",
    "coverImage": "https://example.com/ocean-cover.jpg",
    "isPublic": true,
    "status": "PUBLISHED",
    "categoryIds": ["category_id_1"],
    "goalIds": ["goal_id_1"]
  }'
```

### **Student: Browse Music by Category**
```bash
curl -X GET "http://localhost:3000/api/student/music/category?category=Nature%20Sounds&goal=stress-relief&page=1&limit=10" \
  -H "Cookie: sessionId=student_session"
```

### **Student: Get Featured Music**
```bash
curl -X GET "http://localhost:3000/api/student/music/featured?limit=5" \
  -H "Cookie: sessionId=student_session"
```

---

## 🎯 Next Steps

After completing the Music Tool:

1. **Meditation Tool**: Similar structure with guided meditation content
2. **Progress Tracking**: Student engagement analytics
3. **Recommendations**: AI-powered music suggestions
4. **Playlists**: Custom student playlists
5. **Offline Support**: Download capabilities

---

*Music Tool APIs provide a comprehensive therapeutic music experience with robust admin management and student access controls.* 🎵
