import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Container, Card, CardContent, TextField,
    Button, Alert, CircularProgress, InputAdornment, IconButton
} from '@mui/material'
import { Visibility, VisibilityOff, Login } from '@mui/icons-material'

export default function LoginPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email || !password) {
            setError('Email dan password wajib diisi')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Login gagal')
            }

            // Store token
            localStorage.setItem('token', data.data.token)
            localStorage.setItem('user', JSON.stringify(data.data.user))

            // Redirect to dashboard
            navigate('/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login gagal')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
        >
            <Container maxWidth="sm">
                <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                                SIMANDOK
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Sistem Informasi Manajemen Dokumen
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Direktorat Kerjasama - Universitas Andalas
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleLogin}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{ mb: 2 }}
                                placeholder="nama@unand.ac.id"
                                autoComplete="email"
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ mb: 3 }}
                                autoComplete="current-password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Login />}
                                sx={{ py: 1.5 }}
                            >
                                {loading ? 'Masuk...' : 'Masuk'}
                            </Button>
                        </form>

                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                © 2024 DKSHR Universitas Andalas
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    )
}
