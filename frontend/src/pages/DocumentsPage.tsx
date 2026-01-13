import { useState, useEffect } from 'react'
import {
    Box, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button, IconButton,
    TextField, InputAdornment, CircularProgress, Alert, Tooltip
} from '@mui/material'
import {
    Search, Email, OpenInNew, Refresh
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

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
    DRAFT: 'default',
    DIAJUKAN: 'warning',
    DIBUKA: 'info',
    DIPERIKSA: 'info',
    DISETUJUI: 'success',
    SIAP_CETAK: 'success',
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
    DITOLAK: 'Ditolak',
    ARCHIVED: 'Arsip'
}

type TabValue = 'all' | 'draft' | 'pending' | 'approved' | 'rejected'

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([])
    const [filteredDocs, setFilteredDocs] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [tab, setTab] = useState<TabValue>('all')
    const [search, setSearch] = useState('')
    const [sendingReminder, setSendingReminder] = useState(false)
    const [reminderSuccess, setReminderSuccess] = useState('')

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
                filtered = filtered.filter(d => d.approval_status === 'SIAP_CETAK')
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
                        label={`Selesai (${documents.filter(d => d.approval_status === 'SIAP_CETAK').length})`}
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
                            <TableCell width={80}><strong>Aksi</strong></TableCell>
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
                                    </TableCell>
                                </TableRow>
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
