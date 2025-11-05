import React, { useState, useEffect } from 'react';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  SpeakerWaveIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  SparklesIcon,
  KeyIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const sections = [
  { name: 'SuperGenie Dashboard', icon: HomeIcon },
  { name: 'Lead Generation', icon: MagnifyingGlassIcon },
  { name: 'Outreach Automation', icon: SpeakerWaveIcon },
  { name: 'CRM & Pipeline', icon: BuildingOfficeIcon },
  { name: 'Appointments', icon: CalendarDaysIcon },
  { name: 'API Keys & Integrations', icon: KeyIcon },
  { name: 'Resources & Docs', icon: DocumentTextIcon },
  { name: 'White-Label SaaS', icon: BuildingStorefrontIcon }
];

export default function Sidebar({ activeSection, onSelect }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Update CSS custom property for main content margin
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '240px' : '64px');
  };

  // Set initial width
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '64px' : '240px');
  }, [isCollapsed]);

  const handleSectionSelect = (sectionName) => {
    onSelect(sectionName);
  };

  return (
    <>
      {/* Fixed Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen
        ${isCollapsed ? 'w-16' : 'w-60'}
        bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 
        border-r border-gray-700 
        shadow-xl
        transition-all duration-300 ease-in-out
      `}>
        {/* Sidebar Header with Hamburger */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold text-white">Market Genie</h2>
              <p className="text-gray-400 text-sm mt-1">AI Marketing Platform</p>
            </div>
          )}
          
          {/* Hamburger Button */}
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-teal-400 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? (
              <Bars3Icon className="w-6 h-6" />
            ) : (
              <XMarkIcon className="w-6 h-6" />
            )}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 h-full overflow-y-auto pb-20">
          <ul className="space-y-2">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <li key={section.name}>
                  <button
                    onClick={() => handleSectionSelect(section.name)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 hover:bg-gray-800 hover:shadow-lg group ${
                      activeSection === section.name
                        ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-300 hover:text-white'
                    }`}
                    title={isCollapsed ? section.name : ''}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${activeSection === section.name ? 'text-white' : 'text-gray-400 group-hover:text-teal-400'}`} />
                    {!isCollapsed && (
                      <span className={`font-medium ${activeSection === section.name ? 'text-white' : 'group-hover:text-white'}`}>
                        {section.name}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
