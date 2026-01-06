import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get client profile
export const getClientProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        const clientProfile = await prisma.clientProfile.findUnique({
            where: { userId },
            select: {
                id: true,
                companyName: true,
                logoUrl: true,
                description: true,
                industry: true,
                website: true,
                country: true,
                city: true,
                billingAddress: true,
                taxId: true,
                legalName: true,
                monthlySpendLimit: true
            }
        });

        if (!clientProfile) {
            return res.status(404).json({ message: 'Client profile not found' });
        }

        res.json(clientProfile);
    } catch (error: any) {
        console.error('Error fetching client profile:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch profile' });
    }
};

// Update client profile
export const updateClientProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const {
            companyName,
            description,
            industry,
            website,
            country,
            city,
            billingAddress,
            taxId,
            legalName,
            monthlySpendLimit
        } = req.body;

        // Build update data object (only include fields that are provided)
        const updateData: any = {};
        if (companyName !== undefined) updateData.companyName = companyName;
        if (description !== undefined) updateData.description = description;
        if (industry !== undefined) updateData.industry = industry;
        if (website !== undefined) updateData.website = website;
        if (country !== undefined) updateData.country = country;
        if (city !== undefined) updateData.city = city;
        if (billingAddress !== undefined) updateData.billingAddress = billingAddress;
        if (taxId !== undefined) updateData.taxId = taxId;
        if (legalName !== undefined) updateData.legalName = legalName;
        if (monthlySpendLimit !== undefined) updateData.monthlySpendLimit = monthlySpendLimit;

        const updatedProfile = await prisma.clientProfile.update({
            where: { userId },
            data: updateData,
            select: {
                id: true,
                companyName: true,
                logoUrl: true,
                description: true,
                industry: true,
                website: true,
                country: true,
                city: true,
                billingAddress: true,
                taxId: true,
                legalName: true,
                monthlySpendLimit: true
            }
        });

        res.json(updatedProfile);
    } catch (error: any) {
        console.error('Error updating client profile:', error);
        res.status(500).json({ message: error.message || 'Failed to update profile' });
    }
};

// Upload logo (placeholder - would integrate with file upload service)
export const uploadLogo = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        // In a real implementation, this would:
        // 1. Validate file type/size
        // 2. Upload to S3/CloudStorage
        // 3. Get public URL

        // For now, simulate with a placeholder URL
        const logoUrl = req.body.logoUrl || `https://via.placeholder.com/150?text=${req.body.companyName || 'Logo'}`;

        const updatedProfile = await prisma.clientProfile.update({
            where: { userId },
            data: { logoUrl },
            select: {
                id: true,
                logoUrl: true
            }
        });

        res.json(updatedProfile);
    } catch (error: any) {
        console.error('Error uploading logo:', error);
        res.status(500).json({ message: error.message || 'Failed to upload logo' });
    }
};

// ============== VENDOR PROFILE ==============

// Get vendor profile
export const getVendorProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        const vendorProfile = await prisma.vendorProfile.findUnique({
            where: { userId },
            select: {
                id: true,
                companyName: true,
                logoUrl: true,
                bio: true,
                hourlyRate: true,
                skills: true,
                industry: true,
                website: true,
                country: true,
                city: true,
                languages: true,
                yearsOfExperience: true,
                portfolioUrl: true,
                linkedinUrl: true,
                githubUrl: true,
                billingAddress: true,
                taxId: true,
                legalName: true,
                aiAgentEnabled: true,
                aiAgentConfig: true
            }
        });

        if (!vendorProfile) {
            return res.status(404).json({ message: 'Vendor profile not found' });
        }

        res.json(vendorProfile);
    } catch (error: any) {
        console.error('Error fetching vendor profile:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch profile' });
    }
};

// Update vendor profile
export const updateVendorProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const {
            companyName, bio, hourlyRate, skills, industry, website,
            country, city, languages, yearsOfExperience,
            portfolioUrl, linkedinUrl, githubUrl,
            billingAddress, taxId, legalName,
            aiAgentEnabled, aiAgentConfig
        } = req.body;

        const updateData: any = {};
        if (companyName !== undefined) updateData.companyName = companyName;
        if (bio !== undefined) updateData.bio = bio;
        if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
        if (skills !== undefined) updateData.skills = skills;
        if (industry !== undefined) updateData.industry = industry;
        if (website !== undefined) updateData.website = website;
        if (country !== undefined) updateData.country = country;
        if (city !== undefined) updateData.city = city;
        if (languages !== undefined) updateData.languages = languages;
        if (yearsOfExperience !== undefined) updateData.yearsOfExperience = yearsOfExperience;
        if (portfolioUrl !== undefined) updateData.portfolioUrl = portfolioUrl;
        if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
        if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
        if (billingAddress !== undefined) updateData.billingAddress = billingAddress;
        if (taxId !== undefined) updateData.taxId = taxId;
        if (legalName !== undefined) updateData.legalName = legalName;
        if (aiAgentEnabled !== undefined) updateData.aiAgentEnabled = aiAgentEnabled;
        if (aiAgentConfig !== undefined) updateData.aiAgentConfig = aiAgentConfig;

        const updatedProfile = await prisma.vendorProfile.update({
            where: { userId },
            data: updateData,
            select: {
                id: true, companyName: true, logoUrl: true, bio: true,
                hourlyRate: true, skills: true, industry: true, website: true,
                country: true, city: true, languages: true, yearsOfExperience: true,
                portfolioUrl: true, linkedinUrl: true, githubUrl: true,
                billingAddress: true, taxId: true, legalName: true,
                aiAgentEnabled: true, aiAgentConfig: true
            }
        });

        res.json(updatedProfile);
    } catch (error: any) {
        console.error('Error updating vendor profile:', error);
        res.status(500).json({ message: error.message || 'Failed to update profile' });
    }
};

// Upload vendor logo
export const uploadVendorLogo = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const logoUrl = req.body.logoUrl || `https://via.placeholder.com/150?text=${req.body.companyName || 'Logo'}`;

        const updatedProfile = await prisma.vendorProfile.update({
            where: { userId },
            data: { logoUrl },
            select: { id: true, logoUrl: true }
        });

        res.json(updatedProfile);
    } catch (error: any) {
        console.error('Error uploading vendor logo:', error);
        res.status(500).json({ message: error.message || 'Failed to upload logo' });
    }
};
