import 'dotenv/config'
import { createClient } from '@supabase/supabase-client'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function check() {
  // We can't easily query information_schema in Supabase from the client
  // But we can try to insert a dummy record with a 'source' field
  const { error } = await supabase.from('leads').insert([{ name: 'test', source: 'test' }]).select()
  if (error) {
    console.log('Error inserting with source:', error.message)
  } else {
    console.log('Success! Table has source column.')
    // Clean up
    await supabase.from('leads').delete().eq('name', 'test')
  }
}
check()
