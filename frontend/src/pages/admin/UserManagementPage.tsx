import { useState, useEffect } from 'react'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    FormControl, InputLabel, Select, MenuItem, Chip, Alert,
    CircularProgress, Tooltip
} from '@mui/material'
import { Edit, Delete, Refresh, PersonAdd } from '@mui/icons-material'

interface Role {
    id: number
    role_name: string
    role_code: string
    hierarchy_level: number
}

interface User {
    id: number
    username: string
    email: string
    full_name: string
    team: string
    phone: string
    is_active: boolean
    role: Role
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [saving, setSaving] = useState(false)

    // Form state
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        roleId: 1,
        team: '',
        phone: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const [usersRes, rolesRes] = await Promise.all([
                fetch('/api/users', { headers }),
                fetch('/api/users/roles', { headers })
            ])

            if (!usersRes.ok || !rolesRes.ok) throw new Error('Failed to fetch data')

            const usersData = await usersRes.json()
            const rolesData = await rolesRes.json()

            setUsers(usersData.data || [])
            setRoles(rolesData.data || [])
        } catch (err) {
            setError('Gagal memuat data')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (user?: User) => {
        if (user) {
            setEditingUser(user)
            setForm({
                username: user.username,
                email: user.email,
                password: '',
                fullName: user.full_name,
                roleId: user.role?.id || 1,
                team: user.team || '',
                phone: user.phone || ''
            })
        } else {
            setEditingUser(null)
            setForm({
                username: '',
                email: '',
                password: '',
                fullName: '',
                roleId: 1,
                team: '',
                phone: ''
            })
        }
        setDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setDialogOpen(false)
        setEditingUser(null)
    }

    const handleSave = async () => {
        if (!form.email || !form.fullName || !form.roleId) {
            setError('Email, nama, dan role wajib diisi')
            return
        }

        if (!editingUser && !form.password) {
            setError('Password wajib diisi untuk user baru')
            return
        }

        setSaving(true)
        try {
            const token = localStorage.getItem('token')
            const method = editingUser ? 'PUT' : 'POST'
            const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'

            const body: any = {
                username: form.username || form.email.split('@')[0],
                email: form.email,
                fullName: form.fullName,
                roleId: form.roleId,
                team: form.team,
                phone: form.phone
            }

            if (form.password) {
                body.password = form.password
            }

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Gagal menyimpan')
            }

            setSuccess(editingUser ? 'User berhasil diupdate' : 'User berhasil ditambahkan')
            handleCloseDialog()
            fetchData()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (user: User) => {
        if (!confirm(`Yakin ingin menonaktifkan user ${user.full_name}?`)) return

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/users/${user.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Gagal menghapus')

            setSuccess('User berhasil dinonaktifkan')
            fetchData()
        } catch (err) {
            setError('Gagal menonaktifkan user')
        }
    }

    const getRoleColor = (level: number) => {
        switch (level) {
            case 4: return 'error'
            case 3: return 'warning'
            case 2: return 'info'
            default: return 'default'
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Manajemen User
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" startIcon={<Refresh />} onClick={fetchData}>
                        Refresh
                    </Button>
                    <Button variant="contained" startIcon={<PersonAdd />} onClick={() => handleOpenDialog()}>
                        Tambah User
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell width={50}><strong>No</strong></TableCell>
                            <TableCell><strong>Nama</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Role</strong></TableCell>
                            <TableCell><strong>Tim</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell width={120}><strong>Aksi</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        Belum ada user. Klik "Tambah User" untuk menambahkan.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user, index) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <Typography fontWeight="medium">{user.full_name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            @{user.username}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role?.role_name || '-'}
                                            color={getRoleColor(user.role?.hierarchy_level || 1) as any}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{user.team || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.is_active ? 'Aktif' : 'Nonaktif'}
                                            color={user.is_active ? 'success' : 'default'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" color="primary" onClick={() => handleOpenDialog(user)}>
                                                <Edit />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Nonaktifkan">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDelete(user)}
                                                disabled={!user.is_active}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingUser ? 'Edit User' : 'Tambah User Baru'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Nama Lengkap"
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                            fullWidth
                        />
                        <TextField
                            label={editingUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required={!editingUser}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={form.roleId}
                                label="Role"
                                onChange={(e) => setForm({ ...form, roleId: e.target.value as number })}
                            >
                                {roles.map((role) => (
                                    <MenuItem key={role.id} value={role.id}>
                                        {role.role_name} (Level {role.hierarchy_level})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Tim"
                            value={form.team}
                            onChange={(e) => setForm({ ...form, team: e.target.value })}
                            fullWidth
                            placeholder="Contoh: Kerja Sama, Alumni, Hilirisasi"
                        />
                        <TextField
                            label="Telepon"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Batal</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} /> : null}
                    >
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
