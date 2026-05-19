import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env')
const envContent = fs.readFileSync(envPath, 'utf-8')

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}\\s*=\\s*([^\\n\\r]+)`))
  return match ? match[1].trim() : null
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL')
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY')

console.log('Connecting to:', supabaseUrl)

async function runDiagnostics() {
  const url = `${supabaseUrl}/rest/v1/site_settings?select=*`
  const headers = {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json'
  }

  console.log('1. Testing REST read from site_settings table...')
  const startRead = Date.now()
  try {
    const res = await fetch(url, { headers })
    const data = await res.json()
    if (!res.ok) throw new Error(JSON.stringify(data))
    console.log(`   Read success! Fetched ${data.length} keys in ${Date.now() - startRead}ms.`)
    console.log('   Available keys:', data.map(d => d.key).join(', '))
  } catch (err) {
    console.error('   Read failed:', err.message)
  }

  console.log('\n2. Testing REST select specifically for "about" key...')
  const startAbout = Date.now()
  try {
    const aboutUrl = `${supabaseUrl}/rest/v1/site_settings?key=eq.about&select=*`
    const res = await fetch(aboutUrl, { headers })
    const data = await res.json()
    if (!res.ok) throw new Error(JSON.stringify(data))
    console.log(`   Select "about" success! Found: ${data.length > 0 ? 'Yes' : 'No'} in ${Date.now() - startAbout}ms.`)
  } catch (err) {
    console.error('   Select "about" failed:', err.message)
  }
  
  process.exit(0)
}

runDiagnostics()
