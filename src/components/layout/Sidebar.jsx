import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HomeIcon,
  SparklesIcon,
  ClockIcon,
  MegaphoneIcon,
  DocumentDuplicateIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import GenieLamp from '../ai/GenieLamp'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { 
    name: 'AI Wishes', 
    icon: SparklesIcon,
    children: [
      { name: 'New Wish', href: '/wishes/new' },
      { name: 'Wish History', href: '/wishes/history' },
    ]
  },
  { 
    name: 'Campaigns', 
    icon: MegaphoneIcon,
    children: [
      { name: 'Builder', href: '/campaigns/builder' },
      { name: 'Templates', href: '/campaigns/templates' },
    ]
  },
  { 
    name: 'Contacts', 
    icon: UsersIcon,
    children: [
      { name: 'Contact List', href: '/contacts' },
      { name: 'Segments', href: '/contacts/segments' },
    ]
  },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

function NavItem({ item, isCollapsed }) {
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(false)
  
  const isActive = item.href === location.pathname || 
    (item.children && item.children.some(child => child.href === location.pathname))

  if (item.children) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            ${isActive ? 'bg-genie-teal text-white' : 'text-gray-600 hover:bg-gray-50'}
            group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md
            transition-colors duration-200
          `}
        >
          <item.icon
            className={`${isActive ? 'text-white' : 'text-gray-400'} mr-3 flex-shrink-0 h-6 w-6`}
            aria-hidden="true"
          />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.name}</span>
              <svg
                className={`${isExpanded ? 'rotate-90' : ''} ml-3 h-5 w-5 transform transition-transform`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </>
          )}
        </button>
        
        {isExpanded && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1 pl-11"
          >
            {item.children.map((child) => (
              <Link
                key={child.name}
                to={child.href}
                className={`
                  ${location.pathname === child.href ? 'bg-genie-teal text-white' : 'text-gray-600 hover:bg-gray-50'}
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md
                  transition-colors duration-200
                `}
              >
                {child.name}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <Link
      to={item.href}
      className={`
        ${isActive ? 'bg-genie-teal text-white' : 'text-gray-600 hover:bg-gray-50'}
        group flex items-center px-2 py-2 text-sm font-medium rounded-md
        transition-colors duration-200
      `}
    >
      <item.icon
        className={`${isActive ? 'text-white' : 'text-gray-400'} mr-3 flex-shrink-0 h-6 w-6`}
        aria-hidden="true"
      />
      {!isCollapsed && <span>{item.name}</span>}
    </Link>
  )
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`${isMobileOpen ? 'fixed inset-0 z-40 lg:hidden' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
          <div className="absolute right-0 top-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setIsMobileOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          <SidebarContent navigation={navigation} isCollapsed={false} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col ${isCollapsed ? 'lg:w-16' : 'lg:w-64'} transition-all duration-300`}>
        <SidebarContent 
          navigation={navigation} 
          isCollapsed={isCollapsed} 
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          type="button"
          className="fixed top-4 left-4 z-50 rounded-md bg-white p-2 text-gray-400 shadow-lg"
          onClick={() => setIsMobileOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </>
  )
}

function SidebarContent({ navigation, isCollapsed, onToggleCollapse }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gradient-to-br from-genie-teal to-genie-orange rounded-lg flex items-center justify-center">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <h1 className="text-xl font-bold gradient-text">Market Genie</h1>
              <p className="text-xs text-gray-500">AI Marketing Assistant</p>
            </div>
          )}
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto p-1 rounded-md hover:bg-gray-100"
          >
            <Bars3Icon className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      {/* Genie Lamp - Always visible */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <GenieLamp isCollapsed={isCollapsed} />
      </div>

      {/* User info */}
      {!isCollapsed && (
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-genie-teal flex items-center justify-center">
              <span className="text-white font-medium text-sm">JD</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">John Doe</p>
              <p className="text-xs text-gray-500">Pro Plan</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
