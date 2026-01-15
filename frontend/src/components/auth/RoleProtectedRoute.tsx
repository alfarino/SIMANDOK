import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

interface RoleProtectedRouteProps {
    allowedLevels?: number[]
    allowedRoleCodes?: string[]
    redirectTo?: string
}

/**
 * Role-based route protection component.
 * Checks user's hierarchy level or role code and redirects if not allowed.
 * Admin (role_code Z, level 0) always bypasses this check.
 */
export default function RoleProtectedRoute({
    allowedLevels = [],
    allowedRoleCodes = [],
    redirectTo = '/dashboard'
}: RoleProtectedRouteProps) {
    const user = useAppSelector((state) => state.auth.user)

    // If no user data loaded yet, try from localStorage
    let hierarchyLevel = user?.role?.hierarchyLevel
    let roleCode = user?.role?.code

    if (!hierarchyLevel && !roleCode) {
        const userStr = localStorage.getItem('user')
        if (userStr) {
            const userData = JSON.parse(userStr)
            hierarchyLevel = userData?.role?.hierarchyLevel
            roleCode = userData?.role?.code
        }
    }

    // Admin (role_code Z or level 0) bypasses all role checks
    if (roleCode === 'Z' || hierarchyLevel === 0) {
        return <Outlet />
    }

    // Check if user's role code is in allowed codes
    if (roleCode && allowedRoleCodes.includes(roleCode)) {
        return <Outlet />
    }

    // Check if user's level is in allowed levels
    if (hierarchyLevel && allowedLevels.includes(hierarchyLevel)) {
        return <Outlet />
    }

    // Redirect unauthorized users
    return <Navigate to={redirectTo} replace />
}
