import app from './app';
import dotenv from 'dotenv';
import { initializeStorage } from './services/file-upload.service';

dotenv.config();

const PORT = 8000;

// Deliverables system ready
import { ensureAdminExists } from './services/admin.seed';

// Ensure admin user exists on startup
const startServer = async () => {
    try {
        // Initialize file storage only in development
        if (process.env.NODE_ENV !== 'production') {
            await initializeStorage();
        }

        await ensureAdminExists();

        // Only listen on port if not in Vercel (local dev)
        // Vercel sets VERCEL=1 or we can check NODE_ENV
        if (process.env.NODE_ENV !== 'production') {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
                console.log(`Environment: ${process.env.NODE_ENV}`);
            });
        }
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();

export default app;
