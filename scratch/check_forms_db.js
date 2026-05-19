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

async function checkForms() {
  const url = `${supabaseUrl}/rest/v1/forms?select=*`
  const headers = {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json'
  }

  try {
    const res = await fetch(url, { headers })
    const data = await res.json()
    if (!res.ok) throw new Error(JSON.stringify(data))
    console.log('--- FORMS IN DATABASE ---')
    console.log(JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Error fetching forms:', err.message)
  }
}

checkForms()
