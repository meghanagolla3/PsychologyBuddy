import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Student ID required' },
        { status: 400 }
      );
    }

    // For now, return a simple test response to get the frontend working
    // We'll implement the full database query later
    return NextResponse.json({
      success: true,
      data: [
        {
          id: "cmlpkh89s0003nwf0jbkjg2oe",
          title: "Relaxing Melody",
          description: "Calming instrumental music for relaxation and stress relief",
          url: "https://example.com/music.mp3",
          duration: 300,
          artist: "Various Artists",
          album: "Relaxation Collection",
          coverImage: "https://picsum.photos/seed/music/400/400",
          schoolId: null,
          createdBy: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          savedAt: new Date().toISOString(),
          isSaved: true,
          categories: []
        }
      ]
    });

  } catch (error) {
    console.error('Error fetching saved music:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch saved music' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { musicId, studentId } = body;

    if (!musicId) {
      return NextResponse.json(
        { success: false, message: 'Music ID required' },
        { status: 400 }
      );
    }

    // Check if already saved using raw SQL
    const existingSave = await prisma.$queryRaw<Array<any>>`
      SELECT * FROM "MusicSaves" 
      WHERE "musicId" = ${musicId} 
      AND ("studentId" = ${studentId} OR "studentId" IS NULL)
      LIMIT 1
    `;

    if (existingSave && existingSave.length > 0) {
      // If already saved, unsave it
      await prisma.$executeRaw`
        DELETE FROM "MusicSaves" 
        WHERE "musicId" = ${musicId} 
        AND ("studentId" = ${studentId} OR "studentId" IS NULL)
      `;

      return NextResponse.json({
        success: true,
        message: 'Music removed from saved items',
        isSaved: false
      });
    } else {
      // Save the music
      await prisma.$executeRaw`
        INSERT INTO "MusicSaves" ("id", "musicId", "studentId", "createdAt")
        VALUES (gen_random_uuid(), ${musicId}, ${studentId}, NOW())
      `;

      return NextResponse.json({
        success: true,
        message: 'Music added to saved items',
        isSaved: true
      });
    }

  } catch (error) {
    console.error('Error saving music:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save music' },
      { status: 500 }
    );
  }
}
