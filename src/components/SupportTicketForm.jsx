import React, { useState } from 'react';
import { createSupportTicket } from '../services/supportTickets';

export default function SupportTicketForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'open',
    userId: 'user123', // Replace with actual user ID from auth
    organizationId: 'testOrg', // Replace with actual org ID
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await createSupportTicket({ ...form, createdAt: new Date() });
      setSuccess(true);
      setForm({ ...form, title: '', description: '' });
    } catch (err) {
      setError('Failed to create ticket.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Create Support Ticket</h2>
      <div>
        <label>Title:</label>
        <input name="title" value={form.title} onChange={handleChange} required style={{ width: '100%' }} />
      </div>
      <div>
        <label>Description:</label>
        <textarea name="description" value={form.description} onChange={handleChange} required style={{ width: '100%' }} />
      </div>
      <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      {success && <div style={{ color: 'green', marginTop: 10 }}>Ticket created!</div>}
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
    </form>
  );
}
