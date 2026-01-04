import app from './app';
import { config } from './config/env';
import { prisma } from './lib/prisma';
const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('Connect to the Prisma Database successfully.. Alhamdulillah...');
        app.listen(config.port, () => {
            console.log(`🚀 Server running on port ${config.port}`);
            console.log(`📍 Environment: ${config.nodeEnv}`);
            console.log(`🔗 API URL: http://localhost:${config.port}/api/v1`);
        });
    }
    catch (error) {
        console.log('Failed to start server:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
};
startServer();
