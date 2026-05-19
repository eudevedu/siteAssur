import { supabase } from '../supabase'

export const settingsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
    if (error) throw error
    
    // Transform array to object { key: value }
    return data.reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {})
  },

  async getByKey(key) {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .single()
    if (error) throw error
    return data.value
  },

  async update(key, value) {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date() }, { onConflict: 'key' })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateMultiple(settings) {
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date()
    }))

    const { data, error } = await supabase
      .from('site_settings')
      .upsert(updates, { onConflict: 'key' })
      .select()
    if (error) throw error
    return data
  }
}
