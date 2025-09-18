import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import FirebaseUserDataService from '../services/firebaseUserData';
import toast from 'react-hot-toast';

const ContactManager = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  
  // Contact State
  const [contacts, setContacts] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  
  // Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new',
    tags: [],
    source: ''
  });

  // Available options for dropdowns
  const statusOptions = ['new', 'warm', 'hot', 'qualified', 'customer', 'inactive'];
  const [availableTags, setAvailableTags] = useState(['Gumroad seller', 'Email subscriber', 'VIP customer', 'New prospect']);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [newTag, setNewTag] = useState('');

  // Load contacts on component mount
  useEffect(() => {
    loadContacts();
  }, [user?.uid]);

  const loadContacts = async () => {
    if (!user?.uid) return;
    
    try {
      const result = await FirebaseUserDataService.getUserData(user.uid, 'crm_contacts');
      if (result.success && result.data?.contacts) {
        setContacts(result.data.contacts);
        
        // Extract unique companies for segmentation
        const companies = [...new Set(result.data.contacts.map(c => c.company).filter(c => c && c.trim()))];
        setAvailableCompanies(companies);
        
        // Extract existing tags
        const existingTags = [...new Set(result.data.contacts.flatMap(c => c.tags || []))];
        setAvailableTags(prev => [...new Set([...prev, ...existingTags])]);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Failed to load contacts');
    }
  };

  const saveContact = async () => {
    if (!contactForm.name || !contactForm.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      const newContact = {
        id: editingContact?.id || `contact_${Date.now()}`,
        ...contactForm,
        createdAt: editingContact?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedContacts;
      if (editingContact) {
        updatedContacts = contacts.map(c => c.id === editingContact.id ? newContact : c);
      } else {
        updatedContacts = [...contacts, newContact];
      }

      // Save to Firebase
      await FirebaseUserDataService.saveUserData(user.uid, 'crm_contacts', { contacts: updatedContacts });
      
      setContacts(updatedContacts);
      resetForm();
      toast.success(editingContact ? 'Contact updated!' : 'Contact added!');
      
      // Reload to update available companies and tags
      loadContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error('Failed to save contact');
    }
  };

  const deleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      const updatedContacts = contacts.filter(c => c.id !== contactId);
      await FirebaseUserDataService.saveUserData(user.uid, 'crm_contacts', { contacts: updatedContacts });
      
      setContacts(updatedContacts);
      toast.success('Contact deleted!');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  const resetForm = () => {
    setContactForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'new',
      tags: [],
      source: ''
    });
    setEditingContact(null);
    setShowAddContact(false);
  };

  const editContact = (contact) => {
    setContactForm(contact);
    setEditingContact(contact);
    setShowAddContact(true);
  };

  const addNewTag = () => {
    if (newTag.trim() && !availableTags.includes(newTag.trim())) {
      setAvailableTags([...availableTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const toggleTag = (tag) => {
    const updatedTags = contactForm.tags.includes(tag) 
      ? contactForm.tags.filter(t => t !== tag)
      : [...contactForm.tags, tag];
    setContactForm(prev => ({ ...prev, tags: updatedTags }));
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-white to-blue-50">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-genie-teal">Contact Manager</h2>
        <button
          onClick={() => setShowAddContact(true)}
          className="bg-genie-teal text-white px-6 py-3 rounded-lg hover:bg-genie-teal/80 transition-colors"
        >
          + Add Contact
        </button>
      </div>

      {/* Contact Form Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-genie-teal">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h3>
              <button 
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-genie-teal"
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-genie-teal"
                    placeholder="contact@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-genie-teal"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={contactForm.company}
                    onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-genie-teal"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={contactForm.status}
                    onChange={(e) => setContactForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-genie-teal"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <input
                    type="text"
                    value={contactForm.source}
                    onChange={(e) => setContactForm(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-genie-teal"
                    placeholder="How did you find this contact?"
                  />
                </div>
              </div>

              {/* Tags Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                
                {/* Add New Tag */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add new tag..."
                    className="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-genie-teal"
                    onKeyPress={(e) => e.key === 'Enter' && addNewTag()}
                  />
                  <button
                    type="button"
                    onClick={addNewTag}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Add Tag
                  </button>
                </div>

                {/* Available Tags */}
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        contactForm.tags.includes(tag)
                          ? 'bg-genie-teal text-white border-genie-teal'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={saveContact}
                  className="flex-1 bg-genie-teal text-white py-3 rounded-lg hover:bg-genie-teal/80 transition-colors"
                >
                  {editingContact ? 'Update Contact' : 'Add Contact'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold text-genie-teal mb-4">
          Contacts ({contacts.length})
        </h3>
        
        {contacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No contacts yet. Add your first contact to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Contact</th>
                  <th className="text-left py-3 px-4">Company</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Tags</th>
                  <th className="text-left py-3 px-4">Source</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(contact => (
                  <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{contact.name}</div>
                        <div className="text-sm text-gray-500">{contact.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{contact.company || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        contact.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        contact.status === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                        contact.status === 'hot' ? 'bg-red-100 text-red-800' :
                        contact.status === 'qualified' ? 'bg-purple-100 text-purple-800' :
                        contact.status === 'customer' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(contact.tags || []).map(tag => (
                          <span key={tag} className="bg-genie-teal/10 text-genie-teal px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{contact.source || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editContact(contact)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteContact(contact.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactManager;