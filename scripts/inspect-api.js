const http = require('http')

async function fetchJson(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    }
    const req = http.request(opts, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          resolve(parsed)
        } catch (e) {
          resolve({ raw: data })
        }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

;(async () => {
  try {
    const modules = await fetchJson('/api/modules')
    console.log('=== MODULES ===')
    console.log(JSON.stringify(modules && modules.length ? modules[0] : modules, null, 2))

    const moduleId = modules && modules.length ? modules[0].id : null
    if (!moduleId) return

    const levels = await fetchJson(`/api/levels?moduleId=${moduleId}`)
    console.log('\n=== LEVELS ===')
    console.log(JSON.stringify(levels, null, 2))

    const firstLevelId = Array.isArray(levels) && levels.length ? levels[0].id : (levels && levels.id ? levels.id : null)
    if (!firstLevelId) return

    const subtopics = await fetchJson(`/api/sub-topics?levelId=${firstLevelId}`)
    console.log('\n=== SUBTOPICS ===')
    console.log(JSON.stringify(subtopics, null, 2))
  } catch (e) {
    console.error('Error during inspection:', e)
  }
})()
