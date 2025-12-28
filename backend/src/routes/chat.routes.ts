
import { Router } from 'express';
import { authenticateJWT, authorizeRole } from '../middlewares/auth.middleware';
import { getProjectChat, sendMessage, getMyConversations, archiveConversation, deleteConversation } from '../controllers/chat.controller';

const router = Router();

router.use(authenticateJWT);

// Both Vendor and Client can access chat if they are part of the project
// The controller checks participation (or we should add middleware for that, but keeping it simple)

router.get('/', getMyConversations); // List all conversations
router.get('/:projectId', getProjectChat); // Get conversation for a project
router.post('/:projectId/messages', sendMessage); // Send message to a project's conversation
router.post('/:id/archive', archiveConversation); // Archive conversation
router.delete('/:id', deleteConversation); // Delete conversation (for current user)

export default router;
