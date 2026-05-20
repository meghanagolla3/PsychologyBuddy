async function testApi() {
  try {
    const res = await fetch('http://localhost:3000/api/counselor/notifications', {
      headers: {
        'Cookie': 'sessionId=test' // I don't have a real session here, but I want to see if it even reaches the handler
      }
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

testApi();
