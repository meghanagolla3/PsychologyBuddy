import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';
import prisma from '@/src/prisma';

export const GET = withPermission({ 
  module: 'ESCALATIONS', 
  action: 'VIEW' 
})(async (req: NextRequest, { params, user }: any) => {
  try {
    const { id } = await params;
    
    // Ensure user is a counselor
    if (user.role.name !== 'COUNSELOR') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Counselors only.' },
        { status: 403 }
      );
    }

    // Get counselor's school ID
    const counselorSchoolId = user.schoolId;
    if (!counselorSchoolId) {
      return NextResponse.json(
        { success: false, message: 'Counselor is not assigned to a school.' },
        { status: 400 }
      );
    }

    // Check if the student is assigned to this counselor
    const counselorAssignment = await prisma.counselorAssignment.findFirst({
      where: {
        counselorId: user.id,
        studentId: id
      }
    });

    if (!counselorAssignment) {
      return NextResponse.json(
        { success: false, message: 'Student not assigned to this counselor.' },
        { status: 403 }
      );
    }

    // Debug: Log the query parameters
    console.log('API Query Debug:', {
      searchingForId: id,
      counselorSchoolId: counselorSchoolId
    });

    // Fetch student details with comprehensive data
    const student = await prisma.user.findFirst({
      where: {
        id: id,
        schoolId: counselorSchoolId,
        role: { name: 'STUDENT' }
      },
      include: {
        classRef: true,
        school: true,
        location: true,
        escalationAlerts: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Get recent alerts
        },
        studentCounselingSessions: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Get recent sessions
          include: {
            counselor: true
          }
        },
        moodCheckins: {
          orderBy: { createdAt: 'desc' },
          take: 30, // Get recent mood data
        },
        writingJournals: {
          orderBy: { createdAt: 'desc' },
          take: 20, // Get recent journals
        },
        audioJournals: {
          orderBy: { createdAt: 'desc' },
          take: 20, // Get recent audio journals
        },
        artJournals: {
          orderBy: { createdAt: 'desc' },
          take: 20, // Get recent art journals
        },
        musicTherapy: {
          orderBy: { createdAt: 'desc' },
          take: 20, // Get recent music therapy sessions
        },
        streaks: true,
        userBadges: {
          include: {
            badge: true
          }
        },
        completions: {
          orderBy: { createdAt: 'desc' },
          take: 50, // Get recent activity
        },
        meditations: {
          orderBy: { createdAt: 'desc' },
          take: 20, // Get meditation sessions
        },
        savedArticles: {
          orderBy: { createdAt: 'desc' },
          take: 20, // Get article views
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found.' },
        { status: 404 }
      );
    }

    // Debug logging for each data type
    console.log('Student data debug:', {
      savedArticles: student.savedArticles?.length || 0,
      writingJournals: student.writingJournals?.length || 0,
      audioJournals: student.audioJournals?.length || 0,
      artJournals: student.artJournals?.length || 0,
      musicTherapy: student.musicTherapy?.length || 0,
      meditations: student.meditations?.length || 0,
      userBadges: student.userBadges?.length || 0,
      completions: student.completions?.length || 0
    });

    // Detailed journal debugging
    console.log('Writing Journals:', student.writingJournals);
    console.log('Audio Journals:', student.audioJournals);
    console.log('Art Journals:', student.artJournals);
    
    // Check if student ID matches
    console.log('Student ID from params:', id);
    console.log('Student ID from data:', student.id);

    // Calculate platform activity with actual counts
    const platformActivity = [
      { 
        type: "Articles", 
        count: student.savedArticles?.length || 0 
      },
      { 
        type: "Journaling", 
        count: (student.writingJournals?.length || 0) + 
               (student.audioJournals?.length || 0) + 
               (student.artJournals?.length || 0)
      },
      { 
        type: "Music", 
        count: student.musicTherapy?.length || 0 
      },
      { 
        type: "Meditation", 
        count: student.meditations?.length || 0 
      },
      { 
        type: "Badges", 
        count: student.userBadges?.length || 0 
      },
      { 
        type: "Challenges", 
        count: student.completions?.length || 0 
      },
    ];

    console.log('Final platform activity:', platformActivity);

    // Calculate basic stats
    const currentStreak = student.streaks?.count || 0;
    const badgesEarned = student.userBadges?.length || 0;
    const challengesCompleted = student.completions?.length || 0;
    
    // Calculate engagement status
    let engagementStatus = "Low";
    const totalActivity = (student.userBadges?.length || 0) + 
                         (student.writingJournals?.length || 0) + 
                         (student.meditations?.length || 0);
    
    if (totalActivity >= 20) engagementStatus = "High";
    else if (totalActivity >= 10) engagementStatus = "Medium";

    // Transform escalation alerts
    const transformedAlerts = student.escalationAlerts?.map((alert: any) => ({
      id: alert.id,
      category: alert.category,
      severity: alert.severity,
      description: alert.description,
      createdAt: alert.createdAt,
      status: alert.status || 'Active',
      text: alert.description
    })) || [];

    // Transform counseling sessions
    const transformedSessions = student.studentCounselingSessions?.map((session: any) => ({
      id: session.id,
      counselorName: session.counselor.firstName + ' ' + session.counselor.lastName,
      notes: session.notes || 'Session notes not available',
      tags: [],
      createdAt: session.createdAt,
      date: new Date(session.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      highlight: new Date(session.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      text: session.notes || 'Session notes not available',
      name: session.counselor.firstName + ' ' + session.counselor.lastName
    })) || [];

    // Determine last active time
    const lastActiveAt = student.createdAt;

    const studentData = {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      studentId: student.studentId,
      classRef: student.classRef,
      school: student.school,
      status: student.status,
      createdAt: student.createdAt,
      lastActiveAt: lastActiveAt,
      escalationAlerts: transformedAlerts,
      counselingSessions: transformedSessions,
      platformActivity: platformActivity,
      stats: {
        currentStreak,
        badgesEarned,
        challengesCompleted,
        engagementStatus
      }
    };

    return NextResponse.json({
      success: true,
      data: studentData,
      message: 'Student details retrieved successfully'
    });

  } catch (error) {
    console.error('Get student details error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});
