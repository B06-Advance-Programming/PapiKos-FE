import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './modules/home/Home';
import Login from './modules/auth/Login';
import Register from './modules/auth/Register';
import NotFound from './modules/NotFound';
import WishlistPage from './components/wishlist/WishlistPage';
import NavBar from './components/NavBar';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import AdminDashboard from './admin/AdminDashboard';
import PenyewaDashboard from './penyewa/PenyewaDashboard';
import PemilikDashboard from './pemilik/PemilikDashboard';
import RequireRole from './components/RequireRole';

import PaymentDashboard from './components/payment/PaymentDashboard'; // <= Add this import!
import './App.css';

function App() {
  // Inline component inside App to handle '/' route redirect based on auth state
  function HomeRedirect() {
    const { user, roles, isLoading } = useAuth();

    if (isLoading) {
      // loading spinner or placeholder
      return <div>Loading...</div>;
    }

    if (!user) {
      // Not authenticated, show public Home
      return <Home />;
    }

    // Authenticated, redirect according to role
    if (roles.includes('ADMIN')) return <Navigate to="/admin/dashboard" replace />;
    if (roles.includes('PENYEWA')) return <Navigate to="/penyewa/dashboard" replace />;
    if (roles.includes('PEMILIK')) return <Navigate to="/pemilik/dashboard" replace />;

    // No matching role fallback — show Home or redirect somewhere else
    return <Home />;
  }

  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <div className="app-container">
          <Routes>
            <Route path="/" element={<HomeRedirect />} />

            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />

            {/* Protect wishlist page */}
            <Route
              path="/wishlist"
              element={
                <RequireRole allowedRoles={['PENYEWA']}>
                  <WishlistPage />
                </RequireRole>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <RequireRole allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </RequireRole>
              }
            />

            <Route
              path="/penyewa/dashboard"
              element={
                <RequireRole allowedRoles={['PENYEWA']}>
                  <PenyewaDashboard />
                </RequireRole>
              }
            />

            <Route
              path="/pemilik/dashboard"
              element={
                <RequireRole allowedRoles={['PEMILIK']}>
                  <PemilikDashboard />
                </RequireRole>
              }
            />

            {/* Payment Dashboard routes for Penyewa and Pemilik */}
            <Route
              path="/penyewa/payment"
              element={
                <RequireRole allowedRoles={['PENYEWA']}>
                  <PaymentDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/pemilik/payment"
              element={
                <RequireRole allowedRoles={['PEMILIK']}>
                  <PaymentDashboard />
                </RequireRole>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;