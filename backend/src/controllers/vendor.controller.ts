import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getVendors = async (req: Request, res: Response) => {
    try {
        const vendors = await prisma.vendorProfile.findMany({
            include: {
                user: {
                    select: {
                        email: true,
                        id: true,
                    }
                },
            },
        });

        // Transform data to cleaner format if needed, or send as is
        res.json(vendors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching vendors' });
    }
};

export const getVendorById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const vendor = await prisma.vendorProfile.findUnique({
            where: { id }, // This assumes the ID passed is the VendorProfile ID, not User ID
            include: {
                user: {
                    select: {
                        email: true,
                    }
                },
                reviews: true,
                proposals: true,
                templates: {
                    where: { status: 'PUBLISHED' }
                }
            }
        });

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json(vendor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching vendor' });
    }
};
