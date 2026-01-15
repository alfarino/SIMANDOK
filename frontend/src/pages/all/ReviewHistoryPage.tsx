import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Button, CircularProgress, Alert,
    Card, CardContent, Grid, Chip, TextField
} from '@mui/material'
import {
    ArrowBack, OpenInNew, CheckCircle, Cancel, AccessTime,
    Person, CalendarToday, Replay, Description, Send
} from '@mui/icons-material'

interface HistoryItem {
    id: number
    action_type: string
    from_status: string | null
    to_status: string | null
    remarks: string | null
    created_at: string
    actionBy: { id: number; full_name: string; email: string }
}

interface Document {
    id: number
    document_name: string
    document_description: string
    document_link: string
    approval_status: string
    rejection_reason: string | null
    created_at: string
    uploaded_by_user_id: number
    uploadedBy: { full_name: string; email: string }
}

const STATUS_LABELS: Record<string, string> = {
    DRAFT: 'Draft',
    DIAJUKAN: 'Diajukan',
    DIBUKA: 'Dibuka',
    DIPERIKSA: 'Diperiksa',
    DISETUJUI: 'Disetujui',
    DITOLAK: 'Ditolak',
    SIAP_CETAK: 'Siap Cetak',
    SUDAH_DICETAK: 'Sudah Dicetak'
}

const ACTION_LABELS: Record<string, string> = {
    CREATED: 'Dibuat',
    SUBMITTED: 'Diajukan',
    OPENED: 'Dibuka',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
    REVISED: 'Direvisi',
    RESUBMITTED: 'Diajukan Ulang',
    PRINTED: 'Dicetak',
    ARCHIVED: 'Diarsipkan',
    RESTORED: 'Dipulihkan'
}

const getActionIcon = (actionType: string) => {
    switch (actionType) {
        case 'CREATED': return <Description color="primary" />
        case 'SUBMITTED': return <Send color="info" />
        case 'OPENED': return <AccessTime color="warning" />
        case 'APPROVED': return <CheckCircle color="success" />
        case 'REJECTED': return <Cancel color="error" />
        case 'RESUBMITTED': return <Replay color="primary" />
        default: return <AccessTime color="action" />
    }
}

const getActionColor = (actionType: string): 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' => {
    switch (actionType) {
        case 'APPROVED': return 'success'
        case 'REJECTED': return 'error'
        case 'SUBMITTED': case 'RESUBMITTED': return 'info'
        case 'OPENED': return 'warning'
        default: return 'default'
    }
}

export default function ReviewHistoryPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [document, setDocument] = useState<Document | null>(null)
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [resubmitRemarks, setResubmitRemarks] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Get current user
    const userStr = localStorage.getItem('user')
    const currentUser = userStr ? JSON.parse(userStr) : null
    const isUploader = currentUser?.id === document?.uploaded_by_user_id
    const isRejected = document?.approval_status === 'DITOLAK'

    useEffect(() => {
        fetchData()
    }, [id])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')

            // Fetch document and history in parallel
            const [docRes, historyRes] = await Promise.all([
                fetch(`/api/documents/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`/api/documents/${id}/history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ])

            if (!docRes.ok) throw new Error('Failed to fetch document')

            const docData = await docRes.json()
            setDocument(docData.data)

            if (historyRes.ok) {
                const historyData = await historyRes.json()
                setHistory(historyData.data || [])
            }
        } catch (err) {
            setError('Gagal memuat dokumen')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleResubmit = async () => {
        if (!resubmitRemarks.trim()) {
            setError('Catatan perubahan wajib diisi')
            return
        }

        setSubmitting(true)
        setError('')
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/documents/${id}/resubmit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ remarks: resubmitRemarks })
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || 'Gagal mengajukan ulang')
            }

            setSuccess('Dokumen berhasil diajukan ulang!')
            setResubmitRemarks('')
            fetchData()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
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
                        Lihat perjalanan dan catatan review dokumen
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

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Grid container spacing={3}>
                {/* Left - Document Info with Status */}
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
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Status</Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip
                                        label={STATUS_LABELS[document.approval_status] || document.approval_status}
                                        color={document.approval_status === 'DITOLAK' ? 'error' :
                                            document.approval_status === 'SIAP_CETAK' ? 'success' : 'primary'}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                            {/* Rejection Reason inside Info Box */}
                            {document.rejection_reason && (
                                <Box sx={{ mb: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 1, borderLeft: '3px solid #ed6c02' }}>
                                    <Typography variant="caption" color="warning.dark" fontWeight="bold" display="block" gutterBottom>
                                        ⚠️ Alasan Penolakan
                                    </Typography>
                                    <Typography variant="body2">{document.rejection_reason}</Typography>
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

                    {/* Resubmit Box - Show only for uploader when rejected */}
                    {isUploader && isRejected && (
                        <Paper sx={{ bgcolor: '#e3f2fd' }}>
                            <Box sx={{ p: 3 }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    🔄 Ajukan Ulang Dokumen
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Dokumen Anda ditolak. Silakan perbaiki dan ajukan ulang.
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Catatan Perubahan"
                                    placeholder="Jelaskan perubahan yang telah Anda lakukan..."
                                    value={resubmitRemarks}
                                    onChange={(e) => setResubmitRemarks(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Replay />}
                                    onClick={handleResubmit}
                                    disabled={submitting}
                                >
                                    Ajukan Ulang
                                </Button>
                            </Box>
                        </Paper>
                    )}
                </Grid>

                {/* Right - Approval History Timeline */}
                <Grid item xs={12} md={7}>
                    <Paper>
                        <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 3, py: 2 }}>
                            <Typography variant="h6">Perjalanan Dokumen</Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                            {history.length === 0 ? (
                                <Typography color="text.secondary" textAlign="center">
                                    Belum ada riwayat
                                </Typography>
                            ) : (
                                history.map((item, index) => (
                                    <Card key={item.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getActionIcon(item.action_type)}
                                                    <Box>
                                                        <Typography fontWeight="bold">
                                                            {ACTION_LABELS[item.action_type] || item.action_type}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            oleh {item.actionBy?.full_name || 'Unknown'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Chip
                                                    label={`#${index + 1}`}
                                                    color={getActionColor(item.action_type)}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>

                                            <Typography variant="caption" color="text.secondary" display="block">
                                                📅 {formatDate(item.created_at)}
                                            </Typography>

                                            {item.from_status && item.to_status && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Status: {STATUS_LABELS[item.from_status] || item.from_status} → {STATUS_LABELS[item.to_status] || item.to_status}
                                                </Typography>
                                            )}

                                            {item.remarks && (
                                                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, borderLeft: '3px solid #1976d2' }}>
                                                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                                        💬 Catatan:
                                                    </Typography>
                                                    <Typography variant="body2" fontStyle="italic">
                                                        "{item.remarks}"
                                                    </Typography>
                                                </Box>
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
