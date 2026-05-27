import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { RecentActivityService } from '@/src/server/services/recent-activity.service';

export const GET = withPermission({ 
  module: 'ACTIVITY', 
  action: 'VIEW' 
})(async (request: NextRequest, { user }: any) => {
  console.log('API: /api/admin/alerts called', { userId: user.id, url: request.url });
  
  
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const type = 'alert'; // Always filter for alerts
    const classId = searchParams.get('classId') || undefined;
    const schoolId = searchParams.get('schoolId') || undefined;
    const dateRange = searchParams.get('dateRange') || 'month'; // Default to month to get more data
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('API: Parsed parameters', { search, type, classId, schoolId, dateRange, limit, offset });

    // Get alerts with role-based filtering
    const result = await RecentActivityService.getRecentActivities(
      user.id,
      {
        search,
        type,
        classId,
        schoolId,
        dateRange,
        limit,
        offset
      }
    );

    console.log('API: RecentActivityService returned', { 
      activitiesCount: result.activities?.length || 0, 
      total: result.total 
    });

    const response = {
      success: true,
      data: result.activities || [],
      total: result.total || 0,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < (result.total || 0)
      }
    };

    
    console.log('API: Sending response', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('API: Error fetching alerts:', error);
    console.error('API: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch alerts',
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
        total: 0
      },
      { status: 500 }
    );
  }
});
