import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Typography, Card, CardContent, TextField, Button,
    FormControl, InputLabel, Select, MenuItem, Chip, Alert,
    CircularProgress
} from '@mui/material'
import { Send, Link as LinkIcon } from '@mui/icons-material'

interface Approver {
    id: number
    full_name: string
    role?: { role_name: string; hierarchy_level: number }
}

export default function UploadPage() {
    const navigate = useNavigate()
    const [documentName, setDocumentName] = useState('')
    const [documentLink, setDocumentLink] = useState('')
    const [description, setDescription] = useState('')
    const [selectedApprovers, setSelectedApprovers] = useState<number[]>([])
    const [availableApprovers, setAvailableApprovers] = useState<Approver[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loadingApprovers, setLoadingApprovers] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        fetchApprovers()
    }, [])

    const fetchApprovers = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/users/approvers', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Failed to fetch approvers')

            const data = await res.json()
            setAvailableApprovers(data.data || [])
        } catch (err) {
            console.error('Failed to fetch approvers:', err)
        } finally {
            setLoadingApprovers(false)
        }
    }

    const handleSubmit = async () => {
        setError('')
        setSuccess('')

        if (!documentName.trim()) {
            setError('Nama dokumen wajib diisi')
            return
        }

        if (!documentLink.trim()) {
            setError('Link dokumen wajib diisi')
            return
        }

        // Validate URL format
        try {
            new URL(documentLink)
        } catch {
            setError('Format link tidak valid. Masukkan URL lengkap (contoh: https://docs.google.com/...)')
            return
        }

        if (selectedApprovers.length === 0) {
            setError('Pilih minimal 1 approver')
            return
        }

        setIsSubmitting(true)

        try {
            const token = localStorage.getItem('token')

            // Atomic Create & Submit
            const createRes = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    documentName,
                    documentDescription: description,
                    documentLink,
                    approverIds: selectedApprovers // Backend will handle sorting & submitting
                })
            })

            if (!createRes.ok) throw new Error('Failed to create document')

            setSuccess('Dokumen berhasil dibuat dan diajukan!')

            // Reset form after 2 seconds and redirect
            setTimeout(() => {
                navigate('/documents')
            }, 2000)

        } catch (err) {
            setError('Gagal membuat dokumen')
            console.error(err)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Buat Dokumen Baru
            </Typography>

            <Card sx={{ maxWidth: 700 }}>
                <CardContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <TextField
                        fullWidth
                        label="Nama Dokumen"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                        sx={{ mb: 3 }}
                        placeholder="Contoh: MOU dengan PT ABC"
                        required
                    />

                    <TextField
                        fullWidth
                        label="Link Draft Dokumen"
                        value={documentLink}
                        onChange={(e) => setDocumentLink(e.target.value)}
                        sx={{ mb: 3 }}
                        placeholder="https://docs.google.com/document/d/..."
                        helperText="Paste link Google Docs, OneDrive, atau platform lainnya"
                        required
                        InputProps={{
                            startAdornment: <LinkIcon sx={{ mr: 1, color: 'action.active' }} />
                        }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Deskripsi (Opsional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        sx={{ mb: 3 }}
                        placeholder="Deskripsi singkat tentang dokumen"
                    />

                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Pilih Approver</InputLabel>
                        <Select
                            multiple
                            value={selectedApprovers}
                            onChange={(e) => setSelectedApprovers(e.target.value as number[])}
                            label="Pilih Approver"
                            disabled={loadingApprovers}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((id) => {
                                        const approver = availableApprovers.find(a => a.id === id)
                                        return <Chip key={id} label={approver?.full_name} size="small" color="primary" />
                                    })}
                                </Box>
                            )}
                        >
                            {loadingApprovers ? (
                                <MenuItem disabled>
                                    <CircularProgress size={20} sx={{ mr: 1 }} /> Memuat...
                                </MenuItem>
                            ) : (
                                availableApprovers.map((approver) => (
                                    <MenuItem key={approver.id} value={approver.id}>
                                        <Box>
                                            <Typography variant="body1">{approver.full_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {approver.role?.role_name} (Level {approver.role?.hierarchy_level})
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    <Alert severity="info" sx={{ mb: 3 }}>
                        <strong>Tips:</strong> Approver akan otomatis diurutkan berdasarkan hierarki (dari level terendah ke tertinggi).
                        Pilih semua approver yang perlu menyetujui dokumen ini.
                    </Alert>

                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        sx={{ py: 1.5 }}
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan & Ajukan'}
                    </Button>
                </CardContent>
            </Card>
        </Box>
    )
}
