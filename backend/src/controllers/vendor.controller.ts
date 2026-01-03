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

        // If user is authenticated as CLIENT, check saved status
        let savedVendorIds = new Set<string>();
        if (req.user && req.user.role === 'CLIENT') {
            const clientProfile = await prisma.clientProfile.findUnique({
                where: { userId: req.user.userId },
                include: { savedVendors: true }
            });

            if (clientProfile) {
                clientProfile.savedVendors.forEach(sv => savedVendorIds.add(sv.vendorId));
            }
        }

        const enrichedVendors = vendors.map(v => ({
            ...v,
            isSaved: savedVendorIds.has(v.id)
        }));

        res.json(enrichedVendors);
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

// Toggle save/unsave vendor for client
export const toggleSaveVendor = async (req: Request, res: Response) => {
    try {
        const { id: vendorId } = req.params;
        const user = req.user;

        if (!user || user.role !== 'CLIENT') {
            return res.status(403).json({ message: 'Only clients can save vendors' });
        }

        const clientProfile = await prisma.clientProfile.findUnique({
            where: { userId: user.userId }
        });

        if (!clientProfile) {
            return res.status(404).json({ message: 'Client profile not found' });
        }

        // Check if already saved
        const existing = await prisma.savedVendor.findUnique({
            where: {
                clientId_vendorId: {
                    clientId: clientProfile.id,
                    vendorId
                }
            }
        });

        if (existing) {
            // Unsave
            await prisma.savedVendor.delete({
                where: { id: existing.id }
            });
            return res.json({ saved: false, message: 'Vendor removed from favorites' });
        } else {
            // Save
            await prisma.savedVendor.create({
                data: {
                    clientId: clientProfile.id,
                    vendorId
                }
            });
            return res.json({ saved: true, message: 'Vendor saved to favorites' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error toggling vendor save' });
    }
};

// Get client's vendor list (saved + with active projects)
export const getMyVendors = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user || user.role !== 'CLIENT') {
            return res.status(403).json({ message: 'Only clients can access this' });
        }

        const clientProfile = await prisma.clientProfile.findUnique({
            where: { userId: user.userId },
            include: {
                savedVendors: {
                    include: {
                        vendor: {
                            include: {
                                user: { select: { email: true, id: true } },
                                reviews: true
                            }
                        }
                    }
                },
                projects: {
                    where: {
                        status: { in: ['IN_PROGRESS', 'COMPLETED'] }
                    },
                    include: {
                        vendor: {
                            include: {
                                user: { select: { email: true, id: true } },
                                reviews: true
                            }
                        }
                    }
                }
            }
        });

        if (!clientProfile) {
            return res.status(404).json({ message: 'Client profile not found' });
        }

        // Combine saved vendors and vendors from projects (remove duplicates)
        const savedVendorIds = new Set(clientProfile.savedVendors.map(sv => sv.vendorId));
        const projectVendors = clientProfile.projects
            .filter(p => p.vendor)
            .map(p => p.vendor);

        const savedVendors = clientProfile.savedVendors.map(sv => ({
            ...sv.vendor,
            isSaved: true,
            hasProject: projectVendors.some(pv => pv?.id === sv.vendorId)
        }));

        const projectOnlyVendors = projectVendors
            .filter(v => v && !savedVendorIds.has(v.id))
            .map(v => ({
                ...v,
                isSaved: false,
                hasProject: true
            }));

        const allVendors = [...savedVendors, ...projectOnlyVendors];

        res.json(allVendors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching my vendors' });
    }
};
