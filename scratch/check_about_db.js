import fs from 'fs'

let supabaseUrl = ''
let supabaseAnonKey = ''

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8')
  const lines = envContent.split('\n')
  for (const line of lines) {
    const match = line.match(/^\s*VITE_SUPABASE_URL\s*=\s*(.+)$/)
    if (match) supabaseUrl = match[1].replace(/['"]/g, '').trim()
    const matchKey = line.match(/^\s*VITE_SUPABASE_ANON_KEY\s*=\s*(.+)$/)
    if (matchKey) supabaseAnonKey = matchKey[1].replace(/['"]/g, '').trim()
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing!')
  process.exit(1)
}

async function checkAbout() {
  console.log('Fetching "about" settings directly from PostgREST API...')
  const url = `${supabaseUrl}/rest/v1/site_settings?key=eq.about&select=*`
  const headers = {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`
  }
  
  try {
    const res = await fetch(url, { headers })
    const data = await res.json()
    console.log('Database Result:', JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Fetch Error:', err)
  }
}

checkAbout()
