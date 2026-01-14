import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button, IconButton,
    TextField, InputAdornment, CircularProgress, Alert, Tooltip,
    Collapse, Card, CardContent
} from '@mui/material'
import {
    Search, Email, OpenInNew, Refresh, ExpandMore, ExpandLess, History,
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
    created_at: string
    uploadedBy: { id: number; full_name: string; email: string }
    currentApprover: { id: number; full_name: string; email: string } | null
}

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
    DRAFT: 'default',
    DIAJUKAN: 'warning',
    DIBUKA: 'info',
    DIPERIKSA: 'info',
    DISETUJUI: 'success',
    SIAP_CETAK: 'success',
    SUDAH_DICETAK: 'success',
    DITOLAK: 'error',
    ARCHIVED: 'default'
}

const STATUS_LABELS: Record<string, string> = {
    DRAFT: 'Draft',
    DIAJUKAN: 'Diajukan',
    DIBUKA: 'Dibuka',
    DIPERIKSA: 'Diperiksa',
    DISETUJUI: 'Disetujui',
    SIAP_CETAK: 'Siap Cetak',
    SUDAH_DICETAK: 'Sudah Dicetak',
    DITOLAK: 'Ditolak',
    ARCHIVED: 'Arsip'
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

type TabValue = 'all' | 'draft' | 'pending' | 'approved' | 'rejected'

export default function DocumentsPage() {
    const navigate = useNavigate()
    const [documents, setDocuments] = useState<Document[]>([])
    const [filteredDocs, setFilteredDocs] = useState<Document[]>([])
    const [historyCache, setHistoryCache] = useState<Record<number, HistoryItem[]>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [tab, setTab] = useState<TabValue>('all')
    const [search, setSearch] = useState('')
    const [sendingReminder, setSendingReminder] = useState(false)
    const [reminderSuccess, setReminderSuccess] = useState('')
    const [expandedRow, setExpandedRow] = useState<number | null>(null)
    const [loadingHistory, setLoadingHistory] = useState<number | null>(null)

    useEffect(() => {
        fetchDocuments()
    }, [])

    useEffect(() => {
        filterDocuments()
    }, [documents, tab, search])

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/documents', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Failed to fetch documents')

            const data = await res.json()
            setDocuments(data.data || [])
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

    const toggleExpand = async (docId: number) => {
        if (expandedRow === docId) {
            setExpandedRow(null)
        } else {
            setExpandedRow(docId)
            await fetchHistory(docId)
        }
    }

    const filterDocuments = () => {
        let filtered = [...documents]

        // Filter by tab
        switch (tab) {
            case 'draft':
                filtered = filtered.filter(d => d.approval_status === 'DRAFT')
                break
            case 'pending':
                filtered = filtered.filter(d => ['DIAJUKAN', 'DIBUKA', 'DIPERIKSA'].includes(d.approval_status))
                break
            case 'approved':
                filtered = filtered.filter(d => ['SIAP_CETAK', 'SUDAH_DICETAK'].includes(d.approval_status))
                break
            case 'rejected':
                filtered = filtered.filter(d => d.approval_status === 'DITOLAK')
                break
        }

        // Filter by search
        if (search) {
            const s = search.toLowerCase()
            filtered = filtered.filter(d =>
                d.document_name.toLowerCase().includes(s) ||
                d.document_description?.toLowerCase().includes(s) ||
                d.uploadedBy?.full_name.toLowerCase().includes(s)
            )
        }

        setFilteredDocs(filtered)
    }

    const handleSendReminder = async () => {
        setSendingReminder(true)
        setReminderSuccess('')
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/reminders/send-batch', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Failed to send reminders')

            const data = await res.json()
            setReminderSuccess(`Email reminder terkirim ke ${data.data?.length || 0} approver`)
        } catch (err) {
            setError('Gagal mengirim email reminder')
        } finally {
            setSendingReminder(false)
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
                    Semua Dokumen
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchDocuments}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={sendingReminder ? <CircularProgress size={20} color="inherit" /> : <Email />}
                        onClick={handleSendReminder}
                        disabled={sendingReminder}
                    >
                        Kirim Reminder
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {reminderSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setReminderSuccess('')}>{reminderSuccess}</Alert>}

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label={`Semua (${documents.length})`} value="all" />
                    <Tab
                        label={`Draft (${documents.filter(d => d.approval_status === 'DRAFT').length})`}
                        value="draft"
                    />
                    <Tab
                        label={`Pending (${documents.filter(d => ['DIAJUKAN', 'DIBUKA', 'DIPERIKSA'].includes(d.approval_status)).length})`}
                        value="pending"
                    />
                    <Tab
                        label={`Selesai (${documents.filter(d => ['SIAP_CETAK', 'SUDAH_DICETAK'].includes(d.approval_status)).length})`}
                        value="approved"
                    />
                    <Tab
                        label={`Ditolak (${documents.filter(d => d.approval_status === 'DITOLAK').length})`}
                        value="rejected"
                    />
                </Tabs>
            </Paper>

            {/* Search */}
            <TextField
                fullWidth
                placeholder="Cari dokumen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    )
                }}
            />

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell width={50}><strong>No</strong></TableCell>
                            <TableCell><strong>Judul</strong></TableCell>
                            <TableCell><strong>Dibuat Oleh</strong></TableCell>
                            <TableCell><strong>Tanggal</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Sedang di</strong></TableCell>
                            <TableCell width={180}><strong>Aksi</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDocs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        Tidak ada dokumen ditemukan
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDocs.map((doc, index) => (
                                <>
                                    <TableRow key={doc.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Typography fontWeight="medium">{doc.document_name}</Typography>
                                            {doc.document_description && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    {doc.document_description.substring(0, 50)}
                                                    {doc.document_description.length > 50 ? '...' : ''}
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
                                            {doc.currentApprover ? (
                                                <Tooltip title={doc.currentApprover.email}>
                                                    <Chip
                                                        label={doc.currentApprover.full_name}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </Tooltip>
                                            ) : (
                                                <Typography variant="caption" color="text.secondary">-</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Tooltip title="Lihat Detail">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => toggleExpand(doc.id)}
                                                        color={expandedRow === doc.id ? 'primary' : 'default'}
                                                    >
                                                        {expandedRow === doc.id ? <ExpandLess /> : <ExpandMore />}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Buka Dokumen">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        href={doc.document_link}
                                                        target="_blank"
                                                    >
                                                        <OpenInNew />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Riwayat">
                                                    <IconButton
                                                        size="small"
                                                        color="default"
                                                        onClick={() => navigate(`/review-history/${doc.id}`)}
                                                    >
                                                        <History />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{ py: 0, borderBottom: expandedRow === doc.id ? undefined : 'none' }}>
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
                                                            {historyCache[doc.id]?.map((item) => (
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

            {/* Summary */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="body2" color="text.secondary">
                    Menampilkan {filteredDocs.length} dari {documents.length} dokumen
                </Typography>
            </Box>
        </Box>
    )
}
