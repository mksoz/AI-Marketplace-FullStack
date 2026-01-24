import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.utils';
import prisma from '../utils/prisma';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!Object.values(UserRole).includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);

        // Transaction to create User + Profile
        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role,
                },
            });

            if (role === UserRole.CLIENT) {
                await tx.clientProfile.create({ data: { userId: user.id } });
            } else if (role === UserRole.VENDOR) {
                await tx.vendorProfile.create({ data: { userId: user.id } });
            }

            return user;
        });

        const token = generateToken({ userId: newUser.id, role: newUser.role, email: newUser.email });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: newUser.id, email: newUser.email, role: newUser.role },
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await comparePassword(password, user.password);

        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken({ userId: user.id, role: user.role, email: user.email });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const userData = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
                id: true,
                email: true,
                role: true,
                simulationMode: true,
                language: true,
                timezone: true,
                currency: true,
                dateFormat: true,
                theme: true,
                twoFactorEnabled: true,
                lastLoginAt: true
            }
        });

        res.json(userData);
    } catch (error) {
        console.error('getMe Error:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
};

export const updateMe = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const {
            simulationMode,
            language,
            timezone,
            currency,
            dateFormat,
            theme
        } = req.body;



        const updateData: any = {};
        if (simulationMode !== undefined) updateData.simulationMode = simulationMode;
        if (language !== undefined) updateData.language = language;
        if (timezone !== undefined) updateData.timezone = timezone;
        if (currency !== undefined) updateData.currency = currency;
        if (dateFormat !== undefined) updateData.dateFormat = dateFormat;
        if (theme !== undefined) updateData.theme = theme;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                role: true,
                simulationMode: true,
                language: true,
                timezone: true,
                currency: true,
                dateFormat: true,
                theme: true
            }
        });

        res.json(updatedUser);
    } catch (error: any) {
        console.error('updateMe Error:', error);
        res.status(500).json({ message: error.message || 'Failed to update user' });
    }
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required' });
        }

        // Get current user
        const currentUser = await prisma.user.findUnique({
            where: { id: user.userId }
        });

        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password (import from utils)
        const bcrypt = require('bcryptjs');
        const isValid = await bcrypt.compare(currentPassword, currentUser.password);

        if (!isValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: user.userId },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
        console.error('changePassword Error:', error);
        res.status(500).json({ message: error.message || 'Failed to change password' });
    }
};

// Get active sessions
export const getSessions = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const sessions = await prisma.session.findMany({
            where: {
                userId: user.userId,
                expiresAt: { gt: new Date() } // Only active sessions
            },
            select: {
                id: true,
                ipAddress: true,
                userAgent: true,
                createdAt: true,
                lastActiveAt: true
            },
            orderBy: {
                lastActiveAt: 'desc'
            }
        });

        res.json(sessions);
    } catch (error: any) {
        console.error('getSessions Error:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch sessions' });
    }
};

// Revoke a session
export const revokeSession = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { sessionId } = req.params;

        // Verify session belongs to user
        const session = await prisma.session.findFirst({
            where: {
                id: sessionId,
                userId: user.userId
            }
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Delete session
        await prisma.session.delete({
            where: { id: sessionId }
        });

        res.json({ message: 'Session revoked successfully' });
    } catch (error: any) {
        console.error('revokeSession Error:', error);
        res.status(500).json({ message: error.message || 'Failed to revoke session' });
    }
};
