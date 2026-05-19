import { supabase } from '../src/lib/supabase.js'

async function check() {
  const { data, error } = await supabase.from('leads').select('*').limit(1)
  if (error) console.error(error)
  else console.log(JSON.stringify(data[0], null, 2))
}
check()
