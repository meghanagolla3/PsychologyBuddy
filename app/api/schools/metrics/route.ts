import { NextRequest } from 'next/server';
import { UserService } from '@/src/services/user.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';

// GET /api/schools/metrics - Get platform metrics (Superadmin only)
export const GET = withPermission({ 
  module: 'ORGANIZATIONS', 
  action: 'VIEW' 
})(async (req: NextRequest) => {
  try {
    // Get total schools count
    const totalSchools = await prisma.school.count();

    // Get total students count (users with STUDENT role)
    const totalStudents = await prisma.user.count({
      where: {
        role: {
          name: 'STUDENT'
        }
      }
    });

    // Get active alerts count (high risk alerts)
    const activeAlerts = await prisma.highRiskAlert.count({
      where: {
        resolved: false
      }
    });

    // Get check-ins today count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkinsToday = await prisma.moodCheckin.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const metrics = {
      totalSchools,
      totalStudents,
      activeAlerts,
      checkinsToday
    };

    return Response.json({
      success: true,
      data: metrics,
      message: 'Metrics retrieved successfully'
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});
