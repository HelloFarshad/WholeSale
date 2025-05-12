import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';
import PublicRoute from './components/auth/PublicRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';

// Lazy loaded components
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./components/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ItemsPage = lazy(() => import('./pages/items/ItemsPage'));
const ItemDetailsPage = lazy(() => import('./pages/items/ItemDetailsPage'));
const CustomersPage = lazy(() => import('./pages/customers/CustomersPage'));
const CustomerDetailsPage = lazy(() => import('./pages/customers/CustomerDetailsPage'));
const SuppliersPage = lazy(() => import('./pages/suppliers/SuppliersPage'));
const SupplierDetailsPage = lazy(() => import('./pages/suppliers/SupplierDetailsPage')); // Ensure this file exists in the specified path
const SalesOrdersPage = lazy(() => import('./pages/sales/SalesOrdersPage'));
const SalesOrderDetailsPage = lazy(() => import('./pages/sales/SalesOrderDetailsPage')); // Ensure this file exists or update the path
const PurchaseOrdersPage = lazy(() => import('./pages/purchases/PurchaseOrdersPage'));
const PurchaseOrderDetailsPage = lazy(() => import('./pages/purchases/PurchaseOrderDetailsPage'));
const InventoryPage = lazy(() => import('./pages/Inventory/InventoryPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const UsersPage = lazy(() => import('./pages/users/UsersPage'));  
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/errors/NotFoundPage'));

function App() {
  const { isLoading, user, checkUser } = useAuth();

  useEffect(() => {
    console.log('App mounted');
    checkUser();
  }, [checkUser]);

  if (isLoading) {
    console.log('App is loading...');
    return <LoadingScreen />;
  }

  console.log('App rendering routes');
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/items/:id" element={<ItemDetailsPage />} />
            
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetailsPage />} />
            
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/suppliers/:id" element={<SupplierDetailsPage />} />
            
            <Route path="/sales" element={<SalesOrdersPage />} />
            <Route path="/sales/:id" element={<SalesOrderDetailsPage />} />
            
            <Route path="/purchases" element={<PurchaseOrdersPage />} />
            <Route path="/purchases/:id" element={<PurchaseOrderDetailsPage />} />
            
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            
            {/* Admin only routes */}
            <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>

        {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;