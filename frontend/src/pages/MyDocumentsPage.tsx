import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button, IconButton,
    CircularProgress, Alert, Tooltip, Card, CardContent, Grid
} from '@mui/material'
import {
    OpenInNew, Refresh, CheckCircle, Cancel, HourglassEmpty, RateReview
} from '@mui/icons-material'

interface Document {
    id: number
    document_name: string
    document_description: string
    document_link: string
    approval_status: string
    created_at: string
    uploadedBy: { id: number; full_name: string; email: string }
    currentApprover: { id: number; full_name: string; email: string } | null
}

interface PersonalStats {
    pendingForMe: number
    approvedByMe: number
    rejectedByMeActive: number
}

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
    DRAFT: 'default',
    DIAJUKAN: 'warning',
    DIBUKA: 'info',
    DIPERIKSA: 'info',
    DISETUJUI: 'success',
    SIAP_CETAK: 'success',
    DITOLAK: 'error'
}

const STATUS_LABELS: Record<string, string> = {
    DRAFT: 'Draft',
    DIAJUKAN: 'Diajukan',
    DIBUKA: 'Dibuka',
    DIPERIKSA: 'Diperiksa',
    DISETUJUI: 'Disetujui',
    SIAP_CETAK: 'Siap Cetak',
    DITOLAK: 'Ditolak'
}

type TabValue = 'pending' | 'approved' | 'rejected'

export default function MyDocumentsPage() {
    const navigate = useNavigate()
    const [pendingDocs, setPendingDocs] = useState<Document[]>([])
    const [stats, setStats] = useState<PersonalStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [tab, setTab] = useState<TabValue>('pending')
    const [successMsg, setSuccessMsg] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const [pendingRes, statsRes] = await Promise.all([
                fetch('/api/dashboard/pending', { headers }),
                fetch('/api/dashboard/personal-stats', { headers })
            ])

            if (!pendingRes.ok || !statsRes.ok) throw new Error('Failed to fetch data')

            const pendingData = await pendingRes.json()
            const statsData = await statsRes.json()

            setPendingDocs(pendingData.data || [])
            setStats(statsData.data)
        } catch (err) {
            setError('Gagal memuat data')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
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
                    Dokumen Saya
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchData}
                >
                    Refresh
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderLeft: '4px solid #ed6c02', cursor: 'pointer' }} onClick={() => setTab('pending')}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <HourglassEmpty sx={{ fontSize: 36, color: '#ed6c02' }} />
                            <Box>
                                <Typography variant="h4" fontWeight="bold">{stats?.pendingForMe || 0}</Typography>
                                <Typography variant="body2" color="text.secondary">Perlu Anda Review</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderLeft: '4px solid #2e7d32', cursor: 'pointer' }} onClick={() => setTab('approved')}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CheckCircle sx={{ fontSize: 36, color: '#2e7d32' }} />
                            <Box>
                                <Typography variant="h4" fontWeight="bold">{stats?.approvedByMe || 0}</Typography>
                                <Typography variant="body2" color="text.secondary">Sudah Anda Setujui</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderLeft: '4px solid #d32f2f', cursor: 'pointer' }} onClick={() => setTab('rejected')}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Cancel sx={{ fontSize: 36, color: '#d32f2f' }} />
                            <Box>
                                <Typography variant="h4" fontWeight="bold">{stats?.rejectedByMeActive || 0}</Typography>
                                <Typography variant="body2" color="text.secondary">Anda Tolak (Pending Revisi)</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Tabs value={tab} onChange={(_, v) => setTab(v as TabValue)} sx={{ mb: 3 }}>
                <Tab label="Perlu Review" value="pending" />
                <Tab label="Sudah Disetujui" value="approved" />
                <Tab label="Ditolak" value="rejected" />
            </Tabs>

            {/* Pending Documents Table */}
            {tab === 'pending' && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#fff3e0' }}>
                                <TableCell width={50}><strong>No</strong></TableCell>
                                <TableCell><strong>Judul</strong></TableCell>
                                <TableCell><strong>Dari</strong></TableCell>
                                <TableCell><strong>Tanggal</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell width={200}><strong>Aksi</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingDocs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            🎉 Tidak ada dokumen yang perlu direview
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pendingDocs.map((doc, index) => (
                                    <TableRow key={doc.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Typography fontWeight="medium">{doc.document_name}</Typography>
                                            {doc.document_description && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    {doc.document_description.substring(0, 50)}...
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{doc.uploadedBy?.full_name || '-'}</TableCell>
                                        <TableCell>{formatDate(doc.created_at)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={STATUS_LABELS[doc.approval_status] || doc.approval_status}
                                                color={STATUS_COLORS[doc.approval_status] || 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="Buka Dokumen">
                                                    <IconButton size="small" color="primary" href={doc.document_link} target="_blank">
                                                        <OpenInNew />
                                                    </IconButton>
                                                </Tooltip>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={<RateReview />}
                                                    onClick={() => navigate(`/review/${doc.id}`)}
                                                >
                                                    Review
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Placeholder for other tabs */}
            {tab !== 'pending' && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        Fitur riwayat akan ditampilkan di sini
                    </Typography>
                </Paper>
            )}
        </Box>
    )
}
