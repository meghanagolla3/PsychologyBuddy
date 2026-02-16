# How to Add Real Audio URLs to Music Resources

## Method 1: Update via API Script

```javascript
// Create a script to update music resources with real audio URLs
const baseUrl = 'http://localhost:3000';

const musicUpdates = [
  {
    id: 'your-music-id-1',
    url: 'https://your-domain.com/audio/file1.mp3'
  },
  {
    id: 'your-music-id-2', 
    url: 'https://your-domain.com/audio/file2.mp3'
  }
];

async function updateAudioUrls() {
  for (const music of musicUpdates) {
    const response = await fetch(`${baseUrl}/api/admin/music/resources?id=${music.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: music.url
      })
    });
    
    const result = await response.json();
    console.log(`Updated ${music.id}:`, result);
  }
}

updateAudioUrls();
```

## Method 2: Use Free Audio Sources

### Free Audio Websites:
- **SoundHelix**: https://www.soundhelix.com/examples/mp3/
- **Pixabay Music**: https://pixabay.com/music/
- **Zapsplat**: https://www.zapsplat.com/
- **Freesound**: https://freesound.org/

### Example URLs:
```
https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3
https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3
https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3
```

## Method 3: Upload Your Own Audio Files

1. **Place audio files** in `public/audio/` directory:
   ```
   public/
   ├── audio/
   │   ├── relaxing-music.mp3
   │   ├── focus-music.mp3
   │   └── sleep-music.mp3
   ```

2. **Update URLs** to point to your local files:
   ```javascript
   url: '/audio/relaxing-music.mp3'
   ```

## Method 4: Use Streaming Services

### Services that provide direct audio URLs:
- **YouTube Audio**: Extract audio from YouTube videos
- **Spotify**: Use Spotify track URLs (if available)
- **Apple Music**: Use Apple Music URLs

## Quick Fix Script

Run this script to update all existing music with working audio URLs:

```bash
node update-audio-urls.js
```

## Recommended Audio Files for Testing

1. **Relaxing Music**: https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3
2. **Focus Music**: https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3  
3. **Sleep Music**: https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3
4. **Energy Music**: https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3
5. **Stress Relief**: https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3
```

Choose the method that works best for your use case!
