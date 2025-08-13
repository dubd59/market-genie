import React from 'react';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  SpeakerWaveIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

const sections = [
  { name: 'SuperGenie Dashboard', icon: HomeIcon },
  { name: 'Lead Generation', icon: MagnifyingGlassIcon },
  { name: 'Outreach Automation', icon: SpeakerWaveIcon },
  { name: 'CRM & Pipeline', icon: BuildingOfficeIcon },
  { name: 'Appointments', icon: CalendarDaysIcon },
  { name: 'Workflow Automation', icon: Cog6ToothIcon },
  { name: 'API Keys & Integrations', icon: KeyIcon },
  { name: 'Reporting & Analytics', icon: ChartBarIcon },
  { name: 'White-Label SaaS', icon: BuildingStorefrontIcon },
  { name: 'Cost Controls', icon: CurrencyDollarIcon },
  { name: 'AI & Automation', icon: SparklesIcon }
];

export default function Sidebar({ activeSection, onSelect }) {
  return (
    <aside className="w-60 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700 min-h-screen shadow-xl">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Market Genie</h2>
        <p className="text-gray-400 text-sm mt-1">AI Marketing Platform</p>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <li key={section.name}>
                <button
                  onClick={() => onSelect(section.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 hover:bg-gray-800 hover:shadow-lg group ${
                    activeSection === section.name
                      ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeSection === section.name ? 'text-white' : 'text-gray-400 group-hover:text-teal-400'}`} />
                  <span className={`font-medium ${activeSection === section.name ? 'text-white' : 'group-hover:text-white'}`}>
                    {section.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
