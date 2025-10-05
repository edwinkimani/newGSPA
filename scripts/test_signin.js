(async ()=>{
  try {
    const res = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' })
    })
    console.log('status', res.status)
    const text = await res.text()
    console.log('body:', text)
  } catch (e) {
    console.error('request failed', e)
  }
})()
