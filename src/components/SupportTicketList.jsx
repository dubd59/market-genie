import React, { useEffect, useState } from 'react';
import { getSupportTickets } from '../services/supportTickets';

export default function SupportTicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTickets() {
      setLoading(true);
      setError('');
      try {
        const data = await getSupportTickets();
        setTickets(data);
      } catch (err) {
        setError('Failed to load tickets.');
      }
      setLoading(false);
    }
    fetchTickets();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 20 }}>
      <h2>Support Tickets</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {tickets.map(ticket => (
          <li key={ticket.id} style={{ borderBottom: '1px solid #ccc', marginBottom: 10, paddingBottom: 10 }}>
            <strong>{ticket.title}</strong> <span style={{ color: '#888' }}>({ticket.status})</span>
            <div>{ticket.description}</div>
            <div style={{ fontSize: 12, color: '#888' }}>Created: {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleString() : String(ticket.createdAt)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
