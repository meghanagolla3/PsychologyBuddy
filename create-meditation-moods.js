// Simple script to create meditation moods via fetch
const meditationMoods = [
  "Calm",
  "Relaxed", 
  "Peaceful",
  "Focused",
  "Sleepy",
  "Energized",
  "Balanced",
  "Grounded",
  "Mindful",
  "Serene",
  "Tranquil",
  "Centered",
  "Rejuvenated",
  "Clear-headed"
];

async function createMoods() {
  for (const moodName of meditationMoods) {
    try {
      const response = await fetch('http://localhost:3000/api/admin/meditation/moods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'admin@calmpath.ai'
        },
        body: JSON.stringify({
          name: moodName,
          status: 'ACTIVE'
        })
      });
      
      if (response.ok) {
        console.log(`Created mood: ${moodName}`);
      } else {
        console.error(`Failed to create mood: ${moodName}`, await response.text());
      }
    } catch (error) {
      console.error(`Error creating mood ${moodName}:`, error);
    }
  }
}

createMoods();
