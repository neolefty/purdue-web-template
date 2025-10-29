import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { GoogleMapsProvider } from './contexts/GoogleMapsContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import ManageUsersPage from './pages/ManageUsersPage'
import PasswordResetPage from './pages/PasswordResetPage'
import PasswordResetRequestPage from './pages/PasswordResetRequestPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ProtectedRoute from './components/ProtectedRoute'
import PlotsPage from './pages/turf-research/PlotsPage'
import TreatmentsPage from './pages/turf-research/TreatmentsPage'
import TurfResearchIndexPage from './pages/turf-research/IndexPage'
import ReportsPage from './pages/turf-research/ReportsPage'
import PrintReportsPage from './pages/turf-research/PrintReportsPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <GoogleMapsProvider>
          <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<PasswordResetRequestPage />} />
            <Route path="/reset-password/:uid/:token" element={<PasswordResetPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/change-password"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage/users"
              element={
                <ProtectedRoute>
                  <ManageUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/turf-research"
              element={
                <ProtectedRoute>
                  <TurfResearchIndexPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/turf-research/plots"
              element={
                <ProtectedRoute>
                  <PlotsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/turf-research/plots/:plotId/treatments"
              element={
                <ProtectedRoute>
                  <TreatmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/turf-research/treatments"
              element={
                <ProtectedRoute>
                  <TreatmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/turf-research/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/turf-research/reports/print"
              element={
                <ProtectedRoute>
                  <PrintReportsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </GoogleMapsProvider>
    </AuthProvider>
  </Router>
  )
}

export default App
