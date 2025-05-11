import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PublicRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (isLoading) {
    return null;
  }

  return user ? <Navigate to={from} replace /> : <Outlet />;
};

export default PublicRoute;