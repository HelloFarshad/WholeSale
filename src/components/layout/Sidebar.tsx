import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, Package, Users, ShoppingCart, Truck, Warehouse, FileText, Settings, CreditCard, UserCog } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? 'bg-primary-600/10 text-primary-800'
            : 'text-gray-600 hover:bg-gray-100'
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      {label}
    </NavLink>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Close sidebar on location change on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      onClose();
    }
  }, [location, isOpen, onClose]);

  const isAdmin = user?.role === 'admin';
  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 lg:hidden">
          <h2 className="text-xl font-semibold text-primary-800">WholeFlow ERP</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-4rem)] lg:h-full">
          <nav className="space-y-1">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            
            <h3 className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Master Data
            </h3>
            <NavItem to="/items" icon={<Package size={20} />} label="Items" />
            <NavItem to="/customers" icon={<Users size={20} />} label="Customers" />
            <NavItem to="/suppliers" icon={<Truck size={20} />} label="Suppliers" />
            
            <h3 className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Operations
            </h3>
            <NavItem to="/sales" icon={<ShoppingCart size={20} />} label="Sales Orders" />
            <NavItem to="/purchases" icon={<Truck size={20} />} label="Purchase Orders" />
            <NavItem to="/inventory" icon={<Warehouse size={20} />} label="Inventory" />
            
            {isManagerOrAdmin && (
              <>
                <h3 className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Finance
                </h3>
                <NavItem to="/payments" icon={<CreditCard size={20} />} label="Payments" />
                <NavItem to="/reports" icon={<FileText size={20} />} label="Reports" />
              </>
            )}
            
            {isAdmin && (
              <>
                <h3 className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Administration
                </h3>
                <NavItem to="/users" icon={<UserCog size={20} />} label="Users" />
                <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
              </>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;