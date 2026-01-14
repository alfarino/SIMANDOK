import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

interface RoleProtectedRouteProps {
    allowedLevels: number[]
    redirectTo?: string
}

/**
 * Role-based route protection component.
 * Checks user's hierarchy level and redirects if not allowed.
 */
export default function RoleProtectedRoute({
    allowedLevels,
    redirectTo = '/dashboard'
}: RoleProtectedRouteProps) {
    const user = useAppSelector((state) => state.auth.user)

    // If no user data loaded yet, try from localStorage
    let hierarchyLevel = user?.role?.hierarchyLevel
    if (!hierarchyLevel) {
        const userStr = localStorage.getItem('user')
        if (userStr) {
            const userData = JSON.parse(userStr)
            hierarchyLevel = userData?.role?.hierarchyLevel
        }
    }

    // Check if user's level is in allowed levels
    if (hierarchyLevel && allowedLevels.includes(hierarchyLevel)) {
        return <Outlet />
    }

    // Redirect unauthorized users
    return <Navigate to={redirectTo} replace />
}
