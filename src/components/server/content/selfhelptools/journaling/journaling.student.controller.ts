import { NextRequest, NextResponse } from 'next/server';
import { JournalingStudentService } from './journaling.student.service';
import { CreateWritingJournalSchema, DeleteWritingJournalSchema, CreateAudioJournalSchema, DeleteAudioJournalSchema, CreateArtJournalSchema, DeleteArtJournalSchema } from './journaling.validators';
import { ApiResponse } from '@/src/utils/api-response';
import { handleError } from '@/src/utils/errors';
import { getSession, requireRole } from '@/src/utils/session-helper';

export class JournalingStudentController {
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
  async deleteWritingJournal(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await requireRole(req, 'STUDENT');

      const data = { id: params.id };
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

      const body = await req.json();
      const parsed = CreateAudioJournalSchema.parse(body);

      const result = await JournalingStudentService.createAudioJournal(
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
  async deleteAudioJournal(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await requireRole(req, 'STUDENT');

      const data = { id: params.id };
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

      const body = await req.json();
      const parsed = CreateArtJournalSchema.parse(body);

      const result = await JournalingStudentService.createArtJournal(
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
  async deleteArtJournal(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await requireRole(req, 'STUDENT');

      const data = { id: params.id };
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
