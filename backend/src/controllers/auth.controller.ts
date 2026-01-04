import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.utils';

const prisma = new PrismaClient();

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
        console.log(`[LOGIN ATTEMPT] Email: ${email}`);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log(`[LOGIN FAIL] User not found: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await comparePassword(password, user.password);
        console.log(`[LOGIN CHECK] Email: ${email}, Password Valid: ${isValid}`);

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
            select: { id: true, email: true, role: true, simulationMode: true }
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

        const { simulationMode } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: {
                simulationMode: simulationMode !== undefined ? simulationMode : undefined
            },
            select: { id: true, email: true, role: true, simulationMode: true }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('updateMe Error:', error);
        res.status(500).json({ message: 'Failed to update user' });
    }
};
