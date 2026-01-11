import app from './app';
import dotenv from 'dotenv';
import { initializeStorage } from './services/file-upload.service';

dotenv.config();

const PORT = 8000;

// Initialize file storage
initializeStorage();

// Deliverables system ready
import { ensureAdminExists } from './services/admin.seed';

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);

    // Ensure admin user exists on startup
    await ensureAdminExists();
});
