import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const roleToDashboard = {
  ADMIN: '/admin/dashboard',
  PENYEWA: '/penyewa/dashboard',
  PEMILIK: '/pemilik/dashboard',
};

const RequireRole = ({ allowedRoles, children }) => {
  const { user, roles, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!user) {
    // Not logged in
    return <Navigate to="/auth/login" replace />;
  }

  if (!Array.isArray(roles) || roles.length === 0) {
    // No valid role assigned
    return <Navigate to="/auth/login" replace />;
  }

  // If user has at least one of the allowed roles
  const hasRole = roles.some(role => allowedRoles.includes(role));
  if (hasRole) return children;

  // Redirect to first role's dashboard
  const firstRole = roles[0];
  const dashboard = roleToDashboard[firstRole] || '/';
  return <Navigate to={dashboard} replace />;
};

export default RequireRole;