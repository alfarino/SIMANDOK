import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Button, CircularProgress, Alert,
    Card, CardContent, Grid, Chip
} from '@mui/material'
import {
    ArrowBack, OpenInNew, CheckCircle, Cancel, AccessTime,
    Person, CalendarToday
} from '@mui/icons-material'

interface Approver {
    id: number
    full_name: string
    role: { role_name: string; hierarchy_level: number }
    status: string
    viewed_at: string | null
    approved_at: string | null
    remarks: string | null
}

interface Document {
    id: number
    document_name: string
    document_description: string
    document_link: string
    approval_status: string
    rejection_reason: string | null
    created_at: string
    uploadedBy: { full_name: string; email: string }
    approvers: Approver[]
}

export default function ReviewHistoryPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [document, setDocument] = useState<Document | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchDocument()
    }, [id])

    const fetchDocument = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/documents/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Failed to fetch document')

            const data = await res.json()
            setDocument(data.data)
        } catch (err) {
            setError('Gagal memuat dokumen')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'success'
            case 'REJECTED': return 'error'
            case 'PENDING': return 'warning'
            default: return 'default'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle color="success" />
            case 'REJECTED': return <Cancel color="error" />
            default: return <AccessTime color="warning" />
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!document) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="error">Dokumen tidak ditemukan</Typography>
                <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Kembali</Button>
            </Box>
        )
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Riwayat Review</Typography>
                    <Typography color="text.secondary">
                        Lihat catatan review dari setiap approver
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                >
                    Kembali
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {/* Left - Document Info */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ mb: 3 }}>
                        <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 3, py: 2 }}>
                            <Typography variant="h6">Informasi Dokumen</Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Judul</Typography>
                                <Typography variant="h6">{document.document_name}</Typography>
                            </Box>
                            {document.document_description && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Deskripsi</Typography>
                                    <Typography>{document.document_description}</Typography>
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Person fontSize="small" color="action" />
                                    <Typography variant="body2">{document.uploadedBy?.full_name}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarToday fontSize="small" color="action" />
                                    <Typography variant="body2">{formatDate(document.created_at)}</Typography>
                                </Box>
                            </Box>
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<OpenInNew />}
                                href={document.document_link}
                                target="_blank"
                            >
                                Buka Dokumen
                            </Button>
                        </Box>
                    </Paper>

                    {/* Rejection Reason */}
                    {document.rejection_reason && (
                        <Paper sx={{ bgcolor: '#fff3e0' }}>
                            <Box sx={{ p: 3 }}>
                                <Typography variant="subtitle1" fontWeight="bold" color="warning.dark" gutterBottom>
                                    ⚠️ Alasan Penolakan
                                </Typography>
                                <Typography>{document.rejection_reason}</Typography>
                            </Box>
                        </Paper>
                    )}
                </Grid>

                {/* Right - Review Timeline */}
                <Grid item xs={12} md={7}>
                    <Paper>
                        <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 3, py: 2 }}>
                            <Typography variant="h6">Timeline Review</Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                            {document.approvers?.length === 0 ? (
                                <Typography color="text.secondary" textAlign="center">
                                    Belum ada approver
                                </Typography>
                            ) : (
                                document.approvers?.map((approver, index) => (
                                    <Card key={approver.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                <Box>
                                                    <Typography fontWeight="bold">{approver.full_name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {approver.role?.role_name} • Level {index + 1}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    icon={getStatusIcon(approver.status)}
                                                    label={approver.status === 'APPROVED' ? 'Disetujui' : approver.status === 'REJECTED' ? 'Ditolak' : 'Pending'}
                                                    color={getStatusColor(approver.status) as any}
                                                    size="small"
                                                />
                                            </Box>

                                            {approver.viewed_at && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    📖 Dilihat: {formatDate(approver.viewed_at)}
                                                </Typography>
                                            )}

                                            {approver.approved_at && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    ✅ Diproses: {formatDate(approver.approved_at)}
                                                </Typography>
                                            )}

                                            {approver.remarks && (
                                                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, borderLeft: '3px solid #1976d2' }}>
                                                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                                        💬 Catatan Review:
                                                    </Typography>
                                                    <Typography variant="body2" fontStyle="italic">
                                                        "{approver.remarks}"
                                                    </Typography>
                                                </Box>
                                            )}

                                            {!approver.remarks && approver.status === 'PENDING' && (
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                                    Menunggu review...
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}
