import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import AdminDashboard from '../pages/AdminDashboard';
import WardenDashboard from '../pages/WardenDashboard';
import StudentDashboard from '../pages/StudentDashboard';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { token, role } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If authenticated but unauthorized, simply redirect them to their home route.
    if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (role === 'warden') return <Navigate to="/warden-dashboard" replace />;
    if (role === 'student') return <Navigate to="/student-dashboard" replace />;
    
    // Fallback if role represents nothing valid
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { token, role } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={token ? `/${role}-dashboard` : '/login'} replace />} />
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/admin-dashboard/*" 
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/warden-dashboard/*" 
        element={
          <PrivateRoute allowedRoles={['warden']}>
            <Layout>
              <WardenDashboard />
            </Layout>
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/student-dashboard/*" 
        element={
          <PrivateRoute allowedRoles={['student']}>
            <Layout>
              <StudentDashboard />
            </Layout>
          </PrivateRoute>
        } 
      />
      
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
