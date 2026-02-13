# Journaling APIs Documentation

## Overview
Complete journaling system with strict separation between student content and admin configuration.

## 🔐 Security Architecture

### Student APIs - Private Content Access
- **Role Required**: `STUDENT`
- **Scope**: Only user's own entries
- **Validation**: School configuration checks
- **Privacy**: Admins NEVER access student journal content

### Admin APIs - Configuration Management
- **Permission Required**: `selfhelp.journaling.view` or `selfhelp.journaling.update`
- **Scope**: School-scoped configuration only
- **Privacy**: No access to student journal content

---

## 📝 Student Journaling APIs

### Writing Journals

#### Create Writing Journal
```
POST /api/student/journals/writing
```

**Body:**
```json
{
  "title": "Optional title",
  "content": "Journal content text"
}
```

**Security:**
- ✅ Requires STUDENT role
- ✅ Validates writing is enabled for school
- ✅ Content belongs to authenticated user only

#### Get My Writing Journals
```
GET /api/student/journals/writing
```

**Security:**
- ✅ Requires STUDENT role
- ✅ Returns only user's own entries
- ✅ Ordered by creation date (newest first)

#### Delete Writing Journal
```
DELETE /api/student/journals/writing/:id
```

**Security:**
- ✅ Requires STUDENT role
- ✅ Verifies ownership before deletion
- ✅ Soft delete with audit trail

---

### Audio Journals

#### Create Audio Journal
```
POST /api/student/journals/audio
```

**Body:**
```json
{
  "title": "Optional title",
  "audioUrl": "https://s3-bucket/audio-file.mp3",
  "duration": 120
}
```

**Security:**
- ✅ Requires STUDENT role
- ✅ Validates audio is enabled for school
- ✅ Validates duration ≤ school max duration
- ✅ Content belongs to authenticated user only

#### Get My Audio Journals
```
GET /api/student/journals/audio
```

#### Delete Audio Journal
```
DELETE /api/student/journals/audio/:id
```

---

### Art Journals

#### Create Art Journal
```
POST /api/student/journals/art
```

**Body:**
```json
{
  "imageUrl": "https://s3-bucket/art-image.png"
}
```

**Security:**
- ✅ Requires STUDENT role
- ✅ Validates art journaling is enabled for school
- ✅ Content belongs to authenticated user only

#### Get My Art Journals
```
GET /api/student/journals/art
```

#### Delete Art Journal
```
DELETE /api/student/journals/art/:id
```

---

## 🛠 Admin Journaling Management APIs

### Configuration Management

#### Get Journaling Settings
```
GET /api/admin/journaling/config?schoolId=xxx
```

**Permissions Required:**
- ✅ `selfhelp.journaling.view`

**Security:**
- ✅ Admin can only view their own school (unless SUPER_ADMIN)
- ✅ School scope validation

**Response:**
```json
{
  "success": true,
  "data": {
    "enableWriting": true,
    "enableAudio": true,
    "enableArt": false,
    "maxAudioDuration": 180,
    "autoSaveAudio": true,
    "enableUndo": true,
    "enableRedo": true,
    "enableClearCanvas": false
  }
}
```

#### Update Journaling Settings
```
PATCH /api/admin/journaling/config
```

**Body:**
```json
{
  "enableWriting": true,
  "enableAudio": true,
  "enableArt": false,
  "maxAudioDuration": 180,
  "autoSaveAudio": true,
  "enableUndo": true,
  "enableRedo": true,
  "enableClearCanvas": false
}
```

**Permissions Required:**
- ✅ `selfhelp.journaling.update`

**Security:**
- ✅ Admin can only update their own school
- ✅ Input validation with Zod schemas
- ✅ Configuration bounds checking

---

### Mood-Based Prompts Management

#### Create Prompt
```
POST /api/admin/journaling/prompts
```

**Body:**
```json
{
  "text": "What made you smile today?",
  "moodIds": ["mood-id-1", "mood-id-2"]
}
```

**Permissions Required:**
- ✅ `selfhelp.journaling.update`

#### Get All Prompts
```
GET /api/admin/journaling/prompts
```

**Permissions Required:**
- ✅ `selfhelp.journaling.view`

#### Update Prompt
```
PATCH /api/admin/journaling/prompts/:id
```

**Permissions Required:**
- ✅ `selfhelp.journaling.update`

#### Delete Prompt
```
DELETE /api/admin/journaling/prompts/:id
```

**Permissions Required:**
- ✅ `selfhelp.journaling.update`

---

## 🔒 Security Checklist

### ✅ Authentication & Authorization
- [x] Session-based authentication
- [x] Role-based access control (RBAC)
- [x] Permission-based API access
- [x] School-scoped admin access

### ✅ Data Privacy
- [x] Students only access their own journals
- [x] Admins never access student content
- [x] Configuration-only admin access
- [x] No cross-user data leakage

### ✅ Input Validation
- [x] Zod schema validation
- [x] SQL injection prevention (Prisma ORM)
- [x] File URL validation
- [x] Duration bounds checking

### ✅ Error Handling
- [x] Consistent error responses
- [x] No sensitive data in errors
- [x] Proper HTTP status codes
- [x] Audit logging ready

---

## 📁 File Structure

```
/src/components/server/content/selfhelptools/journaling/
├── journaling.validators.ts      # Zod validation schemas
├── journaling.student.repository.ts  # Student data access
├── journaling.student.service.ts    # Student business logic
├── journaling.student.controller.ts  # Student API handlers
├── journaling.admin.repository.ts    # Admin data access
├── journaling.admin.service.ts      # Admin business logic
└── journaling.admin.controller.ts    # Admin API handlers
```

**API Routes:**
```
/api/student/journals/writing/
├── POST   route.ts
├── GET    route.ts
└── DELETE [id]/route.ts

/api/student/journals/audio/
├── POST   route.ts
├── GET    route.ts
└── DELETE [id]/route.ts

/api/student/journals/art/
├── POST   route.ts
├── GET    route.ts
└── DELETE [id]/route.ts

/api/admin/journaling/
├── config/
│   ├── GET    route.ts
│   └── PATCH  route.ts
└── prompts/
    ├── POST   route.ts
    ├── GET    route.ts
    ├── PATCH  [id]/route.ts
    └── DELETE [id]/route.ts
```

---

## 🗄 Database Schema

### Journal Tables
- `WritingJournal` - Text journal entries
- `AudioJournal` - Audio journal entries  
- `ArtJournal` - Image journal entries
- `JournalingPrompt` - Mood-based prompts
- `JournalingToolConfig` - School configuration

### Security Features
- User ID foreign keys ensure ownership
- School-scoped configuration
- No admin access to journal tables
- Audit trails with timestamps

---

## 🚀 Usage Examples

### Student Creating Writing Journal
```javascript
// Student session cookie required
const response = await fetch('/api/student/journals/writing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Day',
    content: 'Today was a good day...'
  })
});
```

### Admin Updating Configuration
```javascript
// Admin session with permissions required
const response = await fetch('/api/admin/journaling/config', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    enableWriting: true,
    enableAudio: false,
    maxAudioDuration: 120
  })
});
```

---

## 🎯 Key Features

### Privacy First
- Student content is completely private
- Admins only manage settings, not content
- No backdoors or override access

### School Configuration
- Enable/disable journal types per school
- Customize audio duration limits
- Configure art journaling features

### Mood Integration
- Prompts linked to mood labels
- Contextual journaling suggestions
- Enhanced therapeutic value

### Scalable Architecture
- Clean separation of concerns
- Repository pattern for data access
- Service layer for business logic
- Controller layer for API handling

---

## 🔧 Testing Checklist

### Security Tests
- [ ] Test unauthorized access attempts
- [ ] Test cross-user data access
- [ ] Test permission boundary violations
- [ ] Test input validation bypasses

### Functional Tests
- [ ] Student CRUD operations
- [ ] Admin configuration management
- [ ] School scope enforcement
- [ ] Configuration validation

### Integration Tests
- [ ] End-to-end journaling flow
- [ ] Admin configuration changes
- [ ] Permission propagation
- [ ] Error handling scenarios

---

This journaling system provides a secure, private, and configurable journaling experience for students while giving administrators the tools they need to manage the system without compromising student privacy.
