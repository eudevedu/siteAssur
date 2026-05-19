import { supabase } from '../supabase'

export const pagesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('nav_order', { ascending: true })
    if (error) throw error
    return data
  },
  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error) throw error
    return data
  },
  async create(page) {
    const { data, error } = await supabase.from('pages').insert([page]).select().single()
    if (error) throw error
    return data
  },
  async update(id, updates) {
    const { data, error } = await supabase.from('pages').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async delete(id) {
    const { error } = await supabase.from('pages').delete().eq('id', id)
    if (error) throw error
    return true
  }
}
