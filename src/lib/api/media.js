import { supabase } from '../supabase'

export const mediaApi = {
  async upload(file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    // Register in database
    const { data, error } = await supabase
      .from('media')
      .insert([{
        filename: fileName,
        original_name: file.name,
        url: publicUrl,
        mime_type: file.type,
        size_bytes: file.size
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async delete(id, fileName) {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('media')
      .remove([`uploads/${fileName}`])

    if (storageError) throw storageError

    // Delete from DB
    const { error: dbError } = await supabase
      .from('media')
      .delete()
      .eq('id', id)

    if (dbError) throw dbError
    return true
  }
}
