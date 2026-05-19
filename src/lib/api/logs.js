import { supabase } from '../supabase'

export const logsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async logAction(action, entityType, entityId = null, details = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('system_logs')
        .insert([{
          user_id: user.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
          details
        }])
      
      if (error) console.error('Error creating log:', error)
    } catch (err) {
      console.error('Logging failed:', err)
    }
  }
}
