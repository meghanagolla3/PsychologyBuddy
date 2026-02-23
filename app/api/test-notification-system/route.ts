import { NextResponse } from "next/server";
import prisma from "@/src/prisma";

export async function GET() {
  try {
    console.log('[TestNotificationSystem] Starting comprehensive test...');

    // Step 1: Create a test escalation alert
    console.log('[TestNotificationSystem] Creating test escalation alert...');
    const alert = await prisma.escalationAlert.create({
      data: {
        studentId: 'test-student-999',
        studentName: 'Test Student',
        studentClass: 'Class 10-C',
        sessionId: 'test-session-notification',
        category: 'violence',
        level: 'critical',
        severity: 9.8,
        confidence: 0.95,
        detectedPhrases: ['kill everyone', 'end it all'],
        context: 'Test notification system verification',
        recommendation: 'IMMEDIATE INTERVENTION REQUIRED - Contact emergency services and school counseling immediately',
        description: 'Test escalation for notification system verification.',
        detectionMethod: 'Test Alert',
        messageContent: 'I want to kill everyone and end it all right now.',
        messageTimestamp: new Date().toISOString(),
        requiresImmediateAction: true,
        status: 'open',
        priority: 'critical',
      }
    });

    console.log('[TestNotificationSystem] Alert created:', alert.id);

    // Step 2: Create corresponding admin notification
    console.log('[TestNotificationSystem] Creating admin notification...');
    const notification = await prisma.adminNotification.create({
      data: {
        userId: 'admin',
        type: 'escalation',
        message: `🚨 CRITICAL ESCALATION: VIOLENCE`,
        severity: 'critical',
        alertId: alert.id,
        read: false
      }
    });

    console.log('[TestNotificationSystem] Notification created:', notification.id);

    // Step 3: Verify the notification can be fetched
    console.log('[TestNotificationSystem] Verifying notification retrieval...');
    const notifications = await prisma.adminNotification.findMany({
      where: { read: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        alert: {
          select: {
            studentName: true,
            studentClass: true,
            priority: true,
            category: true,
            description: true
          }
        }
      }
    });

    console.log(`[TestNotificationSystem] Found ${notifications.length} unread notifications`);

    return NextResponse.json({
      success: true,
      message: "Notification system test completed successfully",
      alert: {
        id: alert.id,
        priority: alert.priority,
        category: alert.category,
        studentName: alert.studentName
      },
      notification: {
        id: notification.id,
        type: notification.type,
        severity: notification.severity,
        message: notification.message,
        read: notification.read
      },
      totalUnread: notifications.length,
      recentNotifications: notifications.map(n => ({
        id: n.id,
        message: n.message,
        severity: n.severity,
        timestamp: n.createdAt.toISOString()
      }))
    });

  } catch (error) {
    console.error('[TestNotificationSystem] Error:', error);
    
    return NextResponse.json(
      { 
        error: "Failed to test notification system",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
