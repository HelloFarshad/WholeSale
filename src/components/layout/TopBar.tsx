import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, Bell, User, LogOut, Settings } from 'lucide-react';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              onClick={onMenuClick}
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex-shrink-0 flex items-center px-4">
              <Link to="/" className="flex items-center">
                <Package className="h-8 w-8 text-primary-600" aria-hidden="true" />
                <span className="ml-2 text-xl font-semibold text-primary-800">WholeFlow</span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <button
              className="p-2 mr-2 text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>
            
            <div className="relative ml-3" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center max-w-xs p-1 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:bg-gray-100"
                aria-expanded={userMenuOpen}
              >
                <span className="sr-only">Open user menu</span>
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800">
                  {user?.name?.charAt(0) || <User size={16} />}
                </div>
                <span className="hidden md:flex md:items-center ml-2">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name || 'User'}
                  </span>
                  <span className="ml-1 text-xs text-gray-500 truncate">
                    ({user?.role || 'guest'})
                  </span>
                </span>
              </button>
              
              {/* User menu dropdown */}
              {userMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      Settings
                    </Link>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;