import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Leaf,
  FlaskConical,
  Package,
  Warehouse,
  ShoppingCart,
  BarChart3,
  Activity,
  FileText,
  Settings,
  LogOut,
  Droplets,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuthHook';
import './Sidebar.css';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, disabled = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  if (disabled) {
    return (
      <div className="sidebar__nav-item sidebar__nav-item--disabled" data-tooltip={label}>
        <span className="sidebar__nav-icon">{icon}</span>
        <span className="sidebar__nav-label">{label}</span>
      </div>
    );
  }

  return (
    <NavLink to={to} className={`sidebar__nav-item ${isActive ? 'active' : ''}`} data-tooltip={label}>
      <span className="sidebar__nav-icon">{icon}</span>
      <span className="sidebar__nav-label">{label}</span>
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const getInitials = (username?: string): string => {
    if (!username) return 'US';
    const trimmed = username.trim();
    if (!trimmed) return 'US';
    return trimmed.substring(0, 2).toUpperCase();
  };

  const getRoleLabel = (role?: string): string => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Administrator';
      case 'seller':
        return 'Prodavac';
      case 'manager':
        return 'Menadzer prodaje';
      default:
        return role ?? '';
    }
  };

  const handleLogout = () => {
    logout();
  };

  const userInitials = getInitials(user?.username);
  const roleLabel = getRoleLabel(user?.role);

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <Droplets size={24} />
        </div>
        <div className="sidebar__brand">
          <div className="sidebar__brand-name">O'Sinjel De Or</div>
          <div className="sidebar__brand-subtitle">Parfumerija</div>
        </div>
      </div>

      <nav className="sidebar__nav">
        <NavItem to="/production" icon={<Leaf size={20} />} label="Proizvodnja" />
        <NavItem to="/processing" icon={<FlaskConical size={20} />} label="Prerada" disabled />
        <NavItem to="/packaging" icon={<Package size={20} />} label="Pakovanje" disabled />
        <NavItem to="/storage" icon={<Warehouse size={20} />} label="Skladistenje" disabled />
        <NavItem to="/sales" icon={<ShoppingCart size={20} />} label="Prodaja" disabled />

        <div className="sidebar__divider" />

        <NavItem to="/analytics" icon={<BarChart3 size={20} />} label="Analiza prodaje" disabled />
        <NavItem to="/performance" icon={<Activity size={20} />} label="Performanse" disabled />
        <NavItem to="/audit-logs" icon={<FileText size={20} />} label="Evidencija" disabled />

        <div className="sidebar__divider" />

        <NavItem to="/settings" icon={<Settings size={20} />} label="Podesavanja" disabled />
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__profile" onClick={handleLogout} title="Odjavi se">
          <div className="sidebar__avatar">{userInitials}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user?.username}</div>
            <div className="sidebar__user-role">{roleLabel}</div>
          </div>
          <LogOut size={16} className="sidebar__logout-icon" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
