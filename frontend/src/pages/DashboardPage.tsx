import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Grid, Card, CardContent, Paper, CircularProgress, Alert, IconButton } from '@mui/material';
import { Description, Pending, CheckCircle, Fullscreen, FullscreenExit, ErrorOutline } from '@mui/icons-material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface GlobalStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

interface WorkflowItem {
    hierarchyLevel: number;
    roleName: string;
    pendingCount: number;
}

interface StatusItem {
    status: string;
    label: string;
    count: number;
    hierarchyLevel?: number;
}

// Palette Warna SIMANDOK
const PRIMARY_COLOR = '#00341f'; // Hijau tua utama
const ACCENT_COLOR = '#f0d323'; // Kuning aksen utama
const APPROVED_COLOR = '#296374'; // Teal untuk disetujui
const REJECTED_COLOR = '#D97706'; // Oranye tua untuk perlu revisi

// Warna untuk workflow berdasarkan level hierarki
const WORKFLOW_COLORS = [
    '#0C2C55', // Kepala Seksi - Biru tua
    '#296374', // Kepala Subdit - Teal
    '#629FAD', // Direktur - Biru muda
];

// Font size constants untuk fullscreen vs normal mode
const FONT_SIZES = {
    statsValue: { fullscreen: '2rem', normal: '3rem' },
    statsLabel: { fullscreen: '0.7rem', normal: '0.875rem' },
    statsCaption: { fullscreen: '0.65rem', normal: '0.75rem' },
    icon: { fullscreen: 32, normal: 48 },
};

// Helper function untuk mendapatkan warna berdasarkan hierarchy level
const getWorkflowColorByLevel = (hierarchyLevel: number): string => {
    const colorMap: Record<number, string> = {
        1: WORKFLOW_COLORS[0], // Kasi - Biru tua
        2: WORKFLOW_COLORS[1], // Kasubdit - Teal
        3: WORKFLOW_COLORS[2], // Direktur - Biru muda
    };
    return colorMap[hierarchyLevel] || '#6C757D';
};

// Color mapping untuk status chart - disesuaikan dengan DocumentsPage
const getStatusColor = (status: string, hierarchyLevel?: number): string => {
    // Warna untuk status in-review berdasarkan hierarchy level
    if (status.startsWith('IN_REVIEW_LEVEL_')) {
        return hierarchyLevel ? getWorkflowColorByLevel(hierarchyLevel) : '#6C757D';
    }

    // Warna untuk status lainnya - mengikuti standar DocumentsPage
    const colorMap: Record<string, string> = {
        // success (hijau) - sama dengan Chip color="success"
        APPROVED: '#2e7d32',
        DISETUJUI: '#2e7d32',
        SIAP_CETAK: '#2e7d32',

        // error (merah) - sama dengan Chip color="error"
        REJECTED: '#d32f2f',
        DITOLAK: '#d32f2f',

        // info (biru) - sama dengan Chip color="info"
        DIBUKA: '#0288d1',
        DIPERIKSA: '#0288d1',

        // warning (oranye) - sama dengan Chip color="warning"
        DIAJUKAN: '#ed6c02',

        // default (abu-abu) - sama dengan Chip color="default"
        DRAFT: '#616161',
        ARCHIVED: '#616161',
    };

    return colorMap[status] || '#6C757D';
};

export default function DashboardPage() {
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [workflowData, setWorkflowData] = useState<WorkflowItem[]>([]);
    const [statusData, setStatusData] = useState<StatusItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchDashboardData();

        // Listen for fullscreen change
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [globalRes, workflowRes, statusRes] = await Promise.all([
                fetch('/api/dashboard/global-stats', { headers }),
                fetch('/api/dashboard/workflow-distribution', { headers }),
                fetch('/api/dashboard/status-distribution', { headers }),
            ]);

            if (!globalRes.ok || !workflowRes.ok || !statusRes.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const [globalData, workflowDataRes, statusDataRes] = await Promise.all([globalRes.json(), workflowRes.json(), statusRes.json()]);

            setGlobalStats(globalData.data);
            setWorkflowData(workflowDataRes.data);
            setStatusData(statusDataRes.data);
        } catch (err) {
            setError('Gagal memuat data dashboard');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress sx={{ color: PRIMARY_COLOR }} />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    // Prepare chart data
    const workflowChartData = {
        labels: workflowData.map((item) => item.roleName),
        datasets: [
            {
                label: 'Dokumen Sedang Direview',
                data: workflowData.map((item) => item.pendingCount),
                backgroundColor: workflowData.map((item) => getWorkflowColorByLevel(item.hierarchyLevel)),
                borderColor: workflowData.map((item) => getWorkflowColorByLevel(item.hierarchyLevel)),
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const statusChartData = {
        labels: statusData.map((item) => item.label),
        datasets: [
            {
                data: statusData.map((item) => item.count),
                backgroundColor: statusData.map((item) => getStatusColor(item.status, item.hierarchyLevel)),
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 10,
            },
        ],
    };

    const workflowChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#262626',
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1, font: { size: 12 } },
                grid: { color: '#e5e7eb' },
            },
            x: {
                ticks: { font: { size: 11 } },
                grid: { display: false },
            },
        },
    };

    const statusChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 15,
                    font: { size: 12 },
                    usePointStyle: true,
                    pointStyle: 'circle' as const,
                },
            },
            tooltip: {
                backgroundColor: '#262626',
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function (context: any) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
        cutout: '65%',
    };

    return (
        <Box
            ref={containerRef}
            sx={{
                bgcolor: isFullscreen ? '#EDEDCE' : 'transparent',
                p: isFullscreen ? 2.5 : 0,
                height: isFullscreen ? '100vh' : 'auto',
                overflow: isFullscreen ? 'hidden' : 'visible',
                display: isFullscreen ? 'flex' : 'block',
                flexDirection: isFullscreen ? 'column' : undefined,
            }}>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: isFullscreen ? 1.5 : 3,
                    flexShrink: 0,
                }}>
                <Typography variant={isFullscreen ? 'h5' : 'h4'} fontWeight="bold" sx={{ color: '#1f2937' }}>
                    Dashboard Statistik Dokumen
                </Typography>
                <IconButton
                    onClick={toggleFullscreen}
                    sx={{
                        bgcolor: PRIMARY_COLOR,
                        color: 'white',
                        '&:hover': { bgcolor: '#004d2e' },
                        borderRadius: 2,
                        px: 2,
                    }}>
                    {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                    <Typography variant="body2" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                        {isFullscreen ? 'Keluar Fullscreen' : 'Mode Fullscreen'}
                    </Typography>
                </IconButton>
            </Box>

            {/* Stats Cards */}
            <Grid
                container
                spacing={isFullscreen ? 1.5 : 3}
                sx={{
                    mb: isFullscreen ? 1.5 : 4,
                    flexShrink: 0,
                    height: isFullscreen ? 'auto' : 'auto',
                }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        sx={{
                            bgcolor: PRIMARY_COLOR,
                            color: 'white',
                            height: '100%',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.05)' },
                        }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', p: isFullscreen ? 1.5 : 2 }}>
                            <Box>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5, fontSize: isFullscreen ? FONT_SIZES.statsLabel.fullscreen : FONT_SIZES.statsLabel.normal }}>
                                    Total Dokumen
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" sx={{ color: ACCENT_COLOR, fontSize: isFullscreen ? FONT_SIZES.statsValue.fullscreen : FONT_SIZES.statsValue.normal }}>
                                    {globalStats?.total || 0}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: isFullscreen ? FONT_SIZES.statsCaption.fullscreen : FONT_SIZES.statsCaption.normal }}>
                                    Dokumen diajukan
                                </Typography>
                            </Box>
                            <Description sx={{ fontSize: isFullscreen ? FONT_SIZES.icon.fullscreen : FONT_SIZES.icon.normal, opacity: 0.5 }} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        sx={{
                            bgcolor: ACCENT_COLOR,
                            height: '100%',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.05)' },
                        }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', p: isFullscreen ? 1.5 : 2 }}>
                            <Box>
                                <Typography variant="body2" sx={{ color: PRIMARY_COLOR, fontWeight: 600, mb: 0.5, fontSize: isFullscreen ? FONT_SIZES.statsLabel.fullscreen : FONT_SIZES.statsLabel.normal }}>
                                    Sedang Direview
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" sx={{ color: PRIMARY_COLOR, fontSize: isFullscreen ? FONT_SIZES.statsValue.fullscreen : FONT_SIZES.statsValue.normal }}>
                                    {globalStats?.pending || 0}
                                </Typography>
                                <Typography variant="caption" sx={{ color: PRIMARY_COLOR, opacity: 0.8, fontSize: isFullscreen ? FONT_SIZES.statsCaption.fullscreen : FONT_SIZES.statsCaption.normal }}>
                                    Dalam proses
                                </Typography>
                            </Box>
                            <Pending sx={{ fontSize: isFullscreen ? FONT_SIZES.icon.fullscreen : FONT_SIZES.icon.normal, opacity: 0.4, color: PRIMARY_COLOR }} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        sx={{
                            bgcolor: 'white',
                            border: `4px solid ${REJECTED_COLOR}`,
                            height: '100%',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.05)' },
                        }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', p: isFullscreen ? 1.5 : 2 }}>
                            <Box>
                                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 600, mb: 0.5, fontSize: isFullscreen ? FONT_SIZES.statsLabel.fullscreen : FONT_SIZES.statsLabel.normal }}>
                                    Perlu Revisi
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" sx={{ color: REJECTED_COLOR, fontSize: isFullscreen ? FONT_SIZES.statsValue.fullscreen : FONT_SIZES.statsValue.normal }}>
                                    {globalStats?.rejected || 0}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: isFullscreen ? FONT_SIZES.statsCaption.fullscreen : FONT_SIZES.statsCaption.normal }}>
                                    Harus diperbaiki
                                </Typography>
                            </Box>
                            <ErrorOutline sx={{ fontSize: isFullscreen ? FONT_SIZES.icon.fullscreen : FONT_SIZES.icon.normal, opacity: 0.5, color: REJECTED_COLOR }} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        sx={{
                            bgcolor: APPROVED_COLOR,
                            color: 'white',
                            height: '100%',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.05)' },
                        }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', p: isFullscreen ? 1.5 : 2 }}>
                            <Box>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, mb: 0.5, fontSize: isFullscreen ? FONT_SIZES.statsLabel.fullscreen : FONT_SIZES.statsLabel.normal }}>
                                    Disetujui
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" sx={{ fontSize: isFullscreen ? FONT_SIZES.statsValue.fullscreen : FONT_SIZES.statsValue.normal }}>
                                    {globalStats?.approved || 0}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: isFullscreen ? FONT_SIZES.statsCaption.fullscreen : FONT_SIZES.statsCaption.normal }}>
                                    Dokumen selesai
                                </Typography>
                            </Box>
                            <CheckCircle sx={{ fontSize: isFullscreen ? FONT_SIZES.icon.fullscreen : FONT_SIZES.icon.normal, opacity: 0.5 }} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid
                container
                spacing={isFullscreen ? 1.5 : 3}
                sx={{
                    flex: isFullscreen ? 1 : undefined,
                    minHeight: isFullscreen ? 0 : undefined,
                }}>
                <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                    <Paper
                        sx={{
                            p: isFullscreen ? 1.5 : 3,
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                        <Typography variant="h6" fontWeight="semibold" sx={{ color: '#1f2937', mb: isFullscreen ? 1 : 2, flexShrink: 0, fontSize: isFullscreen ? '1rem' : '1.25rem' }}>
                            Distribusi per Tahapan
                        </Typography>
                        <Box
                            sx={{
                                flex: 1,
                                minHeight: isFullscreen ? 0 : 300,
                                position: 'relative',
                            }}>
                            {workflowData.length > 0 ? (
                                <Bar data={workflowChartData} options={workflowChartOptions} />
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography color="text.secondary">🎉 Tidak ada dokumen dalam review</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                    <Paper
                        sx={{
                            p: isFullscreen ? 1.5 : 3,
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                        <Typography variant="h6" fontWeight="semibold" sx={{ color: '#1f2937', mb: isFullscreen ? 1 : 2, flexShrink: 0, fontSize: isFullscreen ? '1rem' : '1.25rem' }}>
                            Status & Distribusi Dokumen
                        </Typography>
                        <Box
                            sx={{
                                flex: 1,
                                minHeight: isFullscreen ? 0 : 300,
                                position: 'relative',
                            }}>
                            {statusData.length > 0 ? (
                                <Doughnut data={statusChartData} options={statusChartOptions} />
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography color="text.secondary">Tidak ada data status</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
