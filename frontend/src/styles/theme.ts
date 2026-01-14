import { createTheme } from '@mui/material/styles';

// SIMANDOK Professional Color Palette
const colors = {
    // Primary Colors
    darkGreen: '#00341F', // Header, Sidebar, Primary Dark
    brightYellow: '#F0D323', // Accent, Active Status
    navyBlue: '#0C2C55', // Primary Main, Important Cards
    teal: '#296374', // Secondary, Chart Data
    lightBlue: '#629FAD', // Chart Secondary, Light Data

    // Backgrounds & Neutrals
    warmWhite: '#EDEDCE', // Page Background
    pureWhite: '#FFFFFF', // Card Background
    lightGray: '#F5F5F5', // Subtle Backgrounds
    gray: '#6C757D', // Secondary Text

    // Status Colors
    warning: '#D97706', // Revision/Warning
    error: '#C0392B', // Error/Critical
    success: '#1F7A5A', // Success (alternative)
};

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: colors.navyBlue, // 0C2C55 - Primary buttons & important elements
            light: colors.lightBlue, // 629FAD - Light variant
            dark: colors.darkGreen, // 00341F - Dark variant
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: colors.teal, // 296374 - Secondary elements
            light: colors.lightBlue, // 629FAD
            dark: colors.navyBlue, // 0C2C55
            contrastText: '#FFFFFF',
        },
        success: {
            main: colors.teal, // 296374 - Success states
            light: colors.lightBlue, // 629FAD
            dark: colors.darkGreen, // 00341F
        },
        warning: {
            main: colors.warning, // D97706 - Warning/Revision
            light: colors.brightYellow, // F0D323
            dark: '#B45309',
        },
        error: {
            main: colors.error, // C0392B - Errors
            light: '#E74C3C',
            dark: '#A93226',
        },
        info: {
            main: colors.lightBlue, // 629FAD - Info
            light: '#7EB3C3',
            dark: colors.teal, // 296374
        },
        background: {
            default: colors.warmWhite, // EDEDCE - Page background (warm white)
            paper: colors.pureWhite, // FFFFFF - Cards & Paper
        },
        text: {
            primary: '#1a1a1a',
            secondary: colors.gray, // 6C757D
        },
        divider: 'rgba(0, 52, 31, 0.12)',
    },
    typography: {
        fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700, color: colors.darkGreen },
        h2: { fontWeight: 700, color: colors.darkGreen },
        h3: { fontWeight: 600, color: colors.darkGreen },
        h4: { fontWeight: 600, color: colors.navyBlue },
        h5: { fontWeight: 600, color: colors.navyBlue },
        h6: { fontWeight: 600, color: colors.navyBlue },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: colors.darkGreen, // 00341F - Header
                    color: '#FFFFFF',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: colors.darkGreen, // 00341F - Sidebar
                    color: '#FFFFFF',
                    borderRight: 'none',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: colors.brightYellow, // F0D323 - Active menu
                        color: colors.darkGreen,
                        '&:hover': {
                            backgroundColor: colors.brightYellow,
                        },
                        '& .MuiListItemIcon-root': {
                            color: colors.darkGreen,
                        },
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    minWidth: 40,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 8,
                },
                containedPrimary: {
                    backgroundColor: colors.navyBlue, // 0C2C55
                    '&:hover': {
                        backgroundColor: colors.darkGreen, // 00341F
                    },
                },
                containedSecondary: {
                    backgroundColor: colors.teal, // 296374
                    '&:hover': {
                        backgroundColor: colors.navyBlue,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 8px rgba(0, 52, 31, 0.08)',
                    borderRadius: 12,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 2px 4px rgba(0, 52, 31, 0.06)',
                },
                elevation2: {
                    boxShadow: '0 4px 8px rgba(0, 52, 31, 0.08)',
                },
                elevation3: {
                    boxShadow: '0 8px 16px rgba(0, 52, 31, 0.1)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
                colorPrimary: {
                    backgroundColor: colors.navyBlue,
                    color: '#FFFFFF',
                },
                colorSecondary: {
                    backgroundColor: colors.teal,
                    color: '#FFFFFF',
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: 'rgba(0, 52, 31, 0.12)',
                },
            },
        },
    },
});

export default theme;
