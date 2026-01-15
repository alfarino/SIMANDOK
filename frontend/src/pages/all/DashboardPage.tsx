import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Grid, Card, CardContent, Paper, CircularProgress, Alert, IconButton } from '@mui/material';
import { Description, Pending, CheckCircle, Fullscreen, FullscreenExit, ErrorOutline } from '@mui/icons-material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, ChartDataLabels);

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

// Konstanta warna utama dashboard
const PRIMARY_COLOR = '#1B5E20';
const ACCENT_COLOR = '#FDD835';
const APPROVED_COLOR = '#2E7D32';
const REJECTED_COLOR = '#F57C00';

// Pemetaan warna chart berdasarkan tingkat hierarki organisasi
// Digunakan konsisten untuk bar chart dan pie chart
const CHART_COLORS = [
    '#1976D2', // Level 2: Kepala Seksi
    '#00897B', // Level 3: Kepala Subdit
    '#66BB6A', // Level 4: Direktur
];

// Ukuran font responsif untuk mode normal dan fullscreen
const FONT_SIZES = {
    statsValue: { fullscreen: '1.75rem', normal: '2.25rem' },
    statsLabel: { fullscreen: '0.75rem', normal: '0.875rem' },
    statsCaption: { fullscreen: '0.7rem', normal: '0.75rem' },
    icon: { fullscreen: 36, normal: 48 },
};

// Fungsi untuk mendapatkan warna chart berdasarkan hierarchy level
const getChartColorByLevel = (hierarchyLevel: number): string => {
    const colorMap: Record<number, string> = {
        2: CHART_COLORS[0],
        3: CHART_COLORS[1],
        4: CHART_COLORS[2],
    };
    return colorMap[hierarchyLevel] || '#6C757D';
};

export default function DashboardPage() {
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [workflowData, setWorkflowData] = useState<WorkflowItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchDashboardData();

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [globalRes, workflowRes] = await Promise.all([fetch('/api/dashboard/global-stats', { headers }), fetch('/api/dashboard/workflow-distribution', { headers })]);

            if (!globalRes.ok || !workflowRes.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const [globalData, workflowDataRes] = await Promise.all([globalRes.json(), workflowRes.json()]);

            setGlobalStats(globalData.data);
            setWorkflowData(workflowDataRes.data);
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

    const workflowChartData = {
        labels: workflowData.map((item) => item.roleName),
        datasets: [
            {
                label: 'Dokumen Sedang Direview',
                data: workflowData.map((item) => item.pendingCount),
                backgroundColor: workflowData.map((item) => getChartColorByLevel(item.hierarchyLevel)),
                borderColor: workflowData.map((item) => getChartColorByLevel(item.hierarchyLevel)),
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const leaderWorkflowData = workflowData.filter((item) => item.hierarchyLevel >= 2 && item.hierarchyLevel <= 4);

    const leaderChartData = {
        labels: leaderWorkflowData.map((item) => item.roleName),
        datasets: [
            {
                data: leaderWorkflowData.map((item) => item.pendingCount),
                backgroundColor: leaderWorkflowData.map((item) => getChartColorByLevel(item.hierarchyLevel)),
                borderColor: '#ffffff',
                borderWidth: 4,
                hoverOffset: 15,
            },
        ],
    };

    const workflowChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            datalabels: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(33, 33, 33, 0.95)',
                titleFont: { size: 14, weight: 'bold' as const },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    font: { size: 12 },
                    color: '#757575',
                },
                grid: { color: '#E0E0E0' },
            },
            x: {
                ticks: {
                    font: { size: 11 },
                    color: '#757575',
                },
                grid: { display: false },
            },
        },
    };

    const leaderChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: isFullscreen ? 12 : 20,
                    font: {
                        size: isFullscreen ? 14 : 16,
                        weight: 'bold' as const,
                    },
                    usePointStyle: true,
                    pointStyle: 'circle' as const,
                    color: '#212121',
                    boxWidth: isFullscreen ? 12 : 15,
                    boxHeight: isFullscreen ? 12 : 15,
                },
            },
            datalabels: {
                color: '#FFFFFF',
                font: {
                    size: isFullscreen ? 24 : 20,
                    weight: 'bold' as const,
                },
                formatter: (value: number, context: any) => {
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    if (total === 0 || value === 0) return '';
                    const percentage = ((value / total) * 100).toFixed(0);
                    return `${value}\n(${percentage}%)`;
                },
                textAlign: 'center' as const,
                anchor: 'center' as const,
                offset: 0,
            },
            tooltip: {
                backgroundColor: 'rgba(33, 33, 33, 0.95)',
                titleFont: { size: 16, weight: 'bold' as const },
                bodyFont: { size: 14 },
                padding: 14,
                cornerRadius: 8,
                callbacks: {
                    label: function (context: any) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${value} dokumen (${percentage}%)`;
                    },
                },
            },
        },
    };

    return (
        <Box
            ref={containerRef}
            sx={{
                bgcolor: isFullscreen ? '#FAFAFA' : 'transparent',
                p: isFullscreen ? 2.5 : 0,
                height: isFullscreen ? '100vh' : 'auto',
                overflow: isFullscreen ? 'hidden' : 'visible',
                display: isFullscreen ? 'flex' : 'block',
                flexDirection: isFullscreen ? 'column' : undefined,
            }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: isFullscreen ? 1.5 : 3,
                    flexShrink: 0,
                }}>
                <Typography variant={isFullscreen ? 'h5' : 'h4'} fontWeight="bold" sx={{ color: 'text.primary' }}>
                    Dashboard Statistik Dokumen
                </Typography>
                <IconButton
                    onClick={toggleFullscreen}
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        borderRadius: 2,
                        px: 2,
                    }}>
                    {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                    <Typography variant="body2" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                        {isFullscreen ? 'Keluar Fullscreen' : 'Mode Fullscreen'}
                    </Typography>
                </IconButton>
            </Box>

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
                            bgcolor: 'white',
                            borderLeft: `4px solid ${PRIMARY_COLOR}`,
                            height: '100%',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 3,
                            },
                        }}>
                        <CardContent sx={{ p: isFullscreen ? 2 : 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            mb: 1,
                                            fontSize: isFullscreen ? FONT_SIZES.statsLabel.fullscreen : FONT_SIZES.statsLabel.normal,
                                            fontWeight: 500,
                                        }}>
                                        Total Dokumen
                                    </Typography>
                                    <Typography
                                        variant="h3"
                                        fontWeight="bold"
                                        sx={{
                                            color: PRIMARY_COLOR,
                                            fontSize: isFullscreen ? FONT_SIZES.statsValue.fullscreen : FONT_SIZES.statsValue.normal,
                                            mb: 0.5,
                                        }}>
                                        {globalStats?.total || 0}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'text.secondary',
                                            fontSize: isFullscreen ? FONT_SIZES.statsCaption.fullscreen : FONT_SIZES.statsCaption.normal,
                                        }}>
                                        Dokumen diajukan
                                    </Typography>
                                </Box>
                                <Description sx={{ fontSize: isFullscreen ? FONT_SIZES.icon.fullscreen : FONT_SIZES.icon.normal, color: PRIMARY_COLOR, opacity: 0.2 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        sx={{
                            bgcolor: 'white',
                            borderLeft: `4px solid ${ACCENT_COLOR}`,
                            height: '100%',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 3,
                            },
                        }}>
                        <CardContent sx={{ p: isFullscreen ? 2 : 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            mb: 1,
                                            fontSize: isFullscreen ? FONT_SIZES.statsLabel.fullscreen : FONT_SIZES.statsLabel.normal,
                                            fontWeight: 500,
                                        }}>
                                        Sedang Direview
                                    </Typography>
                                    <Typography
                                        variant="h3"
                                        fontWeight="bold"
                                        sx={{
                                            color: ACCENT_COLOR,
                                            fontSize: isFullscreen ? FONT_SIZES.statsValue.fullscreen : FONT_SIZES.statsValue.normal,
                                            mb: 0.5,
                                        }}>
                                        {globalStats?.pending || 0}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'text.secondary',
                                            fontSize: isFullscreen ? FONT_SIZES.statsCaption.fullscreen : FONT_SIZES.statsCaption.normal,
                                        }}>
                                        Dalam proses
                                    </Typography>
                                </Box>
                                <Pending sx={{ fontSize: isFullscreen ? FONT_SIZES.icon.fullscreen : FONT_SIZES.icon.normal, color: ACCENT_COLOR, opacity: 0.2 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        sx={{
                            bgcolor: 'white',
                            borderLeft: `4px solid ${REJECTED_COLOR}`,
                            height: '100%',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 3,
                            },
                        }}>
                        <CardContent sx={{ p: isFullscreen ? 2 : 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            mb: 1,
                                            fontSize: isFullscreen ? FONT_SIZES.statsLabel.fullscreen : FONT_SIZES.statsLabel.normal,
                                            fontWeight: 500,
                                        }}>
                                        Perlu Revisi
                                    </Typography>
                                    <Typography
                                        variant="h3"
                                        fontWeight="bold"
                                        sx={{
                                            color: REJECTED_COLOR,
                                            fontSize: isFullscreen ? FONT_SIZES.statsValue.fullscreen : FONT_SIZES.statsValue.normal,
                                            mb: 0.5,
                                        }}>
                                        {globalStats?.rejected || 0}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'text.secondary',
                                            fontSize: isFullscreen ? FONT_SIZES.statsCaption.fullscreen : FONT_SIZES.statsCaption.normal,
                                        }}>
                                        Harus diperbaiki
                                    </Typography>
                                </Box>
                                <ErrorOutline sx={{ fontSize: isFullscreen ? FONT_SIZES.icon.fullscreen : FONT_SIZES.icon.normal, color: REJECTED_COLOR, opacity: 0.2 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        sx={{
                            bgcolor: 'white',
                            borderLeft: `4px solid ${APPROVED_COLOR}`,
                            height: '100%',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 3,
                            },
                        }}>
                        <CardContent sx={{ p: isFullscreen ? 2 : 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            mb: 1,
                                            fontSize: isFullscreen ? FONT_SIZES.statsLabel.fullscreen : FONT_SIZES.statsLabel.normal,
                                            fontWeight: 500,
                                        }}>
                                        Disetujui
                                    </Typography>
                                    <Typography
                                        variant="h3"
                                        fontWeight="bold"
                                        sx={{
                                            color: APPROVED_COLOR,
                                            fontSize: isFullscreen ? FONT_SIZES.statsValue.fullscreen : FONT_SIZES.statsValue.normal,
                                            mb: 0.5,
                                        }}>
                                        {globalStats?.approved || 0}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'text.secondary',
                                            fontSize: isFullscreen ? FONT_SIZES.statsCaption.fullscreen : FONT_SIZES.statsCaption.normal,
                                        }}>
                                        Dokumen selesai
                                    </Typography>
                                </Box>
                                <CheckCircle sx={{ fontSize: isFullscreen ? FONT_SIZES.icon.fullscreen : FONT_SIZES.icon.normal, color: APPROVED_COLOR, opacity: 0.2 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid
                container
                spacing={isFullscreen ? 1.5 : 3}
                sx={{
                    flex: isFullscreen ? 1 : undefined,
                    minHeight: isFullscreen ? 0 : undefined,
                }}>
                <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                    <Paper
                        elevation={1}
                        sx={{
                            p: isFullscreen ? 2 : 3,
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 2,
                        }}>
                        <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                                color: 'text.primary',
                                mb: isFullscreen ? 1.5 : 2,
                                flexShrink: 0,
                                fontSize: isFullscreen ? '1rem' : '1.25rem',
                            }}>
                            Distribusi per Tahapan
                        </Typography>
                        <Box
                            sx={{
                                flex: 1,
                                minHeight: isFullscreen ? 0 : 300,
                                position: 'relative',
                            }}>
                            {workflowData.length > 0 ? (
                                <Bar key={`bar-${isFullscreen}`} data={workflowChartData} options={workflowChartOptions} />
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
                        elevation={1}
                        sx={{
                            p: isFullscreen ? 2 : 3,
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 2,
                        }}>
                        <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                                color: 'text.primary',
                                mb: isFullscreen ? 1.5 : 2,
                                flexShrink: 0,
                                fontSize: isFullscreen ? '1rem' : '1.25rem',
                            }}>
                            Sebaran Dokumen di Pimpinan
                        </Typography>
                        <Box
                            sx={{
                                flex: 1,
                                minHeight: isFullscreen ? 0 : 300,
                                position: 'relative',
                            }}>
                            {leaderWorkflowData.length > 0 ? (
                                <Pie key={`pie-${isFullscreen}`} data={leaderChartData} options={leaderChartOptions} />
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography color="text.secondary">🎉 Tidak ada dokumen sedang direview pimpinan</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
