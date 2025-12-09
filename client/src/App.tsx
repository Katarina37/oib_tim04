import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuthHook';
import { ProtectedRoute } from './components/protected_route/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import AuthPage from './pages/AuthPage';
import ProductionPage from './pages/ProductionPage';
import UnderConstructionPage from './pages/UnderConstructionPage';

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

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
          isAuthenticated ? <Navigate to="/production" replace /> : <AuthPage />
        } 
      />
      <Route 
        path="/auth" 
        element={
          isAuthenticated ? <Navigate to="/production" replace /> : <AuthPage />
        } 
      />

      {/* Protected routes with layout */}
      <Route
        path="/production"
        element={
          <ProtectedRoute requiredRole="admin,seller">
            <AppLayout>
              <ProductionPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/processing"
        element={
          <ProtectedRoute requiredRole="admin,seller">
            <AppLayout>
              <UnderConstructionPage 
                title="Prerada siroovina" 
                description="Mikroservis za preradu biljaka u parfeme"
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/packaging"
        element={
          <ProtectedRoute requiredRole="admin,seller">
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
          <ProtectedRoute requiredRole="admin,seller">
            <AppLayout>
              <UnderConstructionPage 
                title="Skladištenje" 
                description="Mikroservis za upravljanje skladištima"
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales"
        element={
          <ProtectedRoute requiredRole="admin,seller">
            <AppLayout>
              <UnderConstructionPage 
                title="Prodaja" 
                description="Mikroservis za prodaju parfema"
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute requiredRole="admin">
            <AppLayout>
              <UnderConstructionPage 
                title="Analiza prodaje" 
                description="Mikroservis za analizu podataka i izveštavanje"
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/performance"
        element={
          <ProtectedRoute requiredRole="admin">
            <AppLayout>
              <UnderConstructionPage 
                title="Analiza performansi" 
                description="Mikroservis za analizu performansi logističkih algoritama"
              />
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
                description="Mikroservis za praćenje svih aktivnosti u sistemu"
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute requiredRole="admin,seller">
            <AppLayout>
              <UnderConstructionPage 
                title="Podešavanja" 
                description="Podešavanja korisničkog naloga i sistema"
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