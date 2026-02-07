import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Leaf,
  FlaskConical,
  Warehouse,
  ShoppingCart,
  BarChart3,
  Activity,
  FileText,
  LogOut,
  Droplets,
  CloudSun,
  Settings,
} from 'lucide-react';
import { normalizeRole, RoleKey } from '../../helpers/roleAccess';
import { useAuth } from '../../hooks/useAuthHook';
import './Sidebar.css';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

type NavSection = 'operations' | 'system' | 'seller';

type NavConfigItem = NavItemProps & {
  allowedRoles: RoleKey[];
  section: NavSection;
};

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

  const navItems: NavConfigItem[] = [
    {
      to: "/production",
      icon: <Leaf size={20} />,
      label: "Proizvodnja",
      allowedRoles: ["seller", "sales_manager"],
      section: "operations",
    },
    {
      to: "/processing",
      icon: <FlaskConical size={20} />,
      label: "Prerada",
      allowedRoles: ["seller", "sales_manager"],
      section: "operations",
    },
    {
      to: "/storage",
      icon: <Warehouse size={20} />,
      label: "Skladistenje",
      allowedRoles: ["seller", "sales_manager"],
      section: "operations",
    },
    {
      to: "/sales",
      icon: <ShoppingCart size={20} />,
      label: "Prodaja",
      allowedRoles: ["seller", "sales_manager"],
      section: "operations",
    },
    // Weather and Settings - SELLER only
    {
      to: "/weather",
      icon: <CloudSun size={20} />,
      label: "Vreme",
      allowedRoles: ["seller"],
      section: "seller",
    },
    {
      to: "/settings",
      icon: <Settings size={20} />,
      label: "Podešavanje",
      allowedRoles: ["seller"],
      section: "seller",
    },
    // Admin section
    {
      to: "/analytics",
      icon: <BarChart3 size={20} />,
      label: "Analiza prodaje",
      allowedRoles: ["admin"],
      section: "system",
    },
    {
      to: "/performance",
      icon: <Activity size={20} />,
      label: "Performanse",
      allowedRoles: ["admin"],
      section: "system",
    },
    {
      to: "/audit-logs",
      icon: <FileText size={20} />,
      label: "Evidencija",
      allowedRoles: ["admin"],
      section: "system",
    },
  ];

  const normalizedRole = normalizeRole(user?.role);

  const filterItemsBySection = (section: NavSection) =>
    navItems.filter(
      (item) =>
        item.section === section &&
        (normalizedRole ? item.allowedRoles.includes(normalizedRole) : false)
    );

  const operationsItems = filterItemsBySection('operations');
  const sellerItems = filterItemsBySection('seller');
  const systemItems = filterItemsBySection('system');
  const sellerPrimaryItems = sellerItems.filter((item) => item.to !== "/settings");
  const settingsItem = sellerItems.find((item) => item.to === "/settings");

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
      case 'sales_manager':
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
          <div className="sidebar__brand-subtitle">Parfimerija</div>
        </div>
      </div>

      <nav className="sidebar__nav">
        {operationsItems.length > 0 && (
          <div className="sidebar__section">
            {operationsItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>
        )}

        {sellerPrimaryItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        {systemItems.length > 0 && (
          <div className="sidebar__section">
            <span className="sidebar__section-title">Sistem</span>
            {systemItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>
        )}

        {settingsItem && (
          <div className="sidebar__nav-bottom">
            <NavItem {...settingsItem} />
          </div>
        )}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__profile">
          <div className="sidebar__avatar">{userInitials}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user?.username}</div>
            <div className="sidebar__user-role">{roleLabel}</div>
          </div>
          <button
            type="button"
            className="sidebar__logout-button"
            onClick={handleLogout}
            title="Odjavi se"
          >
            <LogOut size={16} className="sidebar__logout-icon" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
