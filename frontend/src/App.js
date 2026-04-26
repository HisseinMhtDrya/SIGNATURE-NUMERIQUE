import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminStatsPage from './components/AdminStatsPage';
import UserManagementPage from './components/UserManagementPage';
import AdminDocumentsPage from './components/AdminDocumentsPage';
import TwoFactorSetup from './components/TwoFactorSetup';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Dashboard />
                </>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/stats" 
            element={
              <ProtectedRoute requireAdmin>
                <>
                  <Navbar />
                  <AdminStatsPage />
                </>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/documents" 
            element={
              <ProtectedRoute requireAdmin>
                <>
                  <Navbar />
                  <AdminDocumentsPage />
                </>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute requireAdmin>
                <>
                  <Navbar />
                  <UserManagementPage />
                </>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/setup-2fa" 
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <TwoFactorSetup />
                </>
              </ProtectedRoute>
            } 
          />
          
          {/* Redirection */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        <ToastContainer position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
