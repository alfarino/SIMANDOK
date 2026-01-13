import { useState } from 'react'
import {
    Box, Typography, Card, CardContent, TextField, Button,
    FormControl, InputLabel, Select, MenuItem, Chip, Alert
} from '@mui/material'
import { Send, Link as LinkIcon } from '@mui/icons-material'

export default function UploadPage() {
    const [documentName, setDocumentName] = useState('')
    const [documentLink, setDocumentLink] = useState('')
    const [description, setDescription] = useState('')
    const [selectedApprovers, setSelectedApprovers] = useState<number[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // TODO: Fetch from API in Phase 5
    const availableApprovers = [
        { id: 4, name: 'Frengki, ST., MM', role: 'Kepala Seksi', level: 2 },
        { id: 5, name: 'Roni Saputra, ST', role: 'Kepala Seksi', level: 2 },
        { id: 2, name: 'Arpentius, ST., MM', role: 'Kepala Subdit', level: 3 },
        { id: 3, name: 'Dr. Kiki Yulianto, STP, MP', role: 'Kepala Subdit', level: 3 },
        { id: 1, name: 'Dr. Eng Muhammad Makky, STP., M.Si', role: 'Direktur', level: 4 }
    ]

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
            // TODO: Implement API call in Phase 5
            console.log('Creating document:', {
                documentName,
                documentLink,
                description,
                approverIds: selectedApprovers
            })

            setSuccess('Dokumen berhasil dibuat!')
            // Reset form
            setDocumentName('')
            setDocumentLink('')
            setDescription('')
            setSelectedApprovers([])
        } catch (err) {
            setError('Gagal membuat dokumen')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Buat Dokumen Baru
            </Typography>

            <Card sx={{ maxWidth: 600 }}>
                <CardContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <TextField
                        fullWidth
                        label="Nama Dokumen"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                        sx={{ mb: 2 }}
                        placeholder="Contoh: MOU dengan PT ABC"
                    />

                    <TextField
                        fullWidth
                        label="Link Draft Dokumen"
                        value={documentLink}
                        onChange={(e) => setDocumentLink(e.target.value)}
                        sx={{ mb: 2 }}
                        placeholder="https://docs.google.com/document/d/..."
                        helperText="Paste link Google Docs, OneDrive, atau platform lainnya"
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
                        sx={{ mb: 2 }}
                        placeholder="Deskripsi singkat tentang dokumen"
                    />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Pilih Approver</InputLabel>
                        <Select
                            multiple
                            value={selectedApprovers}
                            onChange={(e) => setSelectedApprovers(e.target.value as number[])}
                            label="Pilih Approver"
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((id) => {
                                        const approver = availableApprovers.find(a => a.id === id)
                                        return <Chip key={id} label={approver?.name} size="small" />
                                    })}
                                </Box>
                            )}
                        >
                            {availableApprovers.map((approver) => (
                                <MenuItem key={approver.id} value={approver.id}>
                                    <Box>
                                        <Typography variant="body1">{approver.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {approver.role} (Level {approver.level})
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Alert severity="info" sx={{ mb: 2 }}>
                        Approver akan otomatis diurutkan berdasarkan hierarki (dari level terendah ke tertinggi)
                    </Alert>

                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={<Send />}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Dokumen'}
                    </Button>
                </CardContent>
            </Card>
        </Box>
    )
}
