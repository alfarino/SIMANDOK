import app from './app';
import { sequelize } from './config/database';

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');

        // Sync models (in development only)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('✅ Database synced');
        }

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📋 Health check: http://localhost:${PORT}/health`);
            console.log(`📚 API: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
}

startServer();
