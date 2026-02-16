// Test with music resources that have working audio URLs
const baseUrl = 'http://localhost:3000';

async function testWorkingMusic() {
  console.log('🎵 Testing music with working audio URLs...\n');
  
  try {
    // Get music resources to find ones with working URLs
    const response = await fetch(`${baseUrl}/api/student/music/resources?limit=10`);
    const result = await response.json();
    
    if (result.success) {
      const musicResources = result.data.resources;
      console.log(`Found ${musicResources.length} music resources`);
      
      // Test playing the first few
      for (let i = 0; i < Math.min(3, musicResources.length); i++) {
        const music = musicResources[i];
        console.log(`\n🎵 Testing: ${music.title}`);
        console.log(`URL: ${music.url}`);
        
        // Test if the URL is accessible
        try {
          const headResponse = await fetch(music.url, { method: 'HEAD' });
          if (headResponse.ok) {
            console.log(`✅ ${music.title} - URL is accessible`);
          } else {
            console.log(`❌ ${music.title} - URL is not accessible`);
          }
        } catch (error) {
          console.log(`❌ ${music.title} - URL test failed:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error testing music:', error);
  }
}

testWorkingMusic();
