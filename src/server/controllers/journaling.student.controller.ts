import { NextRequest, NextResponse } from 'next/server';
import { JournalingStudentService } from '../services/journaling.student.service';
import { CreateWritingJournalSchema, DeleteWritingJournalSchema, CreateAudioJournalSchema, DeleteAudioJournalSchema, CreateArtJournalSchema, DeleteArtJournalSchema } from '../validators/journaling.validators';
import { ApiResponse } from '@/src/utils/api-response';
import { handleError } from '@/src/utils/errors';
import { getSession, requireRole } from '@/src/utils/session-helper';

export class JournalingStudentController {
  // GET /api/student/journaling/config
  async getJournalingConfig(req: NextRequest) {
    try {
      console.log('=== STUDENT CONTROLLER DEBUG ===');
      const session = await requireRole(req, 'STUDENT');
      console.log('Student session:', session);

      if (!session.schoolId) {
        console.log('No schoolId found for student');
        return NextResponse.json(
          { success: false, error: 'User must be associated with a school' },
          { status: 400 }
        );
      }

      console.log('Fetching config for schoolId:', session.schoolId);
      const result = await JournalingStudentService.getJournalingConfig(session.schoolId);
      console.log('Config result:', result);

      return NextResponse.json(result);
    } catch (err) {
      console.error('Student controller error:', err);
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  // Writing Journals
  
  // POST /api/student/journals/writing
  async createWritingJournal(req: NextRequest) {
    try {
      const session = await requireRole(req, 'STUDENT');

      const body = await req.json();
      const parsed = CreateWritingJournalSchema.parse(body);

      const result = await JournalingStudentService.createWritingJournal(
        session.userId,
        session.schoolId,
        parsed
      );

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  // GET /api/student/journals/writing
  async getWritingJournals(req: NextRequest) {
    try {
      const session = await requireRole(req, 'STUDENT');

      const result = await JournalingStudentService.getWritingJournals(session.userId);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  // DELETE /api/student/journals/writing/:id
  async deleteWritingJournal(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const session = await requireRole(req, 'STUDENT');
      const { id } = await params;

      const data = { id };
      const parsed = DeleteWritingJournalSchema.parse(data);

      const result = await JournalingStudentService.deleteWritingJournal(session.userId, parsed);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  // Audio Journals

  // POST /api/student/journals/audio
  async createAudioJournal(req: NextRequest) {
    try {
      const session = await requireRole(req, 'STUDENT');

      // Handle FormData for audio file uploads
      const formData = await req.formData();
      const audioFile = formData.get('audio') as File;
      const duration = Number(formData.get('duration'));
      const title = formData.get('title') as string;

      if (!audioFile) {
        throw new Error('Audio file is required');
      }

      if (duration <= 0) {
        throw new Error('Duration must be greater than 0');
      }

      // Create a temporary object for validation
      const data = {
        title: title?.trim() || undefined, // Convert empty string to undefined
        audioUrl: `temp://${audioFile.name}`, // Temporary URL, will be replaced in service
        duration
      };

      const parsed = CreateAudioJournalSchema.parse(data);

      const result = await JournalingStudentService.createAudioJournal(
        session.userId,
        session.schoolId,
        parsed,
        audioFile
      );

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  // GET /api/student/journals/audio
  async getAudioJournals(req: NextRequest) {
    try {
      const session = await requireRole(req, 'STUDENT');

      const result = await JournalingStudentService.getAudioJournals(session.userId);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  // DELETE /api/student/journals/audio/:id
  async deleteAudioJournal(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const session = await requireRole(req, 'STUDENT');
      const { id } = await params;

      const data = { id };
      const parsed = DeleteAudioJournalSchema.parse(data);

      const result = await JournalingStudentService.deleteAudioJournal(session.userId, parsed);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  // Art Journals

  // POST /api/student/journals/art
  async createArtJournal(req: NextRequest) {
    try {
      const session = await requireRole(req, 'STUDENT');

      // Handle FormData for image file uploads
      const formData = await req.formData();
      const imageFile = formData.get('image') as File;

      if (!imageFile) {
        throw new Error('Image file is required');
      }

      // Create a temporary object for validation
      const data = {
        imageUrl: `temp://${imageFile.name}`, // Temporary URL, will be replaced in service
      };

      const parsed = CreateArtJournalSchema.parse(data);

      const result = await JournalingStudentService.createArtJournal(
        session.userId,
        session.schoolId,
        parsed,
        imageFile
      );

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  // GET /api/student/journals/art
  async getArtJournals(req: NextRequest) {
    try {
      const session = await requireRole(req, 'STUDENT');

      const result = await JournalingStudentService.getArtJournals(session.userId);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }

  // DELETE /api/student/journals/art/:id
  async deleteArtJournal(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const session = await requireRole(req, 'STUDENT');
      const { id } = await params;

      const data = { id };
      const parsed = DeleteArtJournalSchema.parse(data);

      const result = await JournalingStudentService.deleteArtJournal(session.userId, parsed);

      return NextResponse.json(result);
    } catch (err) {
      const errorResponse = handleError(err);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  }
}

export const journalingStudentController = new JournalingStudentController();
