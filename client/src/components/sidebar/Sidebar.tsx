import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
import { useServices } from '../../contexts/ServiceContext';
import { UserDTO } from '../../models/users/UserDTO';
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
  const { user, token, logout } = useAuth();
  const { userAPI } = useServices();
  const navigate = useNavigate();
  const [currentUserProfile, setCurrentUserProfile] = useState<UserDTO | null>(null);

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

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      if (!token) {
        setCurrentUserProfile(null);
        return;
      }

      try {
        const profile = await userAPI.getCurrentUser(token);
        if (isMounted) {
          setCurrentUserProfile(profile);
        }
      } catch {
        if (isMounted) {
          setCurrentUserProfile(null);
        }
      }
    };

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [token, userAPI]);

  const getInitials = (username?: string, firstName?: string | null, lastName?: string | null): string => {
    const safeFirstName = firstName?.trim() ?? '';
    const safeLastName = lastName?.trim() ?? '';

    if (safeFirstName && safeLastName) {
      return `${safeFirstName[0]}${safeLastName[0]}`.toUpperCase();
    }

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

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const resolvedFirstName = user?.firstName ?? currentUserProfile?.firstName ?? '';
  const resolvedLastName = user?.lastName ?? currentUserProfile?.lastName ?? '';
  const resolvedUsername = user?.username ?? currentUserProfile?.username ?? '';
  const fullName = `${resolvedFirstName} ${resolvedLastName}`.trim();

  const userInitials = getInitials(resolvedUsername, resolvedFirstName, resolvedLastName);
  const roleLabel = getRoleLabel(user?.role ?? currentUserProfile?.role);
  const resolvedProfileImage = user?.profileImage !== undefined
    ? user.profileImage ?? ''
    : currentUserProfile?.profileImage ?? '';
  const profileImage = resolvedProfileImage.trim();

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
          <button
            type="button"
            className="sidebar__profile-button"
            onClick={handleProfileClick}
            title="Uredi profil"
          >
            <div className="sidebar__avatar">
              {profileImage ? <img src={profileImage} alt="Profilna slika" /> : userInitials}
            </div>
            <div className="sidebar__user-info">
              <div className="sidebar__user-name">{fullName || resolvedUsername}</div>
              <div className="sidebar__user-role">{roleLabel}</div>
            </div>
          </button>
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
