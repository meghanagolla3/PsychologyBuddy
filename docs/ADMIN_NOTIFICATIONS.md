# Admin Notification System

This document provides a comprehensive overview of the admin notification system in Psychology Buddy, including how it works, what it includes, and how to configure it.

## Table of Contents

1. [Overview](#overview)
2. [In-App Notifications](#in-app-notifications)
3. [Escalation Email Notifications](#escalation-email-notifications)
4. [Daily Summary Email Notifications](#daily-summary-email-notifications)
5. [Database Schema](#database-schema)
6. [Configuration](#configuration)
7. [API Endpoints](#api-endpoints)
8. [Usage Examples](#usage-examples)

---

## Overview

The Psychology Buddy platform provides multiple notification channels for administrators to stay informed about student activities, escalation alerts, and platform metrics:

- **In-App Notifications**: Real-time notifications displayed in the admin dashboard
- **Escalation Email Notifications**: Immediate email alerts for critical escalation events
- **Daily Summary Email Notifications**: Comprehensive daily reports of platform activity

All notification systems work together to ensure administrators are promptly informed about important events and have access to comprehensive platform analytics.

---

## In-App Notifications

### Overview

In-app notifications provide real-time updates to administrators directly in the admin dashboard using Server-Sent Events (SSE). These notifications appear as toast popups and are stored in a notification center.

### Features

- **Real-time Updates**: Uses Server-Sent Events for instant notification delivery
- **Notification Types**: escalation, system, message
- **Priority Levels**: critical, high, medium, low
- **Read/Unread Status**: Track which notifications have been read
- **Toast Alerts**: Automatic toast notifications for critical/high priority escalations
- **Notification Center**: Centralized view of all notifications
- **Bulk Actions**: Mark as read and clear all notifications

### Notification Types

| Type | Description | Priority |
|------|-------------|----------|
| `escalation` | Student escalation alerts requiring attention | critical/high |
| `system` | System updates and maintenance notifications | medium/low |
| `message` | Direct messages from students or other admins | medium |

### Priority Levels

- **critical**: Immediate attention required (e.g., self-harm detection)
- **high**: Urgent attention needed (e.g., violence detection)
- **medium**: Important but not urgent (e.g., behavioral concerns)
- **low**: Informational (e.g., system updates)

### Implementation

The in-app notification system is implemented in:

- **Hook**: `src/hooks/use-admin-notifications.ts`
- **API**: `app/api/admin/notifications/route.ts`
- **Stream**: `app/api/admin/notifications/stream/route.ts`
- **Service**: `src/services/escalations/escalation-alert-service.ts` (creates notifications for escalations)

### School-Wise and Role-Wise Filtering

In-app notifications for escalation alerts follow the same school-wise and role-wise filtering as email notifications:

- **School Filtering**: Only admins from the student's school receive notifications
- **Role Filtering**: Different roles are notified based on escalation severity
- **Duplicate Prevention**: Checks for existing notifications before creating new ones

**Code Example**:
```typescript
// From escalation-alert-service.ts
const staffUsers = await prisma.user.findMany({
  where: {
    schoolId: schoolId, // Filter by student's school
    role: {
      name: {
        in: staffRoles // Filter by role
      }
    }
  }
});
```

### Usage Example

```typescript
import { useAdminNotifications } from '@/src/hooks/use-admin-notifications'

function AdminDashboard() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
    refetch
  } = useAdminNotifications()

  return (
    <div>
      <NotificationBell count={unreadCount} />
      <NotificationList
        notifications={notifications}
        onMarkRead={markAsRead}
        onClearAll={clearAll}
      />
    </div>
  )
}
```

### Real-time Updates

The system uses Server-Sent Events (SSE) to push notifications in real-time:

```typescript
const eventSource = new EventSource('/api/admin/notifications/stream')

eventSource.onmessage = (event) => {
  const newNotification = JSON.parse(event.data)
  // Process notification
}
```

---

## Escalation Email Notifications

### Overview

Escalation email notifications automatically send detailed email alerts to relevant administrators when student escalation alerts are created. These emails provide comprehensive information about the escalation and recommended actions.

### Features

- **Automatic Triggering**: Emails sent immediately when escalation alerts are created
- **Organization-Specific**: Only admins from the student's school receive notifications
- **Severity-Based Recipients**: Different admin roles notified based on escalation severity
- **Professional Templates**: Beautiful HTML email templates with severity-based styling
- **Comprehensive Details**: Student information, alert details, context, and recommendations
- **Text Fallback**: Plain text version for email clients that don't support HTML

### Recipients by Escalation Level

| Escalation Level | School Super Admins | School Admins | Counselors | Teachers |
|------------------|---------------------|---------------|------------|----------|
| Low | ✓ | ✓ | ✓ | ✗ |
| Medium | ✓ | ✓ | ✓ | ✗ |
| High | ✓ | ✓ | ✓ | ✓ |
| Critical | ✓ | ✓ | ✓ | ✓ |

### School-Wise Filtering

**Important**: All notifications (both email and in-app) are filtered by school. When a student triggers an escalation alert, only administrators from that student's school receive notifications. This ensures:

- **Data Privacy**: Schools only see alerts for their own students
- **Reduced Noise**: Admins are not notified about students from other schools
- **Targeted Response**: The right people are notified for each situation

**Implementation**:
- Email notifications: `EscalationEmailService.getAdminRecipients()` filters by student's schoolId
- In-app notifications: `EscalationAlertService.createAdminNotifications()` filters by student's schoolId
- SMS/Webhook notifications: `EscalationAlertService.getStaffToNotify()` filters by schoolId

### Duplicate Prevention

The notification system includes built-in duplicate prevention:

- **Database Check**: Before creating a notification, the system checks if a notification already exists for the same user and alert
- **Deduplication**: Staff lists are deduplicated by user ID before sending notifications
- **Skip Logic**: If a notification already exists, it is skipped to prevent duplicates

**Implementation**:
```typescript
// Check if notification already exists
const existing = await prisma.adminNotification.findFirst({
  where: { userId: staff.id, alertId: alertId }
});
if (existing) {
  notificationsSkipped++;
  continue;
}
```

### Email Content

Each escalation email includes:

- **Student Information**: Name, class, student ID, school
- **Alert Details**: Category, severity level, detection method, timestamp
- **Description**: Detailed description of the escalation
- **Detected Phrases**: Key phrases that triggered the alert
- **Context**: Additional context surrounding the alert
- **Recommendations**: Suggested actions for administrators
- **Action Required**: Indicator if immediate attention is needed

### Categories

- `self_harm` - Self-harm indicators
- `violence` - Violence or aggression indicators
- `abuse` - Abuse indicators
- `substance_abuse` - Substance abuse indicators
- `mental_health_crisis` - Mental health crisis indicators
- `behavioral_concern` - General behavioral concerns
- `check_in_missed` - Missed mood check-ins
- `mood_trend_decline` - Declining mood trends
- `other` - Other concerns

### Implementation

The escalation email service is implemented in:

- **Service**: `src/services/escalations/escalation-email-service.ts`
- **Email Sender**: `src/services/escalations/email-sender.ts`
- **Integration**: `src/services/escalations/escalation-alert-service.ts`

### Email Template Example

```
Subject: ⚠️ CRITICAL ESCALATION: SELF_HARM - John Doe

[Header with severity indicator]
[Student information card]
[Alert description]
[Recommendations]
[Action required warning]
[Link to admin dashboard]
```

### Configuration

Environment variables required:

```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Psychology Buddy" <noreply@psychologybuddy.com>
```

---

## Daily Summary Email Notifications

### Overview

Daily summary emails provide administrators with a comprehensive overview of platform activity, sent automatically at a configured time each day.

### Features

- **Automated Scheduling**: Configurable daily send time (default: 9:00 AM)
- **Comprehensive Metrics**: All key platform activity data
- **Visual Design**: Professional HTML templates with data visualization
- **Multi-Recipient**: Sent to all admin users
- **Historical Data**: Can generate summaries for any historical date
- **Manual Trigger**: Can be sent manually via API

### Metrics Included

#### Student Activity
- Total students
- Active students (logged in today)
- New users (registered today)

#### Chat Activity
- Total chat sessions
- Total messages sent

#### Escalation Alerts
- Total alerts
- Alerts by level (critical, high, medium, low)
- Alerts by category
- Critical and high priority alerts highlighted

#### Mood Check-ins
- Total check-ins
- Average mood (Positive/Neutral/Concerning)
- Mood distribution

#### Journaling Activity
- Writing journals
- Audio journals
- Art journals

#### Meditation Activity
- Total sessions
- Total minutes
- Top meditation categories

#### Article Activity
- Total views
- Total completions
- Average rating

#### School Statistics
- Total schools
- Active schools

### Implementation

The daily summary service is implemented in:

- **Service**: `src/services/escalations/daily-summary-email-service.ts`
- **Scheduler**: `src/services/scheduler/daily-summary-scheduler.ts`
- **API**: `app/api/admin/daily-summary/route.ts`

### API Endpoints

#### Send Daily Summary
```bash
POST /api/admin/daily-summary
Content-Type: application/json

{
  "action": "send"
}
```

#### Test Daily Summary (without sending)
```bash
POST /api/admin/daily-summary
Content-Type: application/json

{
  "action": "test"
}
```

#### Send for Specific Date
```bash
POST /api/admin/daily-summary
Content-Type: application/json

{
  "action": "send",
  "date": "2024-01-15"
}
```

#### Check Status
```bash
GET /api/admin/daily-summary
```

#### Start/Stop Scheduler
```bash
POST /api/admin/daily-summary
Content-Type: application/json

{
  "action": "start"
}

{
  "action": "stop"
}
```

### Configuration

Environment variables:

```env
# Email Configuration (shared with escalation emails)
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Psychology Buddy" <noreply@psychologybuddy.com>

# Daily Summary Configuration
DAILY_SUMMARY_ENABLED=true
DAILY_SUMMARY_HOUR=9
DAILY_SUMMARY_MINUTE=0
```

---

## Database Schema

### AdminNotification Model

```prisma
model AdminNotification {
  id          String           @id @default(cuid())
  userId      String
  alertId     String?
  type        String           // escalation, system, message
  message     String
  severity    String           // critical, high, medium, low
  read        Boolean          @default(false)
  createdAt   DateTime         @default(now())
  readAt      DateTime?
  
  user        User             @relation(fields: [userId], references: [id])
  alert       EscalationAlert? @relation(fields: [alertId], references: [id])
  
  @@index([userId])
  @@index([alertId])
  @@index([read])
  @@index([createdAt])
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique notification identifier |
| `userId` | String | ID of the admin user receiving the notification |
| `alertId` | String? | ID of the associated escalation alert (optional) |
| `type` | String | Notification type (escalation, system, message) |
| `message` | String | Notification message content |
| `severity` | String | Priority level (critical, high, medium, low) |
| `read` | Boolean | Whether the notification has been read |
| `createdAt` | DateTime | When the notification was created |
| `readAt` | DateTime? | When the notification was marked as read |

### Relations

- **user**: Belongs to a User (admin)
- **alert**: Optionally associated with an EscalationAlert

---

## Configuration

### Environment Variables

#### Email Configuration (Required for email notifications)

```env
# Enable/disable email notifications
EMAIL_ENABLED=true

# SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Psychology Buddy" <noreply@psychologybuddy.com>
```

#### Daily Summary Configuration

```env
# Enable/disable daily summary emails
DAILY_SUMMARY_ENABLED=true

# Send time (24-hour format)
DAILY_SUMMARY_HOUR=9
DAILY_SUMMARY_MINUTE=0
```

### Email Service Providers

The system supports any SMTP-compatible email service:

- **Gmail**: Requires app password for authentication
- **SendGrid**: Use SMTP credentials from SendGrid dashboard
- **AWS SES**: Use SMTP credentials from AWS SES
- **Nodemailer**: Any SMTP-compatible service

---

## API Endpoints

### In-App Notifications

#### Fetch Notifications
```bash
GET /api/admin/notifications
```

Response:
```json
{
  "notifications": [
    {
      "id": "notif_123",
      "type": "escalation",
      "title": "Escalation Alert",
      "message": "Student John Doe triggered a self-harm alert",
      "priority": "critical",
      "timestamp": "2024-01-15T10:30:00Z",
      "read": false,
      "actionUrl": "/admin/alerts/123"
    }
  ],
  "unreadCount": 5
}
```

#### Mark as Read
```bash
PATCH /api/admin/notifications/read
Content-Type: application/json

{
  "notificationIds": ["notif_123", "notif_456"]
}
```

#### Clear All Notifications
```bash
DELETE /api/admin/notifications/clear?clearAll=true
```

#### Notification Stream (SSE)
```bash
GET /api/admin/notifications/stream
```

### Daily Summary

#### Send Daily Summary
```bash
POST /api/admin/daily-summary
Content-Type: application/json

{
  "action": "send"
}
```

#### Test Daily Summary
```bash
POST /api/admin/daily-summary
Content-Type: application/json

{
  "action": "test"
}
```

#### Check Scheduler Status
```bash
GET /api/admin/daily-summary
```

Response:
```json
{
  "enabled": true,
  "running": true,
  "nextRun": "2024-01-16T09:00:00Z",
  "lastRun": "2024-01-15T09:00:00Z"
}
```

---

## Usage Examples

### Creating an In-App Notification

```typescript
import prisma from '@/prisma'

async function createNotification(userId: string, alertId: string) {
  const notification = await prisma.adminNotification.create({
    data: {
      userId,
      alertId,
      type: 'escalation',
      message: 'Student triggered a self-harm alert',
      severity: 'critical'
    }
  })

  // This will automatically trigger SSE push to connected clients
  return notification
}
```

### Sending Escalation Email

```typescript
import { EscalationEmailService } from '@/src/services/escalations/escalation-email-service'

// Automatically triggered when escalation alert is created
await EscalationEmailService.sendEscalationEmails(alertId)
```

### Sending Daily Summary

```typescript
import { DailySummaryEmailService } from '@/src/services/escalations/daily-summary-email-service'

// Send for today
await DailySummaryEmailService.sendDailySummaryEmails()

// Send for specific date
await DailySummaryEmailService.sendDailySummaryEmails(new Date('2024-01-15'))

// Test without sending
await DailySummaryEmailService.testDailySummary()
```

### Using the Admin Notifications Hook

```typescript
import { useAdminNotifications } from '@/src/hooks/use-admin-notifications'

function NotificationComponent() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
    refetch
  } = useAdminNotifications()

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId)
    // Navigate to relevant page
  }

  return (
    <div>
      <div className="notification-bell">
        <Bell />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </div>
      
      <div className="notification-list">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            onClick={() => handleNotificationClick(notification.id)}
          >
            <div className="priority-{notification.priority}">
              {notification.message}
            </div>
            <div className="timestamp">
              {new Date(notification.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      
      <button onClick={clearAll}>Clear All</button>
    </div>
  )
}
```

---

## Troubleshooting

### Emails Not Sending

1. **Check Email Configuration**: Verify all email environment variables are set correctly
2. **Test SMTP Connection**: Use the EmailSender test function to verify connectivity
3. **Check Logs**: Review server logs for email sending errors
4. **Verify Recipients**: Ensure admin users have valid email addresses

### In-App Notifications Not Updating

1. **Check SSE Connection**: Verify the EventSource connection is established
2. **Check API Endpoints**: Ensure notification API routes are accessible
3. **Review Browser Console**: Check for JavaScript errors
4. **Verify User Authentication**: Ensure user is authenticated and has admin role

### Daily Summary Not Sending

1. **Check Scheduler Status**: Verify scheduler is running via API endpoint
2. **Check Configuration**: Ensure DAILY_SUMMARY_ENABLED is true
3. **Verify Send Time**: Check DAILY_SUMMARY_HOUR and DAILY_SUMMARY_MINUTE
4. **Manual Trigger**: Try manually triggering the summary via API

---

## Security Considerations

- **Email Credentials**: Store email credentials securely in environment variables
- **Recipient Filtering**: Only send notifications to authorized admin users
- **Data Privacy**: Ensure sensitive student information is protected
- **Rate Limiting**: Implement rate limiting for notification API endpoints
- **Access Control**: Verify user permissions before accessing notification data

---

## Future Enhancements

- **Push Notifications**: Add browser push notification support
- **SMS Notifications**: Add SMS notifications for critical alerts
- **Notification Preferences**: Allow admins to customize notification preferences
- **Notification Groups**: Group notifications by category or student
- **Analytics Dashboard**: Add notification analytics and reporting
- **Mobile App**: Extend notification system to mobile applications
