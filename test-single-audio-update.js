// Test single audio update
const baseUrl = 'http://localhost:3000';

async function testSingleAudioUpdate() {
  console.log('🎵 Testing single audio update...\n');
  
  try {
    // Get first music resource
    const response = await fetch(`${baseUrl}/api/admin/music/resources?page=1&limit=1`);
    const result = await response.json();
    
    if (!result.success) {
      console.error('Failed to get music resources:', result.message);
      return;
    }
    
    const music = result.data.resources[0];
    if (!music) {
      console.error('No music resources found');
      return;
    }
    
    console.log(`Updating "${music.title}" (ID: ${music.id})`);
    
    // Update with real audio URL
    const updateResponse = await fetch(`${baseUrl}/api/admin/music/resources?id=${music.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      })
    });
    
    const updateResult = await updateResponse.json();
    console.log('Update result:', JSON.stringify(updateResult, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message || error);
  }
}

testSingleAudioUpdate();
