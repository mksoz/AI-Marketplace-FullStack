import app from './app';
import dotenv from 'dotenv';
import { initializeStorage } from './services/file-upload.service';

dotenv.config();

const PORT = 8000;

// Initialize file storage
initializeStorage();

// Deliverables system ready
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
