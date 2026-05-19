import { supabase } from '../supabase'

export const projectsApi = {
  async getAll({ status, limit } = {}) {
    let query = supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)
    if (limit) query = query.limit(limit)
    const { data, error } = await query
    if (error) throw error
    return data || []
  },
  async getById(id) {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },
  async create(project) {
    const { data, error } = await supabase.from('projects').insert([project]).select().single()
    if (error) throw error
    return data
  },
  async update(id, updates) {
    const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async delete(id) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
    return true
  }
}
