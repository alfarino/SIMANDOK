import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

/**
 * Admin-only route protection component.
 * Checks if user has role_code 'Z' (admin).
 */
export default function AdminProtectedRoute({ redirectTo = '/dashboard' }: { redirectTo?: string }) {
    const user = useAppSelector((state) => state.auth.user)

    // If no user data loaded yet, try from localStorage
    let roleCode = user?.role?.code
    let hierarchyLevel = user?.role?.hierarchyLevel

    if (!roleCode) {
        const userStr = localStorage.getItem('user')
        if (userStr) {
            const userData = JSON.parse(userStr)
            roleCode = userData?.role?.code
            hierarchyLevel = userData?.role?.hierarchyLevel
        }
    }

    // Check if user is admin (role_code Z or hierarchy_level 0)
    if (roleCode === 'Z' || hierarchyLevel === 0) {
        return <Outlet />
    }

    // Redirect unauthorized users
    return <Navigate to={redirectTo} replace />
}
