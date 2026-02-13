import prisma from '@/src/prisma';

export class JournalingStudentRepository {
  // Writing Journals
  static async createWritingJournal(userId: string, title: string | undefined, content: string) {
    return await prisma.writingJournal.create({
      data: {
        userId,
        title,
        content,
      },
    });
  }

  static async getWritingJournals(userId: string) {
    return await prisma.writingJournal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getWritingJournalById(id: string, userId: string) {
    return await prisma.writingJournal.findFirst({
      where: { id, userId },
    });
  }

  static async deleteWritingJournal(id: string, userId: string) {
    return await prisma.writingJournal.deleteMany({
      where: { id, userId },
    });
  }

  // Audio Journals
  static async createAudioJournal(userId: string, title: string | undefined, audioUrl: string, duration: number) {
    return await prisma.audioJournal.create({
      data: {
        userId,
        title,
        audioUrl,
        duration,
      },
    });
  }

  static async getAudioJournals(userId: string) {
    return await prisma.audioJournal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getAudioJournalById(id: string, userId: string) {
    return await prisma.audioJournal.findFirst({
      where: { id, userId },
    });
  }

  static async deleteAudioJournal(id: string, userId: string) {
    return await prisma.audioJournal.deleteMany({
      where: { id, userId },
    });
  }

  // Art Journals
  static async createArtJournal(userId: string, imageUrl: string) {
    return await prisma.artJournal.create({
      data: {
        userId,
        imageUrl,
      },
    });
  }

  static async getArtJournals(userId: string) {
    return await prisma.artJournal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getArtJournalById(id: string, userId: string) {
    return await prisma.artJournal.findFirst({
      where: { id, userId },
    });
  }

  static async deleteArtJournal(id: string, userId: string) {
    return await prisma.artJournal.deleteMany({
      where: { id, userId },
    });
  }

  // Journaling Config (for validation)
  static async getJournalingConfig(schoolId: string) {
    return await prisma.journalingToolConfig.findUnique({
      where: { schoolId },
    });
  }
}
