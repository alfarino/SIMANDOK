import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

export default function ProtectedRoute() {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth)

    // For Phase 1, allow access without auth for testing
    // TODO: Enable auth check in Phase 5
    const bypassAuth = true

    if (!isAuthenticated && !bypassAuth) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
