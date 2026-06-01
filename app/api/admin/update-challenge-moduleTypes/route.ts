import { NextResponse } from 'next/server';
import prisma from '@/src/prisma';
import { requireRole } from '@/src/utils/session-helper';

export async function POST(req: Request) {
  try {
    const session = await requireRole(req, 'SUPERADMIN');

    console.log('🔄 Updating challenge moduleTypes...');

    // Update journaling challenges
    const journalingResult = await prisma.challenge.updateMany({
      where: {
        requiresJournaling: true,
        moduleType: null
      },
      data: {
        moduleType: 'JOURNALING'
      }
    });
    console.log(`✅ Updated ${journalingResult.count} journaling challenges`);

    // Update meditation challenges
    const meditationResult = await prisma.challenge.updateMany({
      where: {
        requiresMeditation: true,
        moduleType: null
      },
      data: {
        moduleType: 'MEDITATION'
      }
    });
    console.log(`✅ Updated ${meditationResult.count} meditation challenges`);

    // Update music challenges
    const musicResult = await prisma.challenge.updateMany({
      where: {
        requiresMusic: true,
        moduleType: null
      },
      data: {
        moduleType: 'MUSIC'
      }
    });
    console.log(`✅ Updated ${musicResult.count} music challenges`);

    // Update article challenges
    const articleResult = await prisma.challenge.updateMany({
      where: {
        requiresPsychoeducation: true,
        moduleType: null
      },
      data: {
        moduleType: 'ARTICLE'
      }
    });
    console.log(`✅ Updated ${articleResult.count} article challenges`);

    console.log('🎉 All challenge moduleTypes updated successfully!');

    return NextResponse.json({
      success: true,
      message: 'Challenge moduleTypes updated successfully',
      counts: {
        journaling: journalingResult.count,
        meditation: meditationResult.count,
        music: musicResult.count,
        article: articleResult.count
      }
    });

  } catch (error: any) {
    console.error('❌ Error updating challenge moduleTypes:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
