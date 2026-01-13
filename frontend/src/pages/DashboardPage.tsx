import { Box, Typography, Grid, Card, CardContent } from '@mui/material'
import { Description, Pending, CheckCircle, Cancel } from '@mui/icons-material'

const stats = [
    { label: 'Total Dokumen', value: 0, icon: <Description />, color: '#1976d2' },
    { label: 'Pending', value: 0, icon: <Pending />, color: '#ed6c02' },
    { label: 'Disetujui', value: 0, icon: <CheckCircle />, color: '#2e7d32' },
    { label: 'Ditolak', value: 0, icon: <Cancel />, color: '#d32f2f' }
]

export default function DashboardPage() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat) => (
                    <Grid item xs={12} sm={6} md={3} key={stat.label}>
                        <Card>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                                <Box>
                                    <Typography variant="h5">{stat.value}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {stat.label}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Dokumen Terbaru
                    </Typography>
                    <Typography color="text.secondary">
                        Data akan ditampilkan setelah Phase 2 selesai
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    )
}
