import cron from 'node-cron';
import EmailReminderService from '../services/EmailReminderService';

// Daily reminder at 8:00 AM (server time)
const REMINDER_SCHEDULE = process.env.REMINDER_CRON || '0 8 * * *';

let isRunning = false;

export const startReminderCron = () => {
    console.log(`📅 Scheduling daily reminder cron at: ${REMINDER_SCHEDULE}`);

    cron.schedule(REMINDER_SCHEDULE, async () => {
        if (isRunning) {
            console.log('⏳ Previous reminder job still running, skipping...');
            return;
        }

        isRunning = true;
        console.log('🔔 Starting daily reminder job...');

        try {
            const logs = await EmailReminderService.sendBatchReminder();
            console.log(`✅ Daily reminder completed. Sent ${logs.length} emails.`);
        } catch (error) {
            console.error('❌ Daily reminder failed:', error);
        } finally {
            isRunning = false;
        }
    });

    console.log('✅ Reminder cron job initialized');
};

export const triggerReminderManually = async (sentByUserId?: number) => {
    console.log('🔔 Manual reminder triggered...');
    try {
        const logs = await EmailReminderService.sendBatchReminder(sentByUserId);
        console.log(`✅ Manual reminder completed. Sent ${logs.length} emails.`);
        return logs;
    } catch (error) {
        console.error('❌ Manual reminder failed:', error);
        throw error;
    }
};
