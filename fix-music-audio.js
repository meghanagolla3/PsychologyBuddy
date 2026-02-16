// Quick fix for music audio URLs using SoundHelix examples
const baseUrl = 'http://localhost:3000';

// Working audio URLs from SoundHelix
const workingAudioUrls = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
];

async function fixMusicAudio() {
  console.log('🎵 Fixing music audio URLs...\n');
  
  try {
    // Get existing music resources
    const response = await fetch(`${baseUrl}/api/admin/music/resources?page=1&limit=10`);
    const result = await response.json();
    
    if (!result.success) {
      console.error('Failed to get music resources:', result.message);
      return;
    }
    
    const musicResources = result.data.resources;
    console.log(`Found ${musicResources.length} music resources to update`);
    
    // Update each music resource with working audio URL
    for (let i = 0; i < musicResources.length && i < workingAudioUrls.length; i++) {
      const music = musicResources[i];
      const audioUrl = workingAudioUrls[i];
      
      try {
        const updateResponse = await fetch(`${baseUrl}/api/admin/music/resources?id=${music.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: audioUrl
          })
        });
        
        const updateResult = await updateResponse.json();
        
        if (updateResult.success) {
          console.log(`✅ Updated "${music.title}" with working audio URL`);
        } else {
          console.log(`❌ Failed to update "${music.title}": ${updateResult.message}`);
          if (updateResult.error) {
            console.log('Error details:', updateResult.error);
          }
        }
      } catch (error) {
        console.error(`❌ Error updating "${music.title}":`, error.message || error);
      }
    }
    
    console.log('\n🎉 Music audio URLs fix completed!');
    console.log('\n📝 Now you can play real audio!');
  } catch (error) {
    console.error('Error in fix process:', error);
  }
}

fixMusicAudio();
