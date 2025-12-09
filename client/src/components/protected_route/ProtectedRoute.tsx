import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthHook";
import { ShieldAlert, LogOut } from "lucide-react";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole: string;
  redirectTo?: string;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = "/",
}) => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p className="text-muted">Učitavanje...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role authorization
  const allowedRoles = requiredRole.toLowerCase().split(',').map(r => r.trim());
  const userRole = user?.role?.toLowerCase() ?? "";
  
  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="modal-overlay" style={{ background: 'var(--color-background)' }}>
        <div className="card" style={{ maxWidth: '450px', margin: '0 auto' }}>
          <div className="card__header">
            <h2 className="card__title">
              <ShieldAlert size={20} style={{ color: 'var(--color-error)' }} />
              Pristup odbijen
            </h2>
          </div>
          <div className="card__body">
            <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
              <div 
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(248, 113, 113, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-md)',
                  color: 'var(--color-error)'
                }}
              >
                <ShieldAlert size={32} />
              </div>
              <h3 className="empty-state__title">Nemate pristup</h3>
              <p className="empty-state__description">
                Potrebna vam je uloga <strong>"{requiredRole}"</strong> da biste pristupili ovoj stranici.
              </p>
              <p className="text-muted mt-sm" style={{ fontSize: 'var(--font-size-xs)' }}>
                Vaša trenutna uloga: <strong>{user?.role}</strong>
              </p>
            </div>
          </div>
          <div className="card__footer" style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn--primary" onClick={handleLogout}>
              <LogOut size={16} />
              Odjavi se
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authorized - render children
  return <>{children}</>;
};

export default ProtectedRoute;