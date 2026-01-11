import { Request, Response } from 'express';
import { PrismaClient, EventType, EventStatus } from '@prisma/client';
import notificationService from '../services/notification.service';
import ical from 'ical-generator';

const prisma = new PrismaClient();

/**
 * Get all calendar events for user
 * GET /calendar/events
 * Query params: ?startDate=...&endDate=...&projectId=...&type=...&clientId=...
 */
export const getEvents = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { startDate, endDate, projectId, type, clientId } = req.query;

        // Build filter
        const filter: any = {
            OR: [
                { createdById: user.userId }, // Events I created
                { attendees: { some: { userId: user.userId } } }, // Events I'm invited to
            ],
        };

        if (startDate && endDate) {
            filter.AND = [
                { startDate: { gte: new Date(startDate as string) } },
                { endDate: { lte: new Date(endDate as string) } },
            ];
        }

        if (projectId) {
            filter.projectId = projectId;
        }

        if (type) {
            filter.type = type;
        }

        // Vendor-specific: filter by client
        if (user.role === 'VENDOR' && clientId) {
            filter.clientId = clientId;
        }

        const events = await prisma.calendarEvent.findMany({
            where: filter,
            include: {
                project: {
                    include: {
                        client: { select: { userId: true, companyName: true } },
                        vendor: { select: { userId: true, companyName: true } },
                    },
                },
                createdBy: { select: { id: true, email: true, role: true } },
                vendor: { select: { id: true, companyName: true, userId: true } },
                client: { select: { id: true, companyName: true, userId: true } },
                attendees: {
                    include: {
                        user: { select: { id: true, email: true, role: true } },
                    },
                },
                reminders: {
                    where: { userId: user.userId },
                },
            },
            orderBy: { startDate: 'asc' },
        });

        res.json(events);
    } catch (error: any) {
        console.error('Get events error:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch events' });
    }
};

/**
 * Create calendar event
 * POST /calendar/events
 */
export const createEvent = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const {
            title,
            description,
            type,
            startDate,
            endDate,
            isAllDay,
            projectId,
            meetingLink,
            location,
            color,
            attendeeIds,
            reminderMinutes,
            vendorId,
            clientId,
        } = req.body;

        // Validate vendor/client is provided
        if (user.role === 'VENDOR' && !clientId) {
            return res.status(400).json({ message: 'Client is required for vendor events' });
        }
        if (user.role === 'CLIENT' && !vendorId) {
            return res.status(400).json({ message: 'Vendor is required for client events' });
        }

        // Validate project access if projectId provided
        if (projectId) {
            const project = await prisma.project.findUnique({
                where: { id: projectId },
                include: { client: true, vendor: true },
            });

            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }

            const hasAccess =
                project.client?.userId === user.userId ||
                project.vendor?.userId === user.userId;

            if (!hasAccess) {
                return res.status(403).json({ message: 'No access to this project' });
            }
        }

        // Get the other participant's userId
        let otherParticipantId = '';
        if (user.role === 'VENDOR' && clientId) {
            const client = await prisma.clientProfile.findUnique({
                where: { id: clientId },
            });
            otherParticipantId = client?.userId || '';
        } else if (user.role === 'CLIENT' && vendorId) {
            const vendor = await prisma.vendorProfile.findUnique({
                where: { id: vendorId },
            });
            otherParticipantId = vendor?.userId || '';
        }

        // Create event
        const event = await prisma.calendarEvent.create({
            data: {
                title,
                description,
                type: type || EventType.CUSTOM,
                status: EventStatus.PENDING,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isAllDay: isAllDay || false,
                projectId,
                meetingLink,
                location,
                color,
                createdById: user.userId,
                vendorId,
                clientId,
                attendees: {
                    create: [
                        // Always add the other participant as attendee
                        {
                            userId: otherParticipantId,
                            status: 'NO_RESPONSE',
                        },
                        // Add additional attendees if provided
                        ...(attendeeIds || []).filter((id: string) => id !== otherParticipantId).map((id: string) => ({
                            userId: id,
                            status: 'NO_RESPONSE',
                        })),
                    ],
                },
                reminders: reminderMinutes
                    ? {
                        create: reminderMinutes.map((minutes: number) => ({
                            userId: user.userId,
                            minutesBefore: minutes,
                        })),
                    }
                    : undefined,
            },
            include: {
                attendees: { include: { user: true } },
                project: true,
                vendor: true,
                client: true,
            },
        });

        res.status(201).json(event);
    } catch (error: any) {
        console.error('Create event error:', error);
        res.status(500).json({ message: error.message || 'Failed to create event' });
    }
};

/**
 * Update event
 * PATCH /calendar/events/:eventId
 */
export const updateEvent = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { eventId } = req.params;

        // Check ownership
        const event = await prisma.calendarEvent.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.createdById !== user.userId) {
            return res.status(403).json({ message: 'Not authorized to edit this event' });
        }

        const updated = await prisma.calendarEvent.update({
            where: { id: eventId },
            data: req.body,
            include: {
                attendees: { include: { user: true } },
                project: true,
                vendor: true,
                client: true,
            },
        });

        res.json(updated);
    } catch (error: any) {
        console.error('Update event error:', error);
        res.status(500).json({ message: error.message || 'Failed to update event' });
    }
};

/**
 * Delete event
 * DELETE /calendar/events/:eventId
 */
export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { eventId } = req.params;

        const event = await prisma.calendarEvent.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.createdById !== user.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await prisma.calendarEvent.delete({
            where: { id: eventId },
        });

        res.json({ message: 'Event deleted successfully' });
    } catch (error: any) {
        console.error('Delete event error:', error);
        res.status(500).json({ message: error.message || 'Failed to delete event' });
    }
};

/**
 * Update attendee status (RSVP)
 * PATCH /calendar/events/:eventId/rsvp
 */
export const updateRSVP = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { eventId } = req.params;
        const { status, comment } = req.body;

        const attendee = await prisma.eventAttendee.upsert({
            where: {
                eventId_userId: {
                    eventId,
                    userId: user.userId,
                },
            },
            update: { status, comment },
            create: {
                eventId,
                userId: user.userId,
                status,
                comment,
            },
        });

        // If accepted, update event status to CONFIRMED
        if (status === 'ACCEPTED') {
            await prisma.calendarEvent.update({
                where: { id: eventId },
                data: { status: EventStatus.CONFIRMED },
            });
        }

        res.json(attendee);
    } catch (error: any) {
        console.error('RSVP error:', error);
        res.status(500).json({ message: error.message || 'Failed to update RSVP' });
    }
};

/**
 * Propose alternative date for an event
 * POST /calendar/events/:eventId/propose
 */
export const proposeAlternativeDate = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { eventId } = req.params;
        const { proposedStartDate, proposedEndDate, comment } = req.body;

        const event = await prisma.calendarEvent.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Update event with proposed date
        const updated = await prisma.calendarEvent.update({
            where: { id: eventId },
            data: {
                proposedStartDate: new Date(proposedStartDate),
                proposedEndDate: new Date(proposedEndDate),
                proposedBy: user.userId,
                proposalComment: comment,
                status: EventStatus.PENDING, // Reset to pending
            },
            include: {
                attendees: { include: { user: true } },
                project: true,
                vendor: true,
                client: true,
            },
        });

        res.json(updated);
    } catch (error: any) {
        console.error('Propose date error:', error);
        res.status(500).json({ message: error.message || 'Failed to propose date' });
    }
};

/**
 * Accept proposed date
 * POST /calendar/events/:eventId/accept-proposal
 */
export const acceptProposal = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { eventId } = req.params;

        const event = await prisma.calendarEvent.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!event.proposedStartDate || !event.proposedEndDate) {
            return res.status(400).json({ message: 'No proposed date to accept' });
        }

        // Update event dates with proposed dates
        const updated = await prisma.calendarEvent.update({
            where: { id: eventId },
            data: {
                startDate: event.proposedStartDate,
                endDate: event.proposedEndDate,
                proposedStartDate: null,
                proposedEndDate: null,
                proposedBy: null,
                proposalComment: null,
                status: EventStatus.CONFIRMED,
            },
            include: {
                attendees: { include: { user: true } },
                project: true,
                vendor: true,
                client: true,
            },
        });

        res.json(updated);
    } catch (error: any) {
        console.error('Accept proposal error:', error);
        res.status(500).json({ message: error.message || 'Failed to accept proposal' });
    }
};

/**
 * Export calendar to .ics
 * GET /calendar/export
 */
export const exportCalendar = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const events = await prisma.calendarEvent.findMany({
            where: {
                OR: [
                    { createdById: user.userId },
                    { attendees: { some: { userId: user.userId } } },
                ],
            },
        });

        const calendar = ical({ name: 'AI Marketplace Calendar' });

        events.forEach((event) => {
            calendar.createEvent({
                start: event.startDate,
                end: event.endDate,
                summary: event.title,
                description: event.description || '',
                location: event.location || '',
                url: event.meetingLink || '',
                allDay: event.isAllDay,
            });
        });

        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="calendar.ics"');
        res.send(calendar.toString());
    } catch (error: any) {
        console.error('Export calendar error:', error);
        res.status(500).json({ message: error.message || 'Failed to export calendar' });
    }
};

/**
 * Import calendar from .ics
 * POST /calendar/import
 */
export const importCalendar = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { icsData } = req.body;

        // Parse ICS using ical library
        const icalLib = require('node-ical');
        const parsed = icalLib.parseICS(icsData);

        const imported = [];

        for (const key in parsed) {
            const event = parsed[key];
            if (event.type === 'VEVENT') {
                const created = await prisma.calendarEvent.create({
                    data: {
                        title: event.summary || 'Imported Event',
                        description: event.description || null,
                        type: EventType.CUSTOM,
                        status: EventStatus.PENDING,
                        startDate: new Date(event.start),
                        endDate: new Date(event.end),
                        isAllDay: event.datetype === 'date',
                        location: event.location || null,
                        createdById: user.userId,
                    },
                });
                imported.push(created);
            }
        }

        res.json({
            message: `Imported ${imported.length} events`,
            events: imported,
        });
    } catch (error: any) {
        console.error('Import calendar error:', error);
        res.status(500).json({ message: error.message || 'Failed to import calendar' });
    }
};

/**
 * Update reminder preferences
 * PATCH /calendar/events/:eventId/reminders
 */
export const updateReminders = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { eventId } = req.params;
        const { minutesBefore } = req.body; // Array of numbers [15, 30, 60]

        // Delete existing reminders for this user and event
        await prisma.eventReminder.deleteMany({
            where: {
                eventId,
                userId: user.userId,
            },
        });

        // Create new reminders
        if (minutesBefore && minutesBefore.length > 0) {
            await prisma.eventReminder.createMany({
                data: minutesBefore.map((minutes: number) => ({
                    eventId,
                    userId: user.userId,
                    minutesBefore: minutes,
                })),
            });
        }

        const reminders = await prisma.eventReminder.findMany({
            where: { eventId, userId: user.userId },
        });

        res.json(reminders);
    } catch (error: any) {
        console.error('Update reminders error:', error);
        res.status(500).json({ message: error.message || 'Failed to update reminders' });
    }
};
