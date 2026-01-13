import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
    Box, AppBar, Toolbar, Typography, IconButton, Drawer,
    List, ListItem, ListItemIcon, ListItemText, ListItemButton, Badge
} from '@mui/material'
import {
    Menu as MenuIcon, Dashboard, Description, Upload,
    Archive, Notifications, Logout
} from '@mui/icons-material'

const drawerWidth = 240

const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Dokumen', icon: <Description />, path: '/documents' },
    { text: 'Upload', icon: <Upload />, path: '/upload' },
    { text: 'Arsip', icon: <Archive />, path: '/archive' }
]

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const drawer = (
        <Box>
            <Toolbar>
                <Typography variant="h6" noWrap>
                    SIMANDOK
                </Typography>
            </Toolbar>
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    )

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                        Sistem Manajemen Dokumen
                    </Typography>
                    <IconButton color="inherit">
                        <Badge badgeContent={0} color="error">
                            <Notifications />
                        </Badge>
                    </IconButton>
                    <IconButton color="inherit" onClick={() => navigate('/login')}>
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
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }
                }}
            >
                {drawer}
            </Drawer>

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { width: drawerWidth }
                }}
            >
                {drawer}
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8
                }}
            >
                <Outlet />
            </Box>
        </Box>
    )
}
