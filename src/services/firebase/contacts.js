import FirebaseService from './client'

export class ContactService {
  static async getAllContacts() {
    return await FirebaseService.getAll('contacts')
  }

  static async getContactById(id) {
    return await FirebaseService.getById('contacts', id)
  }

  static async createContact(contactData) {
    return await FirebaseService.create('contacts', contactData)
  }

  static async updateContact(id, contactData) {
    return await FirebaseService.update('contacts', id, contactData)
  }

  static async deleteContact(id) {
    return await FirebaseService.delete('contacts', id)
  }

  static async getContactsByStatus(status) {
    return await FirebaseService.query('contacts', [
      { field: 'status', operator: '==', value: status }
    ])
  }

  static async getContactsBySource(source) {
    return await FirebaseService.query('contacts', [
      { field: 'source', operator: '==', value: source }
    ])
  }

  static async searchContacts(searchTerm) {
    // For Firebase, we'll need to search by email or name
    // This is a simple approach - for more advanced search, consider using Algolia
    const results = await FirebaseService.query('contacts', [
      { field: 'email', operator: '>=', value: searchTerm },
      { field: 'email', operator: '<=', value: searchTerm + '\uf8ff' }
    ])
    
    if (results.data && results.data.length === 0) {
      // Try searching by name if email search returns nothing
      return await FirebaseService.query('contacts', [
        { field: 'name', operator: '>=', value: searchTerm },
        { field: 'name', operator: '<=', value: searchTerm + '\uf8ff' }
      ])
    }
    
    return results
  }

  static async getRecentContacts(limitCount = 10) {
    return await FirebaseService.query('contacts', [], 
      { field: 'created_at', direction: 'desc' }, 
      limitCount
    )
  }

  static async updateContactStatus(id, status) {
    return await FirebaseService.update('contacts', id, { 
      status,
      status_updated_at: new Date()
    })
  }

  static async addContactNote(id, note) {
    const contact = await FirebaseService.getById('contacts', id)
    if (contact.data) {
      const existingNotes = contact.data.notes || []
      const updatedNotes = [...existingNotes, {
        note,
        created_at: new Date(),
        id: Date.now().toString()
      }]
      
      return await FirebaseService.update('contacts', id, { notes: updatedNotes })
    }
    return { data: null, error: { message: 'Contact not found' } }
  }
}

export default ContactService
