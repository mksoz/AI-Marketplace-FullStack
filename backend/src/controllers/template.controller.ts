import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new Requirement Template
export const createTemplate = async (req: Request, res: Response) => {
    try {
        const { name, description, structure, isDefault, status } = req.body;
        const user = req.user; // From Auth Middleware

        if (!user || user.role !== UserRole.VENDOR) {
            return res.status(403).json({ message: 'Only vendors can create templates' });
        }

        // Get Vendor Profile ID
        const vendorProfile = await prisma.vendorProfile.findUnique({
            where: { userId: user.userId }
        });

        if (!vendorProfile) {
            return res.status(404).json({ message: 'Vendor profile not found' });
        }

        const template = await prisma.requirementTemplate.create({
            data: {
                vendorId: vendorProfile.id,
                name,
                description,
                structure,
                isDefault: !!isDefault,
                status: status || 'DRAFT'
            }
        });

        res.status(201).json(template);
    } catch (error) {
        console.error("Create Template Error:", error);
        res.status(500).json({ message: 'Failed to create template' });
    }
};

// Get Templates for the authenticated Vendor
export const getMyTemplates = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user || user.role !== UserRole.VENDOR) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const vendorProfile = await prisma.vendorProfile.findUnique({
            where: { userId: user.userId }
        });

        if (!vendorProfile) {
            return res.status(404).json({ message: 'Vendor profile not found' });
        }

        const templates = await prisma.requirementTemplate.findMany({
            where: { vendorId: vendorProfile.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json(templates);
    } catch (error) {
        console.error("Get Templates Error:", error);
        res.status(500).json({ message: 'Failed to fetch templates' });
    }
};

// Update an existing Template
export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, structure, isDefault, status } = req.body;
        const user = req.user;

        if (!user || user.role !== UserRole.VENDOR) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const vendorProfile = await prisma.vendorProfile.findUnique({
            where: { userId: user.userId }
        });

        if (!vendorProfile) {
            return res.status(404).json({ message: 'Vendor profile not found' });
        }

        // Verify ownership
        const existing = await prisma.requirementTemplate.findUnique({
            where: { id }
        });

        if (!existing || existing.vendorId !== vendorProfile.id) {
            return res.status(404).json({ message: 'Template not found or unauthorized' });
        }

        const updated = await prisma.requirementTemplate.update({
            where: { id },
            data: {
                name,
                description,
                structure,
                isDefault: !!isDefault,
                status // Optional update
            }
        });

        res.json(updated);
    } catch (error) {
        console.error("Update Template Error:", error);
        res.status(500).json({ message: 'Failed to update template' });
    }
};

// Delete a Template
export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!user || user.role !== UserRole.VENDOR) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const vendorProfile = await prisma.vendorProfile.findUnique({
            where: { userId: user.userId }
        });

        if (!vendorProfile) {
            return res.status(404).json({ message: 'Vendor profile not found' });
        }

        // Verify ownership
        const existing = await prisma.requirementTemplate.findUnique({
            where: { id }
        });

        if (!existing || existing.vendorId !== vendorProfile.id) {
            return res.status(404).json({ message: 'Template not found or unauthorized' });
        }

        await prisma.requirementTemplate.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error("Delete Template Error:", error);
        res.status(500).json({ message: 'Failed to delete template' });
    }
};
