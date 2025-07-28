import { supabase } from './client'

export const contactsService = {
  // Get all contacts for the current user
  async getContacts(userId) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create a new contact
  async createContact(contactData) {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contactData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update contact
  async updateContact(id, updates) {
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete contact
  async deleteContact(id) {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get contact segments
  async getSegments(userId) {
    const { data, error } = await supabase
      .from('contact_segments')
      .select(`
        *,
        contact_segment_members (
          contact_id,
          contacts (*)
        )
      `)
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  },

  // Create segment
  async createSegment(segmentData) {
    const { data, error } = await supabase
      .from('contact_segments')
      .insert(segmentData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Add contacts to segment
  async addContactsToSegment(segmentId, contactIds) {
    const memberships = contactIds.map(contactId => ({
      segment_id: segmentId,
      contact_id: contactId
    }))

    const { data, error } = await supabase
      .from('contact_segment_members')
      .insert(memberships)
    
    if (error) throw error
    return data
  },

  // Import contacts from CSV
  async importContacts(userId, contacts) {
    const contactsWithUserId = contacts.map(contact => ({
      ...contact,
      user_id: userId,
      created_at: new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from('contacts')
      .insert(contactsWithUserId)
      .select()
    
    if (error) throw error
    return data
  }
}
