import { createTheme } from '@mui/material/styles';

// SIMANDOK Modern Clean Color Palette
const colors = {
    // Primary Colors - Lighter & Softer
    darkGreen: '#00341F', // Logo, Footer (brand identity)
    primaryGreen: '#1B5E20', // Primary actions, main brand color
    lightGreen: '#4CAF50', // Hover states, accents
    softGreen: '#E8F5E9', // Active menu background, highlights

    // Accent Colors - Softer Yellow
    accentYellow: '#FDD835', // Call-to-action, important highlights
    lightYellow: '#FFF9C4', // Background highlights, subtle accents

    // Supporting Colors
    navyBlue: '#1976D2', // Info, links
    teal: '#00897B', // Success states
    lightBlue: '#B3E5FC', // Chart backgrounds

    // Backgrounds & Neutrals - Clean & Modern
    pageBackground: '#FAFAFA', // Main page background (light gray)
    cardBackground: '#FFFFFF', // Cards, papers (pure white)
    sidebarBackground: '#FFFFFF', // Sidebar background (white)
    lightGray: '#F5F5F5', // Subtle backgrounds
    borderGray: '#E0E0E0', // Borders, dividers

    // Text Colors
    textPrimary: '#212121', // Main text
    textSecondary: '#757575', // Secondary text
    textDisabled: '#BDBDBD', // Disabled text

    // Status Colors - Modern & Clear
    success: '#2E7D32', // Success states
    warning: '#F57C00', // Warning states
    error: '#D32F2F', // Error states
    info: '#0288D1', // Info states
};

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: colors.primaryGreen, // #1B5E20 - Modern green
            light: colors.lightGreen, // #4CAF50 - Lighter variant
            dark: colors.darkGreen, // #00341F - Brand dark
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: colors.teal, // #00897B - Teal accent
            light: colors.lightBlue, // #B3E5FC
            dark: colors.navyBlue, // #1976D2
            contrastText: '#FFFFFF',
        },
        success: {
            main: colors.success, // #2E7D32
            light: colors.lightGreen, // #4CAF50
            dark: colors.darkGreen, // #00341F
        },
        warning: {
            main: colors.warning, // #F57C00
            light: colors.accentYellow, // #FDD835
            dark: '#E65100',
        },
        error: {
            main: colors.error, // #D32F2F
            light: '#EF5350',
            dark: '#C62828',
        },
        info: {
            main: colors.info, // #0288D1
            light: colors.navyBlue, // #1976D2
            dark: '#01579B',
        },
        background: {
            default: colors.pageBackground, // #FAFAFA - Clean light gray
            paper: colors.cardBackground, // #FFFFFF - Pure white
        },
        text: {
            primary: colors.textPrimary, // #212121
            secondary: colors.textSecondary, // #757575
            disabled: colors.textDisabled, // #BDBDBD
        },
        divider: colors.borderGray, // #E0E0E0
    },
    typography: {
        fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700, color: colors.textPrimary },
        h2: { fontWeight: 700, color: colors.textPrimary },
        h3: { fontWeight: 600, color: colors.textPrimary },
        h4: { fontWeight: 600, color: colors.textPrimary },
        h5: { fontWeight: 600, color: colors.textPrimary },
        h6: { fontWeight: 500, color: colors.textPrimary },
        body1: { fontWeight: 400 },
        body2: { fontWeight: 400 },
        button: { fontWeight: 500 },
        caption: { fontWeight: 400 },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: colors.cardBackground, // White header
                    color: colors.textPrimary,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: colors.sidebarBackground, // White sidebar
                    color: colors.textPrimary,
                    borderRight: `1px solid ${colors.borderGray}`,
                    boxShadow: 'none',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    color: colors.textSecondary,
                    borderRadius: 8,
                    margin: '4px 8px',
                    '&:hover': {
                        backgroundColor: colors.lightGray, // Light gray hover
                    },
                    '&.Mui-selected': {
                        backgroundColor: colors.softGreen, // Soft green active
                        color: colors.primaryGreen, // Green text
                        '&:hover': {
                            backgroundColor: colors.softGreen,
                        },
                        '& .MuiListItemIcon-root': {
                            color: colors.primaryGreen,
                        },
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: colors.textSecondary,
                    minWidth: 48,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 8,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    },
                },
                containedPrimary: {
                    backgroundColor: colors.primaryGreen,
                    '&:hover': {
                        backgroundColor: colors.lightGreen,
                    },
                },
                containedSecondary: {
                    backgroundColor: colors.teal,
                    '&:hover': {
                        backgroundColor: colors.navyBlue,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                    borderRadius: 12,
                    transition: 'box-shadow 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.23)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                },
                elevation2: {
                    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
                },
                elevation3: {
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                    borderRadius: 16,
                },
                colorPrimary: {
                    backgroundColor: colors.primaryGreen,
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
                    borderColor: colors.borderGray,
                },
            },
        },
    },
});

export default theme;
