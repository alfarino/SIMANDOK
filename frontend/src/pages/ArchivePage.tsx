import { useState, useEffect } from 'react'
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button, IconButton,
    CircularProgress, Alert, Tooltip, Dialog, DialogTitle, DialogContent,
    DialogActions, List, ListItem, ListItemText, Divider
} from '@mui/material'
import { Restore, OpenInNew, History, Refresh } from '@mui/icons-material'

interface ArchivedDocument {
    id: number
    document_name: string
    document_description: string
    document_link: string
    approval_status: string
    archived_at: string
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
    ARCHIVED: 'Diarsipkan',
    RESTORED: 'Dipulihkan'
}

export default function ArchivePage() {
    const [documents, setDocuments] = useState<ArchivedDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
    const [selectedDocHistory, setSelectedDocHistory] = useState<HistoryItem[]>([])
    const [selectedDocName, setSelectedDocName] = useState('')
    const [restoring, setRestoring] = useState<number | null>(null)

    useEffect(() => {
        fetchArchive()
    }, [])

    const fetchArchive = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/archive', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Failed to fetch archive')

            const data = await res.json()
            setDocuments(data.data || [])
        } catch (err) {
            setError('Gagal memuat arsip dokumen')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleRestore = async (docId: number) => {
        setRestoring(docId)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/archive/${docId}/restore`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Failed to restore')

            setSuccess('Dokumen berhasil dipulihkan dari arsip')
            fetchArchive()
        } catch (err) {
            setError('Gagal memulihkan dokumen')
        } finally {
            setRestoring(null)
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
                    Arsip Dokumen
                </Typography>
                <Button variant="outlined" startIcon={<Refresh />} onClick={fetchArchive}>
                    Refresh
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

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
                        {documents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        📦 Tidak ada dokumen dalam arsip
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            documents.map((doc, index) => (
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
                                    <TableCell>
                                        <Chip
                                            label={doc.approval_status === 'SIAP_CETAK' ? 'Selesai' : 'Ditolak'}
                                            color={doc.approval_status === 'SIAP_CETAK' ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{formatDate(doc.archived_at)}</TableCell>
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
                                                    disabled={restoring === doc.id}
                                                >
                                                    {restoring === doc.id ? <CircularProgress size={18} /> : <Restore />}
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
