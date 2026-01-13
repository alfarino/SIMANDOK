import nodemailer from 'nodemailer';

interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    from: string;
}

const emailConfig: EmailConfig = {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    },
    from: process.env.SMTP_FROM || 'SIMANDOK <noreply@unand.ac.id>'
};

// Create transporter (will be null if not configured)
export const createTransporter = () => {
    if (!emailConfig.host || !emailConfig.auth.user) {
        console.warn('⚠️ Email not configured. SMTP_HOST and SMTP_USER required.');
        return null;
    }

    return nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: emailConfig.auth
    });
};

export const getEmailFrom = () => emailConfig.from;

export default emailConfig;
