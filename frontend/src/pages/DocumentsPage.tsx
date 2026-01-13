import { Box, Typography, Card, CardContent } from '@mui/material'

export default function DocumentsPage() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dokumen Saya
            </Typography>

            <Card>
                <CardContent>
                    <Typography color="text.secondary">
                        Daftar dokumen akan ditampilkan setelah Phase 2 selesai
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    )
}
