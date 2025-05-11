import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RoleBasedRouteProps {
  allowedRoles: string[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  const hasRequiredRole = user && allowedRoles.includes(user.role);

  return hasRequiredRole ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" state={{ from: location }} replace />
  );
};

export default RoleBasedRoute;