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

async function testUpdate() {
  console.log('Fetching current about setting to preserve other fields...')
  const getUrl = `${supabaseUrl}/rest/v1/site_settings?key=eq.about&select=*`
  const headers = {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
  
  try {
    const getRes = await fetch(getUrl, { headers })
    const getData = await getRes.json()
    if (!getData || getData.length === 0) {
      console.error('About setting row not found!')
      return
    }
    
    const currentRow = getData[0]
    const updatedValue = {
      ...currentRow.value,
      mission: 'Minha Missao de Teste Direct REST',
      values: 'Meus Valores de Teste Direct REST',
      purpose: 'Meu Proposito de Teste Direct REST'
    }
    
    console.log('Sending direct PostgREST UPSERT update...')
    const upsertUrl = `${supabaseUrl}/rest/v1/site_settings`
    const upsertHeaders = {
      ...headers,
      'Prefer': 'resolution=merge-duplicates,return=representation'
    }
    const body = {
      id: currentRow.id,
      key: 'about',
      value: updatedValue,
      updated_at: new Date().toISOString()
    }
    
    const upsertRes = await fetch(upsertUrl, {
      method: 'POST',
      headers: upsertHeaders,
      body: JSON.stringify(body)
    })
    
    const upsertData = await upsertRes.json()
    console.log('UPSERT Result:', JSON.stringify(upsertData, null, 2))
  } catch (err) {
    console.error('Update Error:', err)
  }
}

testUpdate()
