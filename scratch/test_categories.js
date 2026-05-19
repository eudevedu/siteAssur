import { supabase } from '../src/lib/supabase'

async function testCategoryCreation() {
  const testCat = {
    name: 'Teste ' + Date.now(),
    slug: 'teste-' + Date.now(),
    type: 'project'
  }
  
  console.log('Tentando criar categoria:', testCat)
  
  const { data, error } = await supabase
    .from('categories')
    .insert([testCat])
    .select()
    .single()
    
  if (error) {
    console.error('Erro na criação:', error)
  } else {
    console.log('Sucesso:', data)
  }
}

testCategoryCreation()
