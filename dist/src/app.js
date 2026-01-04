import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth';
const app = express();
app.use(cors({
    origin: process.env.APP_URL || "http://localhost:4000",
    credentials: true
}));
app.all('/api/auth/*splat', toNodeHandler(auth));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Health check
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Task Management API is running! Alhamdulillah',
    });
});
// API Routes
app.use('/api/v1/', routes);
// Error Handler (must be last)
app.use(errorHandler);
export default app;
