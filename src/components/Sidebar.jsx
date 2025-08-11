import React from 'react';

const sections = [
  'SuperGenie Dashboard',
  'Lead Generation',
  'Outreach Automation',
  'CRM & Pipeline',
  'Appointments',
  'Workflow Automation',
  'Reporting & Analytics',
  'White-Label SaaS',
  'Cost Controls',
  'AI & Automation'
];

export default function Sidebar({ activeSection, onSelect }) {
  return (
    <aside style={{ width: 220, background: '#fff', borderRight: '1px solid #eee', minHeight: '100vh', padding: '2rem 0' }}>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {sections.map(section => (
            <li key={section}>
              <button
                onClick={() => onSelect(section)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 20px',
                  margin: '6px 0',
                  background: activeSection === section ? '#e6f7fa' : 'transparent',
                  color: activeSection === section ? '#38beba' : '#222',
                  border: activeSection === section ? `2px solid #38beba` : '1px solid #eee',
                  borderRadius: 6,
                  fontWeight: activeSection === section ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {section}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
