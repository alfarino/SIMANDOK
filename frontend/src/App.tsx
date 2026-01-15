import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import RoleProtectedRoute from './components/auth/RoleProtectedRoute'
import AdminProtectedRoute from './components/auth/AdminProtectedRoute'
import Layout from './components/common/Layout'

// All users pages
import DashboardPage from './pages/all/DashboardPage'
import DocumentsPage from './pages/all/DocumentsPage'
import ArchivePage from './pages/all/ArchivePage'
import ReviewHistoryPage from './pages/all/ReviewHistoryPage'

// Admin only pages
import UserManagementPage from './pages/admin/UserManagementPage'

// Staff only pages
import UploadPage from './pages/staff/UploadPage'
import DokumenDiajukanPage from './pages/staff/DokumenDiajukanPage'

// Executive (Approver) only pages
import ReviewDocumentsPage from './pages/executive/ReviewDocumentsPage'
import DocumentReviewPage from './pages/executive/DocumentReviewPage'

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    {/* Common routes for all authenticated users */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route path="/archive" element={<ArchivePage />} />
                    <Route path="/review-history/:id" element={<ReviewHistoryPage />} />

                    {/* Staff-only routes (Level 1) */}
                    <Route element={<RoleProtectedRoute allowedLevels={[1]} />}>
                        <Route path="/upload" element={<UploadPage />} />
                        <Route path="/dokumen-diajukan" element={<DokumenDiajukanPage />} />
                    </Route>

                    {/* Executive/Approver-only routes (Level 2, 3, 4) */}
                    <Route element={<RoleProtectedRoute allowedLevels={[2, 3, 4]} />}>
                        <Route path="/review-documents" element={<ReviewDocumentsPage />} />
                        <Route path="/review/:id" element={<DocumentReviewPage />} />
                    </Route>

                    {/* Admin-only routes (Role code Z) */}
                    <Route element={<AdminProtectedRoute />}>
                        <Route path="/users" element={<UserManagementPage />} />
                    </Route>
                </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}

export default App
