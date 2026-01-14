import { useState, useEffect } from 'react'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button, IconButton,
    CircularProgress, Alert, Tooltip, Dialog, DialogTitle, DialogContent,
    DialogActions, List, ListItem, ListItemText, Divider, Tabs, Tab
} from '@mui/material'
import { Restore, OpenInNew, History, Refresh, Print, CheckCircle } from '@mui/icons-material'
import { useAppSelector } from '../store/hooks'

interface Document {
    id: number
    document_name: string
    document_description: string
    document_link: string
    approval_status: string
    archived_at?: string
    printed_at?: string
    created_at: string
    uploadedBy: { id: number; full_name: string }
}

interface HistoryItem {
    id: number
    action_type: string
    from_status: string
    to_status: string
    remarks: string
    created_at: string
    actionBy: { full_name: string }
}

const ACTION_LABELS: Record<string, string> = {
    CREATED: 'Dibuat',
    SUBMITTED: 'Diajukan',
    OPENED: 'Dibuka',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
    REVISED: 'Direvisi',
    PRINTED: 'Dicetak',
    ARCHIVED: 'Diarsipkan',
    RESTORED: 'Dipulihkan'
}

export default function ArchivePage() {
    const user = useAppSelector((state) => state.auth.user)
    const isStaff = user?.role?.hierarchyLevel === 1

    const [activeTab, setActiveTab] = useState(isStaff ? 0 : 1) // Staff defaults to "Siap Cetak", others to "Arsip"
    const [readyToPrint, setReadyToPrint] = useState<Document[]>([])
    const [archivedDocs, setArchivedDocs] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
    const [selectedDocHistory, setSelectedDocHistory] = useState<HistoryItem[]>([])
    const [selectedDocName, setSelectedDocName] = useState('')
    const [processingId, setProcessingId] = useState<number | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')

            // Fetch archived docs
            const archiveRes = await fetch('/api/archive', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (archiveRes.ok) {
                const archiveData = await archiveRes.json()
                setArchivedDocs(archiveData.data || [])
            }

            // Fetch ready to print (Staff only)
            if (isStaff) {
                const readyRes = await fetch('/api/documents/ready-to-print', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (readyRes.ok) {
                    const readyData = await readyRes.json()
                    setReadyToPrint(readyData.data || [])
                }
            }
        } catch (err) {
            setError('Gagal memuat data')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAsPrinted = async (docId: number) => {
        if (!confirm('Tandai dokumen ini sudah dicetak?')) return
        setProcessingId(docId)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/documents/${docId}/printed`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Failed to mark as printed')

            setSuccess('Dokumen berhasil ditandai sudah dicetak')
            fetchData()
        } catch (err) {
            setError('Gagal menandai dokumen')
        } finally {
            setProcessingId(null)
        }
    }

    const handleRestore = async (docId: number) => {
        setProcessingId(docId)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/archive/${docId}/restore`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Failed to restore')

            setSuccess('Dokumen berhasil dipulihkan dari arsip')
            fetchData()
        } catch (err) {
            setError('Gagal memulihkan dokumen')
        } finally {
            setProcessingId(null)
        }
    }

    const handleViewHistory = async (docId: number, docName: string) => {
        setSelectedDocName(docName)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/archive/${docId}/audit`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Failed to fetch history')

            const data = await res.json()
            setSelectedDocHistory(data.data || [])
            setHistoryDialogOpen(true)
        } catch (err) {
            setError('Gagal memuat riwayat')
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
                    {isStaff ? 'Dokumen Saya' : 'Arsip Dokumen'}
                </Typography>
                <Button variant="outlined" startIcon={<Refresh />} onClick={fetchData}>
                    Refresh
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {/* Tabs - Only show if Staff (has Siap Cetak tab) */}
            {isStaff && (
                <Paper sx={{ mb: 2 }}>
                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Print fontSize="small" />
                                    Siap Cetak ({readyToPrint.filter(d => d.approval_status === 'SIAP_CETAK').length})
                                </Box>
                            }
                        />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircle fontSize="small" />
                                    Sudah Dicetak ({readyToPrint.filter(d => d.approval_status === 'SUDAH_DICETAK').length})
                                </Box>
                            }
                        />
                        <Tab label={`Arsip (${archivedDocs.length})`} />
                    </Tabs>
                </Paper>
            )}

            {/* Tab 0: Siap Cetak (Staff only) */}
            {isStaff && activeTab === 0 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
                                <TableCell width={50}><strong>No</strong></TableCell>
                                <TableCell><strong>Judul</strong></TableCell>
                                <TableCell><strong>Tanggal</strong></TableCell>
                                <TableCell width={200}><strong>Aksi</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {readyToPrint.filter(d => d.approval_status === 'SIAP_CETAK').length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            🎉 Tidak ada dokumen yang siap dicetak
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                readyToPrint.filter(d => d.approval_status === 'SIAP_CETAK').map((doc, index) => (
                                    <TableRow key={doc.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Typography fontWeight="medium">{doc.document_name}</Typography>
                                        </TableCell>
                                        <TableCell>{formatDate(doc.created_at)}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<OpenInNew />}
                                                    href={doc.document_link}
                                                    target="_blank"
                                                >
                                                    Buka
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={processingId === doc.id ? <CircularProgress size={16} /> : <CheckCircle />}
                                                    onClick={() => handleMarkAsPrinted(doc.id)}
                                                    disabled={processingId === doc.id}
                                                >
                                                    Sudah Dicetak
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

            {/* Tab 1: Sudah Dicetak (Staff only) */}
            {isStaff && activeTab === 1 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                                <TableCell width={50}><strong>No</strong></TableCell>
                                <TableCell><strong>Judul</strong></TableCell>
                                <TableCell><strong>Tanggal Cetak</strong></TableCell>
                                <TableCell width={100}><strong>Aksi</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {readyToPrint.filter(d => d.approval_status === 'SUDAH_DICETAK').length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            📄 Belum ada dokumen yang sudah dicetak
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                readyToPrint.filter(d => d.approval_status === 'SUDAH_DICETAK').map((doc, index) => (
                                    <TableRow key={doc.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Typography fontWeight="medium">{doc.document_name}</Typography>
                                        </TableCell>
                                        <TableCell>{doc.printed_at ? formatDate(doc.printed_at) : '-'}</TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="primary" href={doc.document_link} target="_blank">
                                                <OpenInNew />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Tab 2: Arsip (or default for non-Staff) */}
            {((!isStaff) || (isStaff && activeTab === 2)) && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell width={50}><strong>No</strong></TableCell>
                                <TableCell><strong>Judul</strong></TableCell>
                                <TableCell><strong>Dibuat Oleh</strong></TableCell>
                                <TableCell><strong>Status Akhir</strong></TableCell>
                                <TableCell><strong>Tanggal Arsip</strong></TableCell>
                                <TableCell width={150}><strong>Aksi</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {archivedDocs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            📦 Tidak ada dokumen dalam arsip
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                archivedDocs.map((doc, index) => (
                                    <TableRow key={doc.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Typography fontWeight="medium">{doc.document_name}</Typography>
                                        </TableCell>
                                        <TableCell>{doc.uploadedBy?.full_name || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={doc.approval_status === 'SIAP_CETAK' ? 'Selesai' : doc.approval_status === 'SUDAH_DICETAK' ? 'Dicetak' : 'Ditolak'}
                                                color={doc.approval_status === 'SIAP_CETAK' || doc.approval_status === 'SUDAH_DICETAK' ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{doc.archived_at ? formatDate(doc.archived_at) : '-'}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Tooltip title="Buka Dokumen">
                                                    <IconButton size="small" color="primary" href={doc.document_link} target="_blank">
                                                        <OpenInNew />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Lihat Riwayat">
                                                    <IconButton size="small" onClick={() => handleViewHistory(doc.id, doc.document_name)}>
                                                        <History />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Pulihkan">
                                                    <IconButton
                                                        size="small"
                                                        color="warning"
                                                        onClick={() => handleRestore(doc.id)}
                                                        disabled={processingId === doc.id}
                                                    >
                                                        {processingId === doc.id ? <CircularProgress size={18} /> : <Restore />}
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* History Dialog */}
            <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Riwayat: {selectedDocName}</DialogTitle>
                <DialogContent>
                    <List>
                        {selectedDocHistory.map((item, index) => (
                            <Box key={item.id}>
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Chip
                                                    label={ACTION_LABELS[item.action_type] || item.action_type}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(item.created_at)}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    Oleh: {item.actionBy?.full_name}
                                                </Typography>
                                                {item.remarks && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Catatan: {item.remarks}
                                                    </Typography>
                                                )}
                                            </>
                                        }
                                    />
                                </ListItem>
                                {index < selectedDocHistory.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHistoryDialogOpen(false)}>Tutup</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
