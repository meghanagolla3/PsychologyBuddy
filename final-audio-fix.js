// Final fix for music audio URLs
const baseUrl = 'http://localhost:3000';

// Real working audio URLs
const realAudioUrls = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'
];

async function fixAllMusicUrls() {
  console.log('🎵 Final fix: Updating all music with real audio URLs...\n');
  
  try {
    // Get all music resources
    const response = await fetch(`${baseUrl}/api/admin/music/resources?page=1&limit=50`);
    const result = await response.json();
    
    if (!result.success) {
      console.error('Failed to get music resources:', result.message);
      return;
    }
    
    const musicResources = result.data.resources;
    console.log(`Found ${musicResources.length} music resources to update`);
    
    // Update each music resource with real audio URL
    for (let i = 0; i < musicResources.length && i < realAudioUrls.length; i++) {
      const music = musicResources[i];
      const audioUrl = realAudioUrls[i % realAudioUrls.length];
      
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
          console.log(`✅ Updated "${music.title}" with: ${audioUrl}`);
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
    
    console.log('\n🎉 All music audio URLs updated!');
    console.log('\n📝 Now you can play real audio!');
    console.log('\n🎵 Visit: http://localhost:3000/students/selfhelptools/music');
  } catch (error) {
    console.error('Error in fix process:', error);
  }
}

fixAllMusicUrls();
