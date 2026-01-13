import { useState, useEffect } from 'react'
import {
    Badge, IconButton, Menu, Typography, Box, Divider,
    List, ListItem, ListItemText, Button, CircularProgress
} from '@mui/material'
import { Notifications, MarkEmailRead } from '@mui/icons-material'

interface Notification {
    id: number
    title: string
    message: string
    notification_type: string
    is_read: boolean
    created_at: string
}

export default function NotificationBell() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchUnreadCount()
        // Poll every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const res = await fetch('/api/notifications/unread-count', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.ok) {
                const data = await res.json()
                setUnreadCount(data.data?.count || 0)
            }
        } catch (err) {
            console.error('Failed to fetch unread count')
        }
    }

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.ok) {
                const data = await res.json()
                setNotifications(data.data || [])
            }
        } catch (err) {
            console.error('Failed to fetch notifications')
        } finally {
            setLoading(false)
        }
    }

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
        fetchNotifications()
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem('token')
            await fetch('/api/notifications/read-all', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            setUnreadCount(0)
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        } catch (err) {
            console.error('Failed to mark all as read')
        }
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'Baru saja'
        if (minutes < 60) return `${minutes} menit lalu`
        if (hours < 24) return `${hours} jam lalu`
        return `${days} hari lalu`
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'NEW_DOCUMENT': return '#1976d2'
            case 'APPROVED': return '#2e7d32'
            case 'REJECTED': return '#d32f2f'
            case 'READY_TO_PRINT': return '#9c27b0'
            default: return '#666'
        }
    }

    return (
        <>
            <IconButton color="inherit" onClick={handleOpen}>
                <Badge badgeContent={unreadCount} color="error">
                    <Notifications />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: { width: 360, maxHeight: 400 }
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Notifikasi
                    </Typography>
                    {unreadCount > 0 && (
                        <Button size="small" startIcon={<MarkEmailRead />} onClick={handleMarkAllRead}>
                            Tandai Dibaca
                        </Button>
                    )}
                </Box>
                <Divider />

                {loading ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">Tidak ada notifikasi</Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {notifications.slice(0, 10).map((notif) => (
                            <ListItem
                                key={notif.id}
                                sx={{
                                    bgcolor: notif.is_read ? 'transparent' : 'action.hover',
                                    borderLeft: `3px solid ${getTypeColor(notif.notification_type)}`
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" fontWeight={notif.is_read ? 'normal' : 'bold'}>
                                            {notif.title}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                {notif.message}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled">
                                                {formatTime(notif.created_at)}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Menu>
        </>
    )
}
