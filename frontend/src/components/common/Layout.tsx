import { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider } from '@mui/material';
import { Menu as MenuIcon, Dashboard, Description, Upload, Archive, Logout, AssignmentInd, PeopleAlt } from '@mui/icons-material';
import NotificationBell from './NotificationBell';

const drawerWidth = 240;

interface UserInfo {
    id: number;
    email: string;
    fullName: string;
    role: {
        id: number;
        name: string;
        code: string;
        hierarchyLevel: number;
    };
}

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<UserInfo | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Get user info from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    const isAdmin = user?.role?.code === 'Z' || user?.role?.hierarchyLevel === 0;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Menu items based on role
    const menuItems = useMemo(() => {
        if (isAdmin) {
            // Admin menu - only user management & read-only access
            return [
                { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
                { text: 'Manajemen User', icon: <PeopleAlt />, path: '/users' },
                { text: 'Semua Dokumen', icon: <Description />, path: '/documents' },
                { text: 'Arsip', icon: <Archive />, path: '/archive' },
            ];
        }

        const hierarchyLevel = user?.role?.hierarchyLevel || 0;
        const isStaff = hierarchyLevel === 1;
        const isApprover = hierarchyLevel >= 2 && hierarchyLevel <= 4;

        // Staff menu - can upload documents, track their submissions
        if (isStaff) {
            return [
                { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
                { text: 'Semua Dokumen', icon: <Description />, path: '/documents' },
                { text: 'Upload', icon: <Upload />, path: '/upload' },
                { text: 'Dokumen Diajukan', icon: <AssignmentInd />, path: '/dokumen-diajukan' },
                { text: 'Arsip', icon: <Archive />, path: '/archive' },
            ];
        }

        // Approver menu (Kasie/Kasubdit/Direktur) - review documents
        if (isApprover) {
            return [
                { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
                { text: 'Semua Dokumen', icon: <Description />, path: '/documents' },
                { text: 'Review Dokumen', icon: <AssignmentInd />, path: '/review-documents' },
                { text: 'Arsip', icon: <Archive />, path: '/archive' },
            ];
        }

        // Fallback menu
        return [
            { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
            { text: 'Semua Dokumen', icon: <Description />, path: '/documents' },
            { text: 'Arsip', icon: <Archive />, path: '/archive' },
        ];
    }, [isAdmin, user]);

    const drawer = (
        <Box>
            {/* Logo Section */}
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 2,
                }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.25rem',
                    }}>
                    S
                </Box>
                <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: 'primary.main' }}>
                    SIMANDOK
                </Typography>
            </Toolbar>

            {/* User Info Card */}
            {user && (
                <Box
                    sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            p: 1.5,
                            bgcolor: 'grey.50',
                            borderRadius: 2,
                        }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: 'primary.main',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '1rem',
                            }}>
                            {user.fullName.charAt(0).toUpperCase()}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap sx={{ color: 'text.primary' }}>
                                {user.fullName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {isAdmin ? '👑 Admin Sistem' : user.role?.name}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Navigation Menu */}
            <List sx={{ px: 1, py: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton selected={location.pathname === item.path} onClick={() => navigate(item.path)}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        sx={{
                            mr: 2,
                            display: { sm: 'none' },
                            color: 'text.primary',
                        }}>
                        <MenuIcon />
                    </IconButton>

                    {/* Logo for Header - Mobile/Desktop */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: { xs: 1, sm: 0 } }}>
                        <Box
                            sx={{
                                display: { xs: 'flex', sm: 'none' },
                                width: 32,
                                height: 32,
                                bgcolor: 'primary.main',
                                borderRadius: 1.5,
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '1rem',
                            }}>
                            S
                        </Box>
                        <Typography
                            variant="h6"
                            noWrap
                            sx={{
                                display: { xs: 'none', sm: 'block' },
                                color: 'text.primary',
                                fontWeight: 600,
                            }}>
                            Sistem Manajemen Dokumen
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Right side actions */}
                    {!isAdmin && <NotificationBell />}
                    <IconButton
                        onClick={handleLogout}
                        sx={{
                            ml: 1,
                            color: 'text.primary',
                            '&:hover': {
                                bgcolor: 'action.hover',
                            },
                        }}>
                        <Logout />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
                }}>
                {drawer}
            </Drawer>

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { width: drawerWidth },
                }}>
                {drawer}
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                }}>
                <Outlet />
            </Box>
        </Box>
    );
}
