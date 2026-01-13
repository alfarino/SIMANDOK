import { Box, Typography, Container } from '@mui/material'

export default function LoginPage() {
    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    SIMANDOK
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Sistem Informasi Manajemen Dokumen
                </Typography>
                {/* TODO: Implement login form in Phase 5 */}
                <Box sx={{ mt: 4, p: 3, border: '1px dashed #ccc', borderRadius: 2 }}>
                    <Typography color="text.secondary">
                        Login form will be implemented in Phase 5
                    </Typography>
                </Box>
            </Box>
        </Container>
    )
}
