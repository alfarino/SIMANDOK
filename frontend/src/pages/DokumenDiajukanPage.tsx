import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button, IconButton,
    CircularProgress, Alert, Collapse, Card, CardContent
} from '@mui/material'
import {
    OpenInNew, History, ExpandMore, ExpandLess, Refresh,
    CheckCircle, Cancel, AccessTime, Description, Send, Replay
} from '@mui/icons-material'

interface HistoryItem {
    id: number
    action_type: string
    from_status: string | null
    to_status: string | null
    remarks: string | null
    created_at: string
    actionBy: { id: number; full_name: string }
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
        case 'CREATED': return <Description color="primary" fontSize="small" />
        case 'SUBMITTED': return <Send color="info" fontSize="small" />
        case 'OPENED': return <AccessTime color="warning" fontSize="small" />
        case 'APPROVED': return <CheckCircle color="success" fontSize="small" />
        case 'REJECTED': return <Cancel color="error" fontSize="small" />
        case 'RESUBMITTED': return <Replay color="primary" fontSize="small" />
        default: return <AccessTime color="action" fontSize="small" />
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

export default function DokumenDiajukanPage() {
    const navigate = useNavigate()
    const [documents, setDocuments] = useState<Document[]>([])
    const [historyCache, setHistoryCache] = useState<Record<number, HistoryItem[]>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedRow, setExpandedRow] = useState<number | null>(null)
    const [loadingHistory, setLoadingHistory] = useState<number | null>(null)

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

    const fetchHistory = async (docId: number) => {
        if (historyCache[docId]) return // Already cached

        setLoadingHistory(docId)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/documents/${docId}/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setHistoryCache(prev => ({ ...prev, [docId]: data.data || [] }))
            }
        } catch (err) {
            console.error('Failed to fetch history', err)
        } finally {
            setLoadingHistory(null)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const toggleExpand = async (docId: number) => {
        if (expandedRow === docId) {
            setExpandedRow(null)
        } else {
            setExpandedRow(docId)
            await fetchHistory(docId)
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

                                                    {loadingHistory === doc.id ? (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                                            <CircularProgress size={24} />
                                                        </Box>
                                                    ) : historyCache[doc.id]?.length === 0 ? (
                                                        <Typography color="text.secondary" variant="body2">
                                                            Belum ada riwayat
                                                        </Typography>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                                            {/* Current Position Card - Always at top */}
                                                            <Card variant="outlined" sx={{ bgcolor: '#e3f2fd', borderColor: 'primary.main' }}>
                                                                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <AccessTime color="primary" fontSize="small" />
                                                                        <Chip
                                                                            label="Posisi Saat Ini"
                                                                            color="primary"
                                                                            size="small"
                                                                        />
                                                                        <Typography variant="body2">
                                                                            {doc.approval_status === 'DITOLAK' ? (
                                                                                <>Menunggu revisi dari <strong>Anda (Staff)</strong></>
                                                                            ) : doc.approval_status === 'SIAP_CETAK' || doc.approval_status === 'SUDAH_DICETAK' ? (
                                                                                <>Dokumen <strong>Selesai</strong></>
                                                                            ) : doc.currentApprover?.full_name ? (
                                                                                <>Sedang di <strong>{doc.currentApprover.full_name}</strong></>
                                                                            ) : (
                                                                                <>Status: <strong>{STATUS_LABELS[doc.approval_status] || doc.approval_status}</strong></>
                                                                            )}
                                                                        </Typography>
                                                                    </Box>
                                                                </CardContent>
                                                            </Card>

                                                            {/* History Cards - Newest first */}
                                                            {[...historyCache[doc.id]].reverse().map((item) => (
                                                                <Card key={item.id} variant="outlined" sx={{ bgcolor: 'white' }}>
                                                                    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            {getActionIcon(item.action_type)}
                                                                            <Chip
                                                                                label={ACTION_LABELS[item.action_type] || item.action_type}
                                                                                color={getActionColor(item.action_type)}
                                                                                size="small"
                                                                                variant="outlined"
                                                                            />
                                                                            <Typography variant="body2">
                                                                                oleh <strong>{item.actionBy?.full_name || 'Unknown'}</strong>
                                                                            </Typography>
                                                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                                                                {formatDateTime(item.created_at)}
                                                                            </Typography>
                                                                        </Box>
                                                                        {item.remarks && (
                                                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5, display: 'block', mt: 0.5 }}>
                                                                                💬 {item.remarks}
                                                                            </Typography>
                                                                        )}
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </Box>
                                                    )}
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
