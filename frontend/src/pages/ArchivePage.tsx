import { Box, Typography, Card, CardContent } from '@mui/material'

export default function ArchivePage() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Arsip Dokumen
            </Typography>

            <Card>
                <CardContent>
                    <Typography color="text.secondary">
                        Arsip dengan audit trail akan ditampilkan setelah Phase 4
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    )
}
