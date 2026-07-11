import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components & Layout
import DashboardLayout from './components/DashboardLayout';

// View Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/CandidateDashboard';
import MockInterview from './pages/MockInterview';
import CodingTest from './pages/CodingTest';
import AptitudeTest from './pages/AptitudeTest';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminLogs from './pages/AdminLogs';
import AdminCandidates from './pages/AdminCandidates';
import AdminAnnouncements from './pages/AdminAnnouncements';
import JobListings from './pages/JobListings';
import Profile from './pages/Profile';

// Protective Auth Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Protective Role Route Wrapper
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;
  if (user && !allowedRoles.includes(user.role)) {
    // Redirection fallback based on user role
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'recruiter') return <Navigate to="/recruiter" replace />;
    return <Navigate to="/candidate" replace />;
  }
  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Entry Points */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Candidate Operations */}
            <Route path="/candidate" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['candidate']}>
                  <DashboardLayout>
                    <CandidateDashboard />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />
            <Route path="/candidate/interview" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['candidate']}>
                  <DashboardLayout>
                    <MockInterview />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />
            <Route path="/candidate/coding" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['candidate']}>
                  <DashboardLayout>
                    <CodingTest />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />
            <Route path="/candidate/aptitude" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['candidate']}>
                  <DashboardLayout>
                    <AptitudeTest />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />

            {/* Recruiter Board */}
            <Route path="/recruiter" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['recruiter']}>
                  <DashboardLayout>
                    <RecruiterDashboard />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />

            {/* Admin Platform Control Panel */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <AdminUsers />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/logs" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <AdminLogs />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/candidates" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <AdminCandidates />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/announcements" element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <AdminAnnouncements />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            } />

            {/* Shared Protected Pages */}
            <Route path="/jobs" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <JobListings />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;