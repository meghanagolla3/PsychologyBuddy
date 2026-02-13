import { JournalingAdminRepository } from './journaling.admin.repository';

export class JournalingUtils {
  static async getOrCreateDefaultConfig(schoolId: string) {
    let config = await JournalingAdminRepository.getJournalingConfig(schoolId);
    
    if (!config) {
      // Create default configuration for the school
      config = await JournalingAdminRepository.createJournalingConfig(schoolId, {
        enableWriting: true,
        enableAudio: true,
        enableArt: true,
        maxAudioDuration: 300, // 5 minutes default
        autoSaveAudio: true,
        enableUndo: true,
        enableRedo: true,
        enableClearCanvas: true,
      });
    }
    
    return config;
  }
}
