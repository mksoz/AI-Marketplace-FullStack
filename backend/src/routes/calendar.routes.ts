import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    updateRSVP,
    exportCalendar,
    importCalendar,
    updateReminders,
    proposeAlternativeDate,
    acceptProposal,
} from '../controllers/calendar.controller';

const router = Router();

router.use(authenticateJWT);

// CRUD
router.get('/events', getEvents);
router.post('/events', createEvent);
router.patch('/events/:eventId', updateEvent);
router.delete('/events/:eventId', deleteEvent);

// RSVP & Proposals
router.patch('/events/:eventId/rsvp', updateRSVP);
router.post('/events/:eventId/propose', proposeAlternativeDate);
router.post('/events/:eventId/accept-proposal', acceptProposal);

// Reminders
router.patch('/events/:eventId/reminders', updateReminders);

// Import/Export
router.get('/export', exportCalendar);
router.post('/import', importCalendar);

export default router;
