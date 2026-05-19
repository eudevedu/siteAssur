import { supabase } from '../supabase'

export const formsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error) throw error
    return data
  },

  async create(form) {
    const { data, error } = await supabase
      .from('forms')
      .insert([form])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, form) {
    const { data, error } = await supabase
      .from('forms')
      .update({ ...form, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    // Delete submissions first due to foreign key constraints
    await supabase.from('form_submissions').delete().eq('form_id', id)
    
    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async getSubmissions(formId) {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('form_id', formId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async submit(formId, formData) {
    const { data, error } = await supabase
      .from('form_submissions')
      .insert([{ form_id: formId, data: formData }])
    if (error) throw error
    return data
  }
}
