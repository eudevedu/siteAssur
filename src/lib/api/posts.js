import { supabase } from '../supabase'

export const postsApi = {
  async getAll({ status, categoryId, limit = 100 } = {}) {
    const buildQuery = (withAuthors = true) => {
      let q = supabase
        .from('posts')
        .select(withAuthors ? '*, categories(name, slug), authors(name, avatar_url)' : '*, categories(name, slug)')
        .order('created_at', { ascending: false })
      if (status) q = q.eq('status', status)
      if (categoryId) q = q.eq('category_id', categoryId)
      if (limit) q = q.limit(limit)
      return q
    }

    try {
      const { data, error } = await buildQuery(true)
      if (!error) return data
      throw error
    } catch (err) {
      const { data, error } = await buildQuery(false)
      if (error) throw error
      return data
    }
  },

  async getById(id) {
    try {
      // Tenta buscar com autores
      const { data, error } = await supabase
        .from('posts')
        .select('*, categories(name, slug), authors(name, avatar_url), tags(*)')
        .eq('id', id)
        .single()
      
      if (!error) return data
      throw error
    } catch (err) {
      // Fallback: busca sem autores se a relação não existir
      const { data, error } = await supabase
        .from('posts')
        .select('*, categories(name, slug), tags(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    }
  },

  async getBySlug(slug) {
    try {
      // Tenta buscar com autores
      const { data, error } = await supabase
        .from('posts')
        .select('*, categories(name, slug), authors(name, avatar_url), tags(*)')
        .eq('slug', slug)
        .single()
      
      if (!error) return data
      throw error
    } catch (err) {
      // Fallback: busca sem autores
      const { data, error } = await supabase
        .from('posts')
        .select('*, categories(name, slug), tags(*)')
        .eq('slug', slug)
        .single()
      if (error) throw error
      return data
    }
  },

  async create(post) {
    const { data, error } = await supabase
      .from('posts')
      .insert([post])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}
