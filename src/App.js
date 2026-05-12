import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from './components/Login';
import Navbar from "./components/Navbar";
import WorkflowHistory from "./pages/WorkflowHistory";
import AdminStatsPage from "./components/AdminStatsPage";
import AdminDocumentsPage from "./components/AdminDocumentsPage";
import UserManagementPage from "./components/UserManagementPage";
import TwoFactorSetup from "./components/TwoFactorSetup";
import WorkflowSignature from "./pages/WorkflowSignature";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/dashboard"
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

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>

      <ToastContainer position="top-right" />
    </BrowserRouter>
  );
}

export default App;
