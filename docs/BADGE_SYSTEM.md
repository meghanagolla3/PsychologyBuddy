ḍ# Badge & Streak System Documentation

## Overview

The Psychology Buddy app features a comprehensive badge and streak system designed to encourage consistent user engagement and celebrate achievements.

## 🎯 System Components

### 1. Streak System
- **Purpose**: Tracks daily activity consistency
- **Triggers**: Login, mood check-in, journal entry, self-help session
- **Logic**: 
  - Same day: No change
  - Consecutive day: Increment streak
  - Gap (>1 day): Reset to 1

### 2. Badge System
- **Purpose**: Achievement-based rewards for reaching milestones
- **Types**: Streak, Journal Count, Article Read, Meditation Count, Music Count, Mood Check-in
- **Automatic**: Badges are awarded automatically when conditions are met

## 📊 Badge Types

| Type | Description | Example Condition |
|-------|-------------|------------------|
| STREAK | Consecutive days of activity | 7-day streak |
| JOURNAL_COUNT | Total journal entries | 10 journals |
| ARTICLE_READ | Articles read | 5 articles |
| MEDITATION_COUNT | Meditation sessions completed | 10 sessions |
| MUSIC_COUNT | Music therapy sessions | 15 sessions |
| MOOD_CHECKIN | Mood check-ins completed | 20 check-ins |

## 🛠️ Technical Implementation

### Database Models

#### Badge
```typescript
{
  id: string,
  name: string,
  icon: string,        // emoji
  description: string,
  requirement: string,  // human-readable
  type: BadgeType,
  conditionValue?: number,  // e.g., 7 for 7-day streak
  isActive: boolean,
  createdBy: string,
  createdAt: Date
}
```

#### UserBadge
```typescript
{
  id: string,
  userId: string,
  badgeId: string,
  earnedAt: Date
}
```

#### Streak
```typescript
{
  id: string,
  userId: string,     // unique
  count: number,       // current streak
  lastActive: Date    // last activity date
}
```

## 🚀 API Endpoints

### Admin Badge Management

#### Create Badge
```
POST /api/admin/badges
Authorization: Admin session required
```

**Body:**
```json
{
  "name": "Week Warrior",
  "icon": "⭐",
  "description": "Maintain a 7-day streak",
  "requirement": "7 consecutive days of activity",
  "type": "STREAK",
  "conditionValue": 7,
  "isActive": true
}
```

#### Get Badges
```
GET /api/admin/badges?page=1&limit=20&search=warrior&type=STREAK&isActive=true
Authorization: Admin session required
```

#### Update Badge
```
PATCH /api/admin/badges?id=badge_id
Authorization: Admin session required
```

#### Delete Badge
```
DELETE /api/admin/badges?id=badge_id
Authorization: Admin session required
```

### Student Badge Access

#### Get User Badges
```
GET /api/student/badges?page=1&limit=20
Authorization: Student session required
```

**Response:**
```json
{
  "success": true,
  "data": {
    "badges": [
      {
        "id": "badge_id",
        "name": "Week Warrior",
        "icon": "⭐",
        "description": "7-day streak achieved",
        "progress": 100,
        "earned": true,
        "earnedAt": "2024-01-07T00:00:00.000Z"
      }
    ],
    "earnedCount": 5,
    "inProgressCount": 3,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

#### Get User Streak
```
GET /api/student/streak
Authorization: Student session required
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 7,
    "lastActive": "2024-01-07T00:00:00.000Z"
  }
}
```

## 🔄 Badge Evaluation Flow

### Automatic Triggering

Badges are automatically evaluated when users perform eligible activities:

1. **Journal Activity** → `ActivityService.afterJournalActivity()`
2. **Mood Check-in** → `ActivityService.afterMoodCheckin()`
3. **Self-help Session** → `ActivityService.afterSelfHelpSession()`
4. **Resource Access** → `ActivityService.afterResourceAccess()`
5. **Login** → `ActivityService.afterLogin()`

### Evaluation Process

```typescript
// For each activity:
1. Update user's streak
2. Get user's current statistics
3. Evaluate all active badges
4. Award new badges if conditions met
5. Return updated badge list
```

## 🎨 UI Integration

### Student Dashboard Sections

#### 1. Current Streak Display
- Shows current streak count
- Updates in real-time
- Motivational messaging

#### 2. Earned Badges
- Grid of earned badges
- Shows earn date
- Badge details on hover/click

#### 3. In Progress Badges
- Progress bars for unearned badges
- Percentage completion
- Requirements display

### Admin Badge Management
- Create/edit/delete badges
- Toggle active status
- View badge statistics
- Role-based permissions

## 🔐 Role Permissions

| Role | Create Badge | Edit Badge | Delete Badge | View Badges |
|-------|--------------|------------|------------|------------|
| SUPERADMIN | ✅ | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| STUDENT | ❌ | ❌ | ❌ | ✅ |

## 📈 Example Badge Progression

### Streak Badges
1. **First Steps** - 3-day streak 🌱
2. **Week Warrior** - 7-day streak ⭐
3. **Month Master** - 30-day streak 🏆
4. **Consistency King** - 90-day streak 👑

### Activity Badges
1. **Journal Starter** - 5 journals 📝
2. **Mood Regular** - 10 mood check-ins 😊
3. **Knowledge Seeker** - 10 articles read 📚
4. **Meditation Practitioner** - 20 meditations 🧘
5. **Music Enthusiast** - 25 music sessions 🎵

## 🧪 Testing

### Create Test Badges
```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin-password"}'

# Create a streak badge
curl -X POST http://localhost:3000/api/admin/badges \
  -H "Content-Type: application/json" \
  -H "Cookie: session=admin-session" \
  -d '{
    "name": "Week Warrior",
    "icon": "⭐",
    "description": "Maintain a 7-day streak",
    "requirement": "7 consecutive days",
    "type": "STREAK",
    "conditionValue": 7
  }'
```

### Test Student Badge Access
```bash
# Login as student
curl -X POST http://localhost:3000/api/auth/student-login \
  -H "Content-Type: application/json" \
  -d '{"studentId": "STUDENT001", "password": "student-password"}'

# Get user badges
curl -X GET "http://localhost:3000/api/student/badges" \
  -H "Cookie: session=student-session"

# Get user streak
curl -X GET "http://localhost:3000/api/student/streak" \
  -H "Cookie: session=student-session"
```

## 🔧 Configuration

### Environment Variables
No additional environment variables required for badge system.

### Database Migrations
Badge system requires database migration for:
- `Badge` table
- `UserBadge` table  
- `Streak` table with unique `userId` constraint

## 🚨 Troubleshooting

### Common Issues

1. **Badges not awarding**
   - Check if `BadgeService.evaluateUserBadges()` is called after activities
   - Verify badge `isActive` status
   - Check `conditionValue` matches user stats

2. **Streak not updating**
   - Verify `ActivityService.afterLogin()` is called
   - Check `lastActive` date comparison logic
   - Ensure `userId` is correct

3. **Permission errors**
   - Verify user has required permissions
   - Check role assignments in database
   - Ensure session is valid

## 📝 Development Notes

- Badge evaluation is automatic - no manual awarding
- Progress is calculated dynamically based on user activity
- System is designed to be extensible for new badge types
- All badge-related logic is centralized in `BadgeService`
- Activity triggers are centralized in `ActivityService`
