import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logAdminAction } from '../middlewares/admin-auth.middleware';

const prisma = new PrismaClient();

// GET /admin/platform/config
export const getConfig = async (req: Request, res: Response) => {
    try {
        // Get the latest config (there should only be one)
        const config = await prisma.platformConfig.findFirst({
            orderBy: { updatedAt: 'desc' }
        });

        // If no config exists, create default
        if (!config) {
            const defaultConfig = await prisma.platformConfig.create({
                data: {
                    updatedBy: (req as any).user?.userId
                }
            });
            return res.json(defaultConfig);
        }

        res.json(config);
    } catch (error) {
        console.error('Error getting platform config:', error);
        res.status(500).json({ message: 'Error obteniendo configuración' });
    }
};

// PATCH /admin/platform/config
export const updateConfig = async (req: Request, res: Response) => {
    try {
        const adminId = (req as any).user?.userId;
        const updates = req.body;

        // Get current config
        let config = await prisma.platformConfig.findFirst({
            orderBy: { updatedAt: 'desc' }
        });

        if (!config) {
            // Create if doesn't exist
            config = await prisma.platformConfig.create({
                data: {
                    ...updates,
                    updatedBy: adminId
                }
            });
        } else {
            // Update existing
            config = await prisma.platformConfig.update({
                where: { id: config.id },
                data: {
                    ...updates,
                    updatedBy: adminId
                }
            });
        }

        // Log action
        await logAdminAction(
            adminId,
            'CONFIG_CHANGED',
            'config',
            config.id,
            'Updated platform configuration',
            { changes: updates }
        );

        res.json(config);
    } catch (error) {
        console.error('Error updating platform config:', error);
        res.status(500).json({ message: 'Error actualizando configuración' });
    }
};

// GET /admin/platform/skills
export const getSkills = async (req: Request, res: Response) => {
    try {
        const skills = await prisma.skill.findMany({
            orderBy: { name: 'asc' }
        });

        res.json(skills);
    } catch (error) {
        console.error('Error getting skills:', error);
        res.status(500).json({ message: 'Error obteniendo skills' });
    }
};

// POST /admin/platform/skills
export const addSkill = async (req: Request, res: Response) => {
    try {
        const { name, category } = req.body;
        const adminId = (req as any).user?.userId;

        if (!name) {
            return res.status(400).json({ message: 'Nombre de skill requerido' });
        }

        // Check if skill already exists
        const existing = await prisma.skill.findUnique({
            where: { name }
        });

        if (existing) {
            return res.status(400).json({ message: 'Skill ya existe' });
        }

        const skill = await prisma.skill.create({
            data: {
                name,
                category: category || null
            }
        });

        // Log action
        await logAdminAction(
            adminId,
            'PLATFORM_UPDATED',
            'skill',
            skill.id,
            `Added skill: ${name}`
        );

        res.status(201).json(skill);
    } catch (error) {
        console.error('Error adding skill:', error);
        res.status(500).json({ message: 'Error añadiendo skill' });
    }
};

// DELETE /admin/platform/skills/:id
export const deleteSkill = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const adminId = (req as any).user?.userId;

        const skill = await prisma.skill.findUnique({
            where: { id }
        });

        if (!skill) {
            return res.status(404).json({ message: 'Skill no encontrado' });
        }

        await prisma.skill.delete({
            where: { id }
        });

        // Log action
        await logAdminAction(
            adminId,
            'PLATFORM_UPDATED',
            'skill',
            id,
            `Deleted skill: ${skill.name}`
        );

        res.json({ message: 'Skill eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({ message: 'Error eliminando skill' });
    }
};

// PATCH /admin/platform/ai-config
export const updateAIConfig = async (req: Request, res: Response) => {
    try {
        const { aiModel, aiTemperature, aiSystemPrompt } = req.body;
        const adminId = (req as any).user?.userId;

        // Get current config
        let config = await prisma.platformConfig.findFirst({
            orderBy: { updatedAt: 'desc' }
        });

        if (!config) {
            config = await prisma.platformConfig.create({
                data: {
                    aiModel,
                    aiTemperature,
                    aiSystemPrompt,
                    updatedBy: adminId
                }
            });
        } else {
            config = await prisma.platformConfig.update({
                where: { id: config.id },
                data: {
                    aiModel,
                    aiTemperature,
                    aiSystemPrompt,
                    updatedBy: adminId
                }
            });
        }

        // Log action
        await logAdminAction(
            adminId,
            'CONFIG_CHANGED',
            'config',
            config.id,
            'Updated AI configuration',
            { aiModel, aiTemperature }
        );

        res.json(config);
    } catch (error) {
        console.error('Error updating AI config:', error);
        res.status(500).json({ message: 'Error actualizando configuración de IA' });
    }
};
