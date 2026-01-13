import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
    const navigate = useNavigate()

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh'
        }}>
            <Typography variant="h1" color="text.secondary">
                404
            </Typography>
            <Typography variant="h5" gutterBottom>
                Halaman tidak ditemukan
            </Typography>
            <Button variant="contained" onClick={() => navigate('/dashboard')}>
                Kembali ke Dashboard
            </Button>
        </Box>
    )
}
