import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Button, CircularProgress, Alert,
    TextField, Divider, Grid
} from '@mui/material'
import {
    ArrowBack, OpenInNew, CheckCircle, Cancel, AccessTime,
    Person, CalendarToday
} from '@mui/icons-material'

interface Approver {
    id: number
    full_name: string
    role: { role_name: string; hierarchy_level: number }
    approval_status: string
    approved_at: string | null
    remarks: string | null
}

interface Document {
    id: number
    document_name: string
    document_description: string
    document_link: string
    approval_status: string
    created_at: string
    uploadedBy: { full_name: string; email: string }
    approvers: Approver[]
}

export default function DocumentReviewPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [document, setDocument] = useState<Document | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [notes, setNotes] = useState('')
    const [actionLoading, setActionLoading] = useState(false)

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

    const handleOpenDocument = async () => {
        // Mark as viewed when user clicks "Buka Dokumen"
        try {
            const token = localStorage.getItem('token')
            await fetch(`/api/documents/${id}/view`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
        } catch (err) {
            console.error('Failed to mark as viewed:', err)
        }
        // Open document in new tab
        if (document?.document_link) {
            window.open(document.document_link, '_blank')
        }
    }

    const handleApprove = async () => {
        if (!confirm('Apakah Anda yakin ingin menyetujui dokumen ini?')) return

        setActionLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/approvals/${id}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ remarks: notes || 'Disetujui' })
            })

            if (!res.ok) throw new Error('Gagal menyetujui')

            setSuccess('Dokumen berhasil disetujui!')
            setTimeout(() => navigate('/my-documents'), 1500)
        } catch (err) {
            setError('Gagal menyetujui dokumen')
        } finally {
            setActionLoading(false)
        }
    }

    const handleReject = async () => {
        if (!notes.trim()) {
            setError('Harap tambahkan instruksi revisi untuk staff')
            return
        }

        if (!confirm('Dokumen akan dikembalikan ke staff untuk revisi. Lanjutkan?')) return

        setActionLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/approvals/${id}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: notes })
            })

            if (!res.ok) throw new Error('Gagal menolak')

            setSuccess('Instruksi revisi berhasil dikirim ke staff')
            setTimeout(() => navigate('/my-documents'), 1500)
        } catch (err) {
            setError('Gagal mengirim instruksi revisi')
        } finally {
            setActionLoading(false)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getApproverStatus = (approver: Approver) => {
        if (approver.approval_status === 'APPROVED') {
            return { icon: <CheckCircle color="success" />, text: 'Disetujui', color: 'success' }
        }
        if (approver.approval_status === 'PENDING') {
            return { icon: <AccessTime color="warning" />, text: 'Menunggu', color: 'warning' }
        }
        return { icon: <Cancel color="error" />, text: 'Ditolak', color: 'error' }
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
                <Button onClick={() => navigate('/my-documents')} sx={{ mt: 2 }}>
                    Kembali
                </Button>
            </Box>
        )
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Review Dokumen</Typography>
                    <Typography color="text.secondary">
                        Tinjau dan berikan keputusan pada dokumen ini
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/my-documents')}
                >
                    Kembali
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Grid container spacing={3}>
                {/* Left - Document Info */}
                <Grid item xs={12} md={8}>
                    {/* Document Info Card */}
                    <Paper sx={{ mb: 3 }}>
                        <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 3, py: 2 }}>
                            <Typography variant="h6">Informasi Dokumen</Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Judul Dokumen</Typography>
                                <Typography variant="h6">{document.document_name}</Typography>
                            </Box>
                            {document.document_description && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Deskripsi</Typography>
                                    <Typography>{document.document_description}</Typography>
                                </Box>
                            )}
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Person color="action" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Dibuat Oleh</Typography>
                                            <Typography>{document.uploadedBy?.full_name}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarToday color="action" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Tanggal Pengajuan</Typography>
                                            <Typography>{formatDate(document.created_at)}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>

                    {/* Document Link Card */}
                    <Paper>
                        <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 3, py: 2 }}>
                            <Typography variant="h6">Akses Dokumen</Typography>
                        </Box>
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <OpenInNew sx={{ fontSize: 48, color: 'action.active', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>{document.document_name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Klik tombol di bawah untuk membuka dokumen di Google Docs/OneDrive
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<OpenInNew />}
                                onClick={handleOpenDocument}
                            >
                                Buka Dokumen
                            </Button>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                                ℹ️ Anda dapat memberikan komentar langsung di dokumen
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right - Workflow & Actions */}
                <Grid item xs={12} md={4}>
                    {/* Workflow Progress */}
                    <Paper sx={{ mb: 3 }}>
                        <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 3, py: 2 }}>
                            <Typography variant="h6">Status Progress</Typography>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            {document.approvers?.map((approver) => {
                                const status = getApproverStatus(approver)
                                return (
                                    <Box key={approver.id} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ mr: 2 }}>{status.icon}</Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography fontWeight="medium">{approver.full_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {approver.role?.role_name}
                                            </Typography>
                                            <Typography variant="caption" display="block" color={`${status.color}.main`}>
                                                {status.text}
                                                {approver.approved_at && ` - ${formatDate(approver.approved_at)}`}
                                            </Typography>
                                            {approver.remarks && (
                                                <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                                    "{approver.remarks}"
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                )
                            })}
                        </Box>
                    </Paper>

                    {/* Action Buttons */}
                    <Paper>
                        <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 3, py: 2 }}>
                            <Typography variant="h6">Tindakan</Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Catatan"
                                placeholder="Tambahkan catatan atau instruksi revisi..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                helperText="Opsional untuk setujui, wajib untuk revisi"
                                sx={{ mb: 2 }}
                            />
                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                                onClick={handleApprove}
                                disabled={actionLoading}
                                sx={{ mb: 1 }}
                            >
                                Setujui Dokumen
                            </Button>
                            <Button
                                fullWidth
                                variant="contained"
                                color="warning"
                                startIcon={<Cancel />}
                                onClick={handleReject}
                                disabled={actionLoading}
                            >
                                Minta Revisi
                            </Button>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                                ℹ️ Setujui: Dokumen lanjut ke tahap berikutnya<br />
                                Minta Revisi: Staff akan merevisi sesuai catatan
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}
