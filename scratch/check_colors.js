import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const parts = line.split('=')
  if (parts.length >= 2) {
    const key = parts[0].trim()
    const val = parts.slice(1).join('=').trim()
    env[key] = val
  }
})

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY

async function run() {
  const url = `${supabaseUrl}/rest/v1/site_settings?select=*`
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    })
    if (!res.ok) {
      const text = await res.text()
      console.error('API Error:', text)
    } else {
      const data = await res.json()
      console.log('Site Settings in Database:')
      console.log(JSON.stringify(data, null, 2))
    }
  } catch (err) {
    console.error('Fetch error:', err)
  }
}

run()
