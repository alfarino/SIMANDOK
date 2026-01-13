import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import UploadPage from './pages/UploadPage'
import ArchivePage from './pages/ArchivePage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/common/Layout'

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/archive" element={<ArchivePage />} />
                </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}

export default App
