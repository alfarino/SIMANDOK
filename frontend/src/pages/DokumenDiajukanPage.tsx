import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button, IconButton,
    CircularProgress, Alert, Collapse, Stepper, Step, StepLabel
} from '@mui/material'
import {
    OpenInNew, History, ExpandMore, ExpandLess, Refresh,
    CheckCircle, Cancel, AccessTime, HourglassEmpty
} from '@mui/icons-material'

interface Approver {
    id: number
    approver_user_id: number
    sequence_order: number
    status: string
    viewed_at: string | null
    approved_at: string | null
    remarks: string | null
    approver: {
        full_name: string
        role: { role_name: string }
    }
}

interface Document {
    id: number
    document_name: string
    document_description: string
    document_link: string
    approval_status: string
    current_sequence: number
    total_approvers: number
    created_at: string
    currentApprover?: { full_name: string }
    approvers?: Approver[]
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

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    DRAFT: 'default',
    DIAJUKAN: 'info',
    DIBUKA: 'info',
    DIPERIKSA: 'warning',
    DISETUJUI: 'success',
    DITOLAK: 'error',
    SIAP_CETAK: 'success',
    SUDAH_DICETAK: 'success'
}

export default function DokumenDiajukanPage() {
    const navigate = useNavigate()
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedRow, setExpandedRow] = useState<number | null>(null)

    useEffect(() => {
        fetchDocuments()
    }, [])

    const fetchDocuments = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/documents/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Failed to fetch documents')

            const data = await res.json()
            // Filter to show only submitted documents (not DRAFT, not archived)
            const submitted = (data.data || []).filter((d: Document) =>
                d.approval_status !== 'DRAFT' && d.approval_status !== 'ARCHIVED'
            )
            setDocuments(submitted)
        } catch (err) {
            setError('Gagal memuat dokumen')
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

    const toggleExpand = (docId: number) => {
        setExpandedRow(expandedRow === docId ? null : docId)
    }

    const getStepStatus = (approver: Approver) => {
        if (approver.status === 'APPROVED') return 'completed'
        if (approver.status === 'REJECTED') return 'error'
        if (approver.viewed_at) return 'active'
        return 'pending'
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
                <Box>
                    <Typography variant="h4" fontWeight="bold">Dokumen Diajukan</Typography>
                    <Typography color="text.secondary">
                        Lacak status dokumen yang sudah Anda ajukan
                    </Typography>
                </Box>
                <Button variant="outlined" startIcon={<Refresh />} onClick={fetchDocuments}>
                    Refresh
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                            <TableCell width={50}><strong>No</strong></TableCell>
                            <TableCell><strong>Judul Dokumen</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Sedang di</strong></TableCell>
                            <TableCell><strong>Tanggal</strong></TableCell>
                            <TableCell width={180}><strong>Aksi</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {documents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        📄 Belum ada dokumen yang diajukan
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            documents.map((doc, index) => (
                                <>
                                    <TableRow key={doc.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Typography fontWeight="medium">{doc.document_name}</Typography>
                                            {doc.document_description && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {doc.document_description.substring(0, 50)}...
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={STATUS_LABELS[doc.approval_status] || doc.approval_status}
                                                color={STATUS_COLORS[doc.approval_status] || 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {doc.currentApprover?.full_name ||
                                                (doc.approval_status === 'SIAP_CETAK' ? 'Selesai' :
                                                    doc.approval_status === 'SUDAH_DICETAK' ? 'Dicetak' :
                                                        doc.approval_status === 'DITOLAK' ? 'Ditolak' : '-')}
                                        </TableCell>
                                        <TableCell>{formatDate(doc.created_at)}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => toggleExpand(doc.id)}
                                                    color={expandedRow === doc.id ? 'primary' : 'default'}
                                                >
                                                    {expandedRow === doc.id ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    href={doc.document_link}
                                                    target="_blank"
                                                >
                                                    <OpenInNew />
                                                </IconButton>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<History />}
                                                    onClick={() => navigate(`/review-history/${doc.id}`)}
                                                >
                                                    Riwayat
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ py: 0, borderBottom: expandedRow === doc.id ? undefined : 'none' }}>
                                            <Collapse in={expandedRow === doc.id} timeout="auto" unmountOnExit>
                                                <Box sx={{ py: 2, px: 3, bgcolor: '#fafafa' }}>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        📍 Perjalanan Dokumen
                                                    </Typography>
                                                    <Stepper alternativeLabel sx={{ mt: 2 }}>
                                                        {doc.approvers?.map((approver) => {
                                                            const stepStatus = getStepStatus(approver)
                                                            return (
                                                                <Step key={approver.id} completed={stepStatus === 'completed'}>
                                                                    <StepLabel
                                                                        error={stepStatus === 'error'}
                                                                        StepIconComponent={() => (
                                                                            stepStatus === 'completed' ? <CheckCircle color="success" /> :
                                                                                stepStatus === 'error' ? <Cancel color="error" /> :
                                                                                    stepStatus === 'active' ? <AccessTime color="warning" /> :
                                                                                        <HourglassEmpty color="disabled" />
                                                                        )}
                                                                    >
                                                                        <Typography variant="caption" display="block">
                                                                            {approver.approver?.role?.role_name}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {approver.approver?.full_name}
                                                                        </Typography>
                                                                    </StepLabel>
                                                                </Step>
                                                            )
                                                        })}
                                                    </Stepper>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}
