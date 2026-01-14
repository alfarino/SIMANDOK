import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import ReviewDokumenPage from './pages/ReviewDokumenPage'
import DokumenDiajukanPage from './pages/DokumenDiajukanPage'
import UploadPage from './pages/UploadPage'
import ArchivePage from './pages/ArchivePage'
import UserManagementPage from './pages/UserManagementPage'
import DocumentReviewPage from './pages/DocumentReviewPage'
import ReviewHistoryPage from './pages/ReviewHistoryPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import RoleProtectedRoute from './components/auth/RoleProtectedRoute'
import Layout from './components/common/Layout'

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    {/* Common routes for all roles */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route path="/archive" element={<ArchivePage />} />
                    <Route path="/review/:id" element={<DocumentReviewPage />} />
                    <Route path="/review-history/:id" element={<ReviewHistoryPage />} />

                    {/* Staff-only routes (Level 1) */}
                    <Route element={<RoleProtectedRoute allowedLevels={[1]} />}>
                        <Route path="/upload" element={<UploadPage />} />
                        <Route path="/dokumen-diajukan" element={<DokumenDiajukanPage />} />
                    </Route>

                    {/* Approver-only routes (Level 2, 3, 4) */}
                    <Route element={<RoleProtectedRoute allowedLevels={[2, 3, 4]} />}>
                        <Route path="/review-dokumen" element={<ReviewDokumenPage />} />
                    </Route>

                    {/* Admin-only routes */}
                    <Route path="/users" element={<UserManagementPage />} />
                </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}

export default App
