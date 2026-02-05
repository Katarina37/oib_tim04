import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuthHook';
import { ProtectedRoute } from './components/protected_route/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import AuthPage from './pages/AuthPage';
import ProductionPage from './pages/ProductionPage';
import WeatherPage from './pages/WeatherPage';
import SettingsPage from './pages/SettingsPage';
import UnderConstructionPage from './pages/UnderConstructionPage';
import AnalysisPage from './pages/AnalysisPage';
import PerformancePage from './pages/PerformancePage';
import { getDefaultRouteForRole } from './helpers/roleAccess';
import StoragePage from './pages/StoragePage';
import { SalesPage } from './pages/SalesPage';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const defaultRoute = getDefaultRouteForRole(user?.role);

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? <Navigate to={defaultRoute} replace /> : <AuthPage />
        } 
      />
      <Route 
        path="/auth" 
        element={
          isAuthenticated ? <Navigate to={defaultRoute} replace /> : <AuthPage />
        } 
      />

      {/* Protected routes with layout */}
      <Route
        path="/production"
        element={
          <ProtectedRoute requiredRole="seller,sales_manager">
            <AppLayout>
              <ProductionPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/processing"
        element={
          <ProtectedRoute requiredRole="seller,sales_manager">
            <AppLayout>
              <UnderConstructionPage 
                title="Prerada sirovina" 
                description="Mikroservis za preradu biljaka u parfeme"
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/packaging"
        element={
          <ProtectedRoute requiredRole="seller,sales_manager">
            <AppLayout>
              <UnderConstructionPage 
                title="Pakovanje" 
                description="Mikroservis za pakovanje parfema u ambalažu"
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/storage"
        element={
          <ProtectedRoute requiredRole="seller,sales_manager">
            <AppLayout>
              <StoragePage/>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales"
        element={
          <ProtectedRoute requiredRole="seller,sales_manager">
            <AppLayout>
              <SalesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Weather and Settings - SELLER only */}
      <Route
        path="/weather"
        element={
          <ProtectedRoute requiredRole="seller">
            <AppLayout>
              <WeatherPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute requiredRole="seller">
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute requiredRole="admin">
            <AppLayout>
              <AnalysisPage/>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/performance"
        element={
          <ProtectedRoute requiredRole="admin">
            <AppLayout>
              <PerformancePage/>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute requiredRole="admin">
            <AppLayout>
              <UnderConstructionPage 
                title="Evidencija događaja" 
                description="Mikroservis za audit logove sistema"
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
