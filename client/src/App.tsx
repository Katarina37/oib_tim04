import { useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import DashboardPage from "./pages/Dashboard";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";
import { AuthAPI } from "./api/auth/AuthAPI";
import { UserAPI } from "./api/users/UserAPI"; // Add this import

function App() {
  const authAPI = useMemo(() => new AuthAPI(), []);
  const userAPI = useMemo(() => new UserAPI(), []); // Create UserAPI instance

  return (
    <Routes>
      <Route path="/" element={<AuthPage authAPI={authAPI} />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="seller">
            <DashboardPage userAPI={userAPI} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;