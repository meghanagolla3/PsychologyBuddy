# Psychoeducation Library System

A comprehensive block-based content management system for creating and managing psychoeducation articles with a modern, intuitive interface.

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [API Routes](#api-routes)
4. [Frontend Components](#frontend-components)
5. [File Structure](#file-structure)
6. [Testing Guide](#testing-guide)
7. [Feature Walkthrough](#feature-walkthrough)

---

## 🎯 System Overview

The Psychoeducation Library is a two-stage content management system:

### **Stage 1: Metadata Creation**
- Article title, subtitle, author, description
- Thumbnail, read time, status
- Category, mood, and goal assignments

### **Stage 2: Block-Based Editor**
- 7 different content block types
- Drag-and-drop reordering
- Real-time preview
- Flexible content structure

### **Student Experience**
- Clean, responsive article viewing
- Interactive engagement features
- Published-only access control

---

## 🗄️ Database Schema

### **ArticleBlock Model**
```sql
model ArticleBlock {
  id        String @id @default(cuid())
  articleId String
  type      String // "section" | "image" | "list" | "takeaways" | "reflection" | "link" | "divider"
  order     Int
  content   Json   // Flexible content storage

  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
}
```

### **Why This Design:**
- **JSON Content**: Maximum flexibility for different block types
- **Order Field**: Easy reordering without complex logic
- **Cascade Delete**: Article deletion removes all blocks
- **Type Safety**: Explicit block type enumeration

---

## 🛠️ API Routes

### **Core Article APIs**

#### `/app/api/articles/route.ts`
**Purpose**: Main article CRUD operations
- `GET`: List all articles (admin/superadmin)
- `POST`: Create new article with metadata

**Why**: Central entry point for article management

#### `/app/api/articles/[id]/route.ts`
**Purpose**: Individual article operations
- `GET`: Fetch single article
- `PUT`: Update article metadata
- `DELETE`: Remove article

**Why**: Granular article control

### **Block Management APIs**

#### `/app/api/articles/[id]/blocks/route.ts`
**Purpose**: Block collection operations
- `GET`: Fetch all blocks for an article
- `POST`: Add new block
- `PATCH`: Reorder blocks

**Why**: Bulk block operations and reordering

#### `/app/api/articles/[id]/blocks/[blockId]/route.ts`
**Purpose**: Individual block operations
- `PUT`: Update specific block
- `DELETE`: Remove specific block

**Why**: Precise block editing

---

## 🎨 Frontend Components

### **Content Management Pages**

#### `/app/content-management/library/page.tsx`
**Purpose**: Article listing and management hub
**Features**: 
- Article cards with metadata
- Status badges
- Quick actions (edit, preview, delete)
- Add new article button

**Why**: Central dashboard for content managers

#### `/app/content-management/library/new/page.tsx`
**Purpose**: Stage 1 - Article metadata creation
**Features**:
- Form validation
- Category/mood/goal selection
- Status management
- Auto-redirect to editor

**Why**: First step in article creation workflow

#### `/app/content-management/library/editor/[id]/page.tsx`
**Purpose**: Stage 2 - Block-based content editor
**Features**:
- 7 block types with visual editors
- Real-time block management
- Reordering controls
- Preview navigation

**Why**: Core content creation interface

#### `/app/content-management/library/preview/[id]/page.tsx`
**Purpose**: Admin preview of articles
**Features**:
- Student-like rendering
- Edit navigation
- Published status check

**Why**: Quality control before publishing

#### `/app/content-management/library/view/[id]/page.tsx`
**Purpose**: Student-facing article view
**Features**:
- Clean reading experience
- Interactive CTAs (rating, feedback)
- Published-only access
- Mobile responsive

**Why**: End-user content consumption

### **Core Components**

#### `ArticleList.tsx`
**Purpose**: Reusable article listing component
**Why**: Centralized article display logic

#### `AddArticleForm.tsx`
**Purpose**: Metadata creation form
**Features**:
- Label integration
- Form validation
- Auto-save prevention

**Why**: Standardized article creation

#### `ArticleEditor.tsx`
**Purpose**: Block-based editor interface
**Features**:
- 7 block type editors
- Real-time updates
- Visual block management

**Why**: Most complex content creation tool

#### `ArticlePreview.tsx`
**Purpose**: Admin preview rendering
**Why**: Consistent preview experience

#### `StudentArticleView.tsx`
**Purpose**: Public article viewing
**Features**:
- Engagement CTAs
- Responsive design
- Accessibility support

**Why**: Student-facing content delivery

---

## 📁 File Structure

```
/app/
├── content-management/
│   └── library/
│       ├── page.tsx                    # Article listing dashboard
│       ├── new/
│       │   └── page.tsx            # Stage 1: Metadata creation
│       ├── editor/
│       │   └── [id]/
│       │       └── page.tsx        # Stage 2: Block editor
│       ├── preview/
│       │   └── [id]/
│       │       └── page.tsx        # Admin preview
│       └── view/
│           └── [id]/
│               └── page.tsx        # Student view
└── api/
    └── articles/
        ├── route.ts                 # Main article CRUD
        ├── [id]/
        │   └── route.ts            # Individual article ops
        └── [id]/
            └── blocks/
                ├── route.ts        # Block collection ops
                └── [blockId]/
                    └── route.ts    # Individual block ops

/src/components/
└── content-management/
    └── library/
        ├── ArticleList.tsx          # Article listing component
        ├── AddArticleForm.tsx      # Metadata creation form
        ├── ArticleEditor.tsx        # Block editor interface
        ├── ArticlePreview.tsx       # Admin preview component
        └── StudentArticleView.tsx  # Student view component

/src/components/server/
└── content/
    └── library/
        ├── library.controller.ts     # Existing article CRUD
        ├── article-block.controller.ts # Block management API
        ├── article-block.service.ts  # Block business logic
        └── library.service.ts      # Existing article service
```

---

## 🧪 Testing Guide

### **Prerequisites**
1. Ensure database is running
2. Run `npm run dev`
3. Have admin/superadmin session

### **1. Test Article Creation Workflow**

#### **Step 1: Create Article Metadata**
```bash
# Navigate to Stage 1
curl -X GET http://localhost:3000/content-management/library/new \
  -H "Cookie: sessionId=your-session-id"

# Create article (Stage 1)
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=your-session-id" \
  -d '{
    "title": "Understanding Anxiety",
    "subtitle": "A Comprehensive Guide",
    "author": "Dr. Smith",
    "description": "Learn about anxiety management",
    "readTime": 10,
    "categoryId": "category-id-here",
    "moodIds": ["mood-id-1", "mood-id-2"],
    "goalId": "goal-id-here",
    "status": "DRAFT"
  }'
```

**Expected**: Article created, redirect to editor

#### **Step 2: Add Content Blocks**
```bash
# Add text section
curl -X POST http://localhost:3000/api/articles/{article-id}/blocks \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=your-session-id" \
  -d '{
    "type": "section",
    "content": {
      "title": "What is Anxiety?",
      "text": "Anxiety is a natural response..."
    }
  }'

# Add image block
curl -X POST http://localhost:3000/api/articles/{article-id}/blocks \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=your-session-id" \
  -d '{
    "type": "image",
    "content": {
      "src": "https://example.com/anxiety.jpg",
      "alt": "Person managing anxiety"
    }
  }'

# Add takeaways
curl -X POST http://localhost:3000/api/articles/{article-id}/blocks \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=your-session-id" \
  -d '{
    "type": "takeaways",
    "content": {
      "points": [
        "Anxiety is normal",
        "Breathing exercises help",
        "Seek professional support"
      ]
    }
  }'
```

#### **Step 3: Test Block Reordering**
```bash
# Reorder blocks
curl -X PATCH http://localhost:3000/api/articles/{article-id}/blocks \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=your-session-id" \
  -d '{
    "blocks": [
      {"id": "block-1", "order": 1},
      {"id": "block-2", "order": 0}
    ]
  }'
```

### **2. Test Preview and Publishing**

#### **Preview Article**
```bash
# Navigate to preview
curl -X GET http://localhost:3000/content-management/library/preview/{article-id} \
  -H "Cookie: sessionId=your-session-id"
```

#### **Publish Article**
```bash
# Update status to published
curl -X PUT http://localhost:3000/api/articles/{article-id} \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionId=your-session-id" \
  -d '{
    "status": "PUBLISHED"
  }'
```

### **3. Test Student Experience**

#### **View Published Article**
```bash
# Student view (no auth required for published articles)
curl -X GET http://localhost:3000/content-management/library/view/{article-id}
```

#### **Test Access Control**
```bash
# Try to view draft article (should fail)
curl -X GET http://localhost:3000/content-management/library/view/{draft-article-id}

# Expected: "Article Not Available" message
```

### **4. Test Block Types**

#### **All 7 Block Types Test**
```bash
# Section Block
{
  "type": "section",
  "content": {
    "title": "Understanding Stress",
    "text": "Stress affects everyone differently..."
  }
}

# Image Block
{
  "type": "image", 
  "content": {
    "src": "https://example.com/image.jpg",
    "alt": "Stress management diagram"
  }
}

# List Block
{
  "type": "list",
  "content": {
    "title": "Common Stressors",
    "items": [
      "Work pressure",
      "Academic stress", 
      "Relationship issues"
    ]
  }
}

# Takeaways Block
{
  "type": "takeaways",
  "content": {
    "points": [
      "Identify your stress triggers",
      "Practice relaxation techniques",
      "Maintain work-life balance"
    ]
  }
}

# Reflection Block
{
  "type": "reflection",
  "content": {
    "title": "Personal Reflection",
    "content": "Think about a time when you felt stressed..."
  }
}

# Link Block
{
  "type": "link",
  "content": {
    "title": "Mental Health Resources",
    "url": "https://example.com/resources",
    "description": "24/7 support and resources"
  }
}

# Divider Block
{
  "type": "divider",
  "content": {}
}
```

### **5. Test Error Handling**

#### **Permission Tests**
```bash
# Test without authentication
curl -X GET http://localhost:3000/api/articles
# Expected: 401 Unauthorized

# Test with insufficient permissions
curl -X GET http://localhost:3000/api/articles \
  -H "Cookie: sessionId=student-session-id"
# Expected: 403 Forbidden
```

#### **Validation Tests**
```bash
# Invalid block type
curl -X POST http://localhost:3000/api/articles/{id}/blocks \
  -H "Content-Type: application/json" \
  -d '{"type": "invalid", "content": {}}'
# Expected: 400 Bad Request

# Missing required fields
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{"title": ""}'
# Expected: 400 Bad Request
```

---

## 🎬 Feature Walkthrough

### **Complete User Journey**

#### **Admin Workflow**
1. **Access Library**: `/content-management/library`
2. **Create Article**: Click "Add Article" → Stage 1 form
3. **Add Content**: Auto-redirect to Stage 2 editor
4. **Build Content**: Add blocks, reorder, edit
5. **Preview**: Click "Preview" to see student view
6. **Publish**: Change status to "PUBLISHED"
7. **Manage**: Edit, delete, or create more articles

#### **Student Journey**
1. **Browse**: Access published articles
2. **Read**: Clean, mobile-friendly interface
3. **Engage**: Rate, provide feedback, share
4. **Get Support**: Access help resources

### **Block Type Usage**

#### **Content Strategy**
- **Sections**: Main text content and explanations
- **Images**: Visual aids and diagrams
- **Lists**: Structured information and steps
- **Takeaways**: Key points and summaries
- **Reflections**: Interactive prompts and exercises
- **Links**: External resources and references
- **Dividers**: Visual separation and pacing

#### **Best Practices**
- Start with a compelling section block
- Use images to break up text
- Include takeaways for reinforcement
- Add reflection blocks for engagement
- End with helpful links
- Use dividers for pacing

---

## 🔧 Technical Implementation Details

### **Why This Architecture**

#### **Block-Based Design**
- **Flexibility**: Any content structure possible
- **Scalability**: Easy to add new block types
- **Maintainability**: Isolated block logic
- **Performance**: Lazy loading of block editors

#### **Two-Stage Creation**
- **User Experience**: Less overwhelming than single form
- **Data Integrity**: Metadata saved before content
- **Workflow**: Natural content creation process
- **Preview Capability**: Early preview possible

#### **JSON Content Storage**
- **Schema Evolution**: Easy to add block fields
- **Query Performance**: No complex joins needed
- **Flexibility**: Each block type can have unique structure
- **Type Safety**: TypeScript interfaces for validation

### **Security Considerations**
- **Permission-Based Access**: Role-based content management
- **Published-Only Access**: Students see only approved content
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Prisma ORM protection

---

## 🚀 Deployment Notes

### **Environment Variables Required**
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
```

### **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with sample data
npx prisma db seed
```

### **Build and Deploy**
```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 📞 Support and Troubleshooting

### **Common Issues**

#### **Block Not Saving**
- Check network connection
- Verify authentication
- Check browser console for errors

#### **Preview Not Updating**
- Refresh the page
- Check if blocks were saved
- Verify article status

#### **Permission Errors**
- Ensure user has PSYCHO_EDUCATION permissions
- Check role assignments
- Verify session validity

### **Debug Mode**
Add `?debug=true` to any page to see:
- Current article data
- Block structure
- Permission status

---

## 🎉 Success Metrics

When fully implemented, this system provides:

✅ **Complete Content Management**: From creation to publishing
✅ **Flexible Content Structure**: 7 block types for any content
✅ **Professional Student Experience**: Mobile-responsive, accessible
✅ **Admin Efficiency**: Intuitive workflow, real-time editing
✅ **Scalable Architecture**: Easy to extend and maintain
✅ **Security**: Role-based access, input validation
✅ **Performance**: Optimized queries, lazy loading

---

**🎊 Congratulations! You now have a production-ready Psychoeducation Library system! 🎊**
