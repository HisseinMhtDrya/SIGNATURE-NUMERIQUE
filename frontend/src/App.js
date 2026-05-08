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
import WorkflowSignature from './pages/WorkflowSignature';
import GuestWorkflowSignature from './pages/GuestWorkflowSignature';
import WorkflowHistory from './pages/WorkflowHistory';
import ThankYou from './pages/ThankYou';
import OtpAuth from './pages/OtpAuth';

function App() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/otp-auth" element={<OtpAuth />} />
          <Route path="/guest-workflow/:workflowId" element={<GuestWorkflowSignature />} />
          <Route path="/thank-you" element={<ThankYou />} />
          
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
            path="/workflows" 
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <WorkflowHistory />
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
          
          <Route 
            path="/workflow/:workflowId" 
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <WorkflowSignature />
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
