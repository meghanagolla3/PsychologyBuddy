import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import prisma from '@/src/prisma';
import { v4 as uuidv4 } from 'uuid';

export const POST = withPermission({
  module: 'CHALLENGES',
  action: 'CREATE',
})(async (req: NextRequest, { user }: any) => {
  try {
    console.log('🌱 Seeding challenges for admin:', user.email);

    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true }
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    console.log(`📝 Using admin user: ${adminUser.email}`);

    // Create sample challenges
    const challenges = [
      {
        name: 'Daily Journal Entry',
        description: 'Write a journal entry every day to express your thoughts and feelings',
        instructions: 'Take 5-10 minutes to write about your day, feelings, or any thoughts on your mind.',
        requiresJournaling: true,
        requiresMeditation: false,
        requiresMusic: false,
        requiresPsychoeducation: false,
        assignmentType: 'INDIVIDUAL',
        category: 'DAILY',
        moduleType: 'JOURNALING',
        challengeType: 'DAILY',
        targetValue: 1,
        targetUnit: 'ENTRIES',
        createdBy: adminUser.id,
        schoolId: adminUser.schoolId,
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      {
        name: '7-Day Journal Streak',
        description: 'Write journal entries for 7 consecutive days',
        instructions: 'Commit to writing in your journal every day for a full week. Track your progress and maintain consistency.',
        requiresJournaling: true,
        requiresMeditation: false,
        requiresMusic: false,
        requiresPsychoeducation: false,
        assignmentType: 'INDIVIDUAL',
        category: 'STREAK',
        moduleType: 'JOURNALING',
        challengeType: 'STREAK',
        targetValue: 7,
        targetUnit: 'ENTRIES',
        createdBy: adminUser.id,
        schoolId: adminUser.schoolId,
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      {
        name: '30-Day Journal Challenge',
        description: 'Complete 30 journal entries in one month',
        instructions: 'Write at least one journal entry every day for 30 days. This builds a consistent journaling habit.',
        requiresJournaling: true,
        requiresMeditation: false,
        requiresMusic: false,
        requiresPsychoeducation: false,
        assignmentType: 'INDIVIDUAL',
        category: 'MILESTONE',
        moduleType: 'JOURNALING',
        challengeType: 'MILESTONE',
        targetValue: 30,
        targetUnit: 'ENTRIES',
        createdBy: adminUser.id,
        schoolId: adminUser.schoolId,
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      {
        name: 'Daily Meditation - 10 Minutes',
        description: 'Meditate for 10 minutes every day',
        instructions: 'Find a quiet space and meditate for 10 minutes. Focus on your breath and be present.',
        requiresJournaling: false,
        requiresMeditation: true,
        requiresMusic: false,
        requiresPsychoeducation: false,
        assignmentType: 'INDIVIDUAL',
        category: 'DAILY',
        moduleType: 'MEDITATION',
        challengeType: 'DAILY',
        targetValue: 10,
        targetUnit: 'MINUTES',
        createdBy: adminUser.id,
        schoolId: adminUser.schoolId,
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      {
        name: 'Weekly Meditation - 5 Sessions',
        description: 'Complete 5 meditation sessions this week',
        instructions: 'Attend 5 meditation sessions throughout the week. Each session should be at least 10 minutes.',
        requiresJournaling: false,
        requiresMeditation: true,
        requiresMusic: false,
        requiresPsychoeducation: false,
        assignmentType: 'INDIVIDUAL',
        category: 'WEEKLY',
        moduleType: 'MEDITATION',
        challengeType: 'WEEKLY',
        targetValue: 5,
        targetUnit: 'SESSIONS',
        createdBy: adminUser.id,
        schoolId: adminUser.schoolId,
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      {
        name: 'Meditation Explorer - Try 3 Different Types',
        description: 'Try 3 different types of meditation this month',
        instructions: 'Explore different meditation techniques like mindfulness, body scan, and loving-kindness meditation.',
        requiresJournaling: false,
        requiresMeditation: true,
        requiresMusic: false,
        requiresPsychoeducation: false,
        assignmentType: 'INDIVIDUAL',
        category: 'EXPLORATION',
        moduleType: 'MEDITATION',
        challengeType: 'MILESTONE',
        targetValue: 3,
        targetUnit: 'SESSIONS',
        createdBy: adminUser.id,
        schoolId: adminUser.schoolId,
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      {
        name: 'Daily Music Therapy - 15 Minutes',
        description: 'Listen to calming music for 15 minutes daily',
        instructions: 'Set aside 15 minutes each day to listen to therapeutic music. Focus on relaxation and stress relief.',
        requiresJournaling: false,
        requiresMeditation: false,
        requiresMusic: true,
        requiresPsychoeducation: false,
        assignmentType: 'INDIVIDUAL',
        category: 'DAILY',
        moduleType: 'MUSIC',
        createdBy: adminUser.id,
        schoolId: adminUser.schoolId,
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      {
        name: 'Music Mood Journey - 7 Days',
        description: 'Explore different music genres for 7 consecutive days',
        instructions: 'Each day, listen to music from a different genre to explore how it affects your mood and emotions.',
        requiresJournaling: false,
        requiresMeditation: false,
        requiresMusic: true,
        requiresPsychoeducation: false,
        assignmentType: 'INDIVIDUAL',
        category: 'EXPLORATION',
        moduleType: 'MUSIC',
        createdBy: adminUser.id,
        schoolId: adminUser.schoolId,
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      {
        name: 'Daily Learning - Read One Article',
        description: 'Read one educational article every day',
        instructions: 'Read at least one article about mental health, wellness, or personal development each day.',
        requiresJournaling: false,
        requiresMeditation: false,
        requiresMusic: false,
        requiresPsychoeducation: true,
        assignmentType: 'INDIVIDUAL',
        category: 'DAILY',
        moduleType: 'ARTICLE',
        createdBy: adminUser.id,
        schoolId: adminUser.schoolId,
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      {
        name: 'Weekly Reading - 5 Articles',
        description: 'Read 5 articles this week about mental wellness',
        instructions: 'Read and reflect on 5 different articles throughout the week. Take notes on key insights.',
        requiresJournaling: false,
        requiresMeditation: false,
        requiresMusic: false,
        requiresPsychoeducation: true,
        assignmentType: 'INDIVIDUAL',
        category: 'WEEKLY',
        moduleType: 'ARTICLE',
        createdBy: adminUser.id,
        schoolId: adminUser.schoolId,
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      {
        name: 'Knowledge Seeker - 20 Articles',
        description: 'Read 20 articles about mental health and wellness',
        instructions: 'Build your knowledge by reading 20 different articles on various mental health topics.',
        requiresJournaling: false,
        requiresMeditation: false,
        requiresMusic: false,
        requiresPsychoeducation: true,
        assignmentType: 'INDIVIDUAL',
        category: 'MILESTONE',
        moduleType: 'ARTICLE',
        createdBy: adminUser.id,
        schoolId: adminUser.schoolId,
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      }
    ];

    // Insert challenges
    console.log('📝 Creating challenges...');
    let createdChallenges = 0;
    
    for (const challenge of challenges) {
      try {
        await prisma.challenge.create({
          data: {
            ...challenge,
            id: uuidv4()
          } as any
        });
        console.log(`✅ Created challenge: ${challenge.name}`);
        createdChallenges++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Challenge "${challenge.name}" already exists`);
        } else {
          console.error(`❌ Error creating challenge "${challenge.name}":`, error.message);
        }
      }
    }

    // Create sample badges
    const badges = [
      {
        name: 'Journal Starter',
        description: 'Completed your first journal entry',
        requirement: 'Complete 1 journal entry',
        icon: '📝',
        type: 'ACHIEVEMENT',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Meditation Beginner',
        description: 'Completed your first meditation session',
        requirement: 'Complete 1 meditation session',
        icon: '🧘',
        type: 'ACHIEVEMENT',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Music Explorer',
        description: 'Listened to music for relaxation',
        requirement: 'Complete 1 music session',
        icon: '🎵',
        type: 'ACHIEVEMENT',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Knowledge Seeker',
        description: 'Read your first educational article',
        requirement: 'Read 1 article',
        icon: '📚',
        type: 'ACHIEVEMENT',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Week Warrior',
        description: 'Maintained a 7-day streak',
        requirement: 'Complete activities for 7 consecutive days',
        icon: '🔥',
        type: 'STREAK',
        isActive: true,
        createdBy: adminUser.id
      },
      {
        name: 'Consistency Champion',
        description: 'Maintained a 30-day streak',
        requirement: 'Complete activities for 30 consecutive days',
        icon: '🏆',
        type: 'STREAK',
        isActive: true,
        createdBy: adminUser.id
      }
    ];

    // Insert badges
    console.log('🏆 Creating badges...');
    let createdBadges = 0;
    
    for (const badge of badges) {
      try {
        await prisma.badge.create({
          data: {
            ...badge,
            id: uuidv4()
          } as any
        });
        console.log(`✅ Created badge: ${badge.name}`);
        createdBadges++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Badge "${badge.name}" already exists`);
        } else {
          console.error(`❌ Error creating badge "${badge.name}":`, error.message);
        }
      }
    }

    console.log('✅ Successfully seeded challenges!');
    console.log(`📊 Created ${createdChallenges} challenges and ${createdBadges} badges`);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${createdChallenges} challenges and ${createdBadges} badges`,
      data: {
        challengesCreated: createdChallenges,
        badgesCreated: createdBadges
      }
    });

  } catch (error) {
    console.error('❌ Error seeding challenges:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed challenges',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
