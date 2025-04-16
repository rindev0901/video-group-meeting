import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const UN_AUTH_ROUTES = ["/login", "/register"];

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // If still loading auth state, don't render anything
  if (loading) {
    return null;
  }

  if (isAuthenticated && UN_AUTH_ROUTES.includes(window.location.pathname)) {
    return <Navigate to="/" replace />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected component
  return children;
};
