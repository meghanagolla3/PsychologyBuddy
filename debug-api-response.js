// Debug script to check API response structure
const baseUrl = 'http://localhost:3000';

async function debugApiResponse() {
  console.log('🔍 Debugging API response structure...\n');
  
  try {
    // Test with a specific music resource that should have categories
    const testResponse = await fetch(`${baseUrl}/api/student/music/resources?limit=10`);
    const testResult = await testResponse.json();
    
    console.log('Test API Response:', JSON.stringify(testResult, null, 2));
    
    if (testResult.success && testResult.data && testResult.data.resources) {
      console.log('✅ Test API Response Success');
      console.log('Music Resources:', testResult.data.resources);
      
      // Check if any resource has categories
      const categorizedResources = testResult.data.resources.filter(music => {
        return music.categories && music.categories.length > 0;
      });
      
      console.log('Categorized Resources:', categorizedResources.length);
      
      // Check first resource with categories
      const firstCategorized = testResult.data.resources.find(music => music.categories && music.categories.length > 0);
      
      if (firstCategorized) {
        console.log('✅ Found categorized resource:', firstCategorized.title);
        console.log('Categories:', firstCategorized.categories?.map(cat => cat.category?.name));
      }
    }
    
    // Test the getTracksFromSameCategory function
    const tracks = await getTracksFromSameCategory();
    console.log('Tracks from same category:', tracks);
    
  } catch (error) {
    console.error('Debug API Error:', error);
  }
}

debugApiResponse();
