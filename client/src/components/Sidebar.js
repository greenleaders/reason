import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Campaign, 
  FileText, 
  BarChart3, 
  Settings,
  X,
  UserCheck,
  Building2,
  Megaphone
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, userRole }) => {
  const location = useLocation();

  const getNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/', icon: Home },
    ];

    switch (userRole) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'Campaigns', href: '/campaigns', icon: Campaign },
          { name: 'Influencers', href: '/influencers', icon: Users },
          { name: 'Content Review', href: '/content-review', icon: FileText },
          { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        ];
      
      case 'business':
        return [
          ...baseItems,
          { name: 'My Campaigns', href: '/campaigns', icon: Campaign },
          { name: 'Create Campaign', href: '/campaigns/create', icon: Megaphone },
          { name: 'Content Review', href: '/content-review', icon: FileText },
          { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        ];
      
      case 'influencer':
        return [
          ...baseItems,
          { name: 'My Assignments', href: '/assignments', icon: UserCheck },
          { name: 'Submit Content', href: '/content/submit', icon: FileText },
          { name: 'My Profile', href: '/profile', icon: Settings },
        ];
      
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              SocialMedia
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {userRole?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
