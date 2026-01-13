import { createSlice } from '@reduxjs/toolkit'

interface NotificationState {
    notifications: any[]
    unreadCount: number
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0
}

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setNotifications: (state, action) => {
            state.notifications = action.payload
        },
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload
        },
        markAsRead: (state, action) => {
            const notification = state.notifications.find(n => n.id === action.payload)
            if (notification) {
                notification.isRead = true
                state.unreadCount = Math.max(0, state.unreadCount - 1)
            }
        }
    }
})

export const { setNotifications, setUnreadCount, markAsRead } = notificationSlice.actions
export default notificationSlice.reducer
