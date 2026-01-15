import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button, IconButton,
    CircularProgress, Alert, Tooltip, Card, CardContent, Grid
} from '@mui/material'
import {
    OpenInNew, Refresh, CheckCircle, Cancel, HourglassEmpty, RateReview, History
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
    SUDAH_DICETAK: 'success',
    DITOLAK: 'error'
}

const STATUS_LABELS: Record<string, string> = {
    DRAFT: 'Draft',
    DIAJUKAN: 'Diajukan',
    DIBUKA: 'Dibuka',
    DIPERIKSA: 'Diperiksa',
    DISETUJUI: 'Disetujui',
    SIAP_CETAK: 'Siap Cetak',
    SUDAH_DICETAK: 'Sudah Dicetak',
    DITOLAK: 'Ditolak'
}

type TabValue = 'pending' | 'approved' | 'rejected'

export default function ReviewDokumenPage() {
    const navigate = useNavigate()
    const [pendingDocs, setPendingDocs] = useState<Document[]>([])
    const [approvedDocs, setApprovedDocs] = useState<Document[]>([])
    const [rejectedDocs, setRejectedDocs] = useState<Document[]>([])
    const [stats, setStats] = useState<PersonalStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [tab, setTab] = useState<TabValue>('pending')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const [pendingRes, statsRes, approvedRes, rejectedRes] = await Promise.all([
                fetch('/api/dashboard/pending', { headers }),
                fetch('/api/dashboard/personal-stats', { headers }),
                fetch('/api/dashboard/approved-by-me', { headers }),
                fetch('/api/dashboard/rejected-by-me', { headers })
            ])

            if (!pendingRes.ok || !statsRes.ok) throw new Error('Failed to fetch data')

            const pendingData = await pendingRes.json()
            const statsData = await statsRes.json()
            const approvedData = approvedRes.ok ? await approvedRes.json() : { data: [] }
            const rejectedData = rejectedRes.ok ? await rejectedRes.json() : { data: [] }

            setPendingDocs(pendingData.data || [])
            setStats(statsData.data)
            setApprovedDocs(approvedData.data || [])
            setRejectedDocs(rejectedData.data || [])
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

    const getCurrentDocs = () => {
        switch (tab) {
            case 'pending': return pendingDocs
            case 'approved': return approvedDocs
            case 'rejected': return rejectedDocs
            default: return []
        }
    }

    const getTableColor = () => {
        switch (tab) {
            case 'pending': return '#fff3e0'
            case 'approved': return '#e8f5e9'
            case 'rejected': return '#ffebee'
            default: return '#f5f5f5'
        }
    }

    const getEmptyMessage = () => {
        switch (tab) {
            case 'pending': return '🎉 Tidak ada dokumen yang perlu direview'
            case 'approved': return '📄 Belum ada dokumen yang Anda setujui'
            case 'rejected': return '📄 Tidak ada dokumen yang Anda tolak (pending revisi)'
            default: return 'Tidak ada dokumen'
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    const currentDocs = getCurrentDocs()

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Review Dokumen
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
                <Tab label={`Perlu Review (${pendingDocs.length})`} value="pending" />
                <Tab label={`Sudah Disetujui (${approvedDocs.length})`} value="approved" />
                <Tab label={`Ditolak (${rejectedDocs.length})`} value="rejected" />
            </Tabs>

            {/* Documents Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: getTableColor() }}>
                            <TableCell width={50}><strong>No</strong></TableCell>
                            <TableCell><strong>Judul</strong></TableCell>
                            <TableCell><strong>Dari</strong></TableCell>
                            <TableCell><strong>Tanggal</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell width={200}><strong>Aksi</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentDocs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        {getEmptyMessage()}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentDocs.map((doc, index) => (
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
                                            {tab === 'pending' ? (
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={<RateReview />}
                                                    onClick={() => navigate(`/review/${doc.id}`)}
                                                >
                                                    Review
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<History />}
                                                    onClick={() => navigate(`/review-history/${doc.id}`)}
                                                >
                                                    Riwayat
                                                </Button>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}
