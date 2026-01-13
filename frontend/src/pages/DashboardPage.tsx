import { useState, useEffect } from 'react'
import {
    Box, Typography, Grid, Card, CardContent, Paper, Divider,
    CircularProgress, Alert
} from '@mui/material'
import {
    Description, Pending, CheckCircle, PersonOutline,
    HourglassEmpty, ThumbDown, ThumbUp
} from '@mui/icons-material'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

interface GlobalStats {
    total: number
    pending: number
    approved: number
}

interface BacklogItem {
    approverId: number
    name: string
    pendingCount: number
}

interface PersonalStats {
    pendingForMe: number
    approvedByMe: number
    rejectedByMeActive: number
}

const COLORS = ['#1976d2', '#ed6c02', '#2e7d32', '#9c27b0', '#d32f2f', '#0288d1']

export default function DashboardPage() {
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
    const [backlogData, setBacklogData] = useState<BacklogItem[]>([])
    const [personalStats, setPersonalStats] = useState<PersonalStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const [globalRes, backlogRes, personalRes] = await Promise.all([
                fetch('/api/dashboard/global-stats', { headers }),
                fetch('/api/dashboard/backlog-by-approver', { headers }),
                fetch('/api/dashboard/personal-stats', { headers })
            ])

            if (!globalRes.ok || !backlogRes.ok || !personalRes.ok) {
                throw new Error('Failed to fetch dashboard data')
            }

            const [globalData, backlogDataRes, personalData] = await Promise.all([
                globalRes.json(),
                backlogRes.json(),
                personalRes.json()
            ])

            setGlobalStats(globalData.data)
            setBacklogData(backlogDataRes.data)
            setPersonalStats(personalData.data)
        } catch (err) {
            setError('Gagal memuat data dashboard')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Dashboard
            </Typography>

            {/* Global Stats */}
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                Statistik Keseluruhan
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Description sx={{ fontSize: 48, opacity: 0.8 }} />
                            <Box>
                                <Typography variant="h3" fontWeight="bold">{globalStats?.total || 0}</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>Total Dokumen</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Pending sx={{ fontSize: 48, opacity: 0.8 }} />
                            <Box>
                                <Typography variant="h3" fontWeight="bold">{globalStats?.pending || 0}</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>Pending</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CheckCircle sx={{ fontSize: 48, opacity: 0.8 }} />
                            <Box>
                                <Typography variant="h3" fontWeight="bold">{globalStats?.approved || 0}</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>Approved</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Backlog Chart */}
            <Typography variant="h6" color="text.secondary" gutterBottom>
                Dokumen Tertumpuk per Approver
            </Typography>
            <Paper sx={{ p: 3, mb: 4 }}>
                {backlogData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={backlogData} layout="vertical" margin={{ left: 100 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: 8 }} />
                            <Bar dataKey="pendingCount" radius={[0, 4, 4, 0]} name="Dokumen Pending">
                                {backlogData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">
                            🎉 Tidak ada dokumen tertumpuk
                        </Typography>
                    </Box>
                )}
            </Paper>

            <Divider sx={{ my: 4 }} />

            {/* Personal Stats */}
            <Typography variant="h6" color="text.secondary" gutterBottom>
                <PersonOutline sx={{ verticalAlign: 'middle', mr: 1 }} />
                Statistik Anda
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderLeft: '4px solid #ed6c02' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <HourglassEmpty sx={{ fontSize: 40, color: '#ed6c02' }} />
                            <Box>
                                <Typography variant="h4" fontWeight="bold">{personalStats?.pendingForMe || 0}</Typography>
                                <Typography variant="body2" color="text.secondary">Menunggu Persetujuan Anda</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderLeft: '4px solid #d32f2f' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <ThumbDown sx={{ fontSize: 40, color: '#d32f2f' }} />
                            <Box>
                                <Typography variant="h4" fontWeight="bold">{personalStats?.rejectedByMeActive || 0}</Typography>
                                <Typography variant="body2" color="text.secondary">Ditolak (Belum Direvisi)</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderLeft: '4px solid #2e7d32' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <ThumbUp sx={{ fontSize: 40, color: '#2e7d32' }} />
                            <Box>
                                <Typography variant="h4" fontWeight="bold">{personalStats?.approvedByMe || 0}</Typography>
                                <Typography variant="body2" color="text.secondary">Sudah Anda Setujui</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    )
}
