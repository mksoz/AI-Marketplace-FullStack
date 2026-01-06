/**
 * Shared helper functions for project calculations
 */

/**
 * Calculate project progress based on completed milestones
 * @param milestones - Array of project milestones
 * @returns Progress percentage (0-100)
 */
export const calculateProjectProgress = (milestones: any[]): number => {
    if (!milestones || milestones.length === 0) return 0;

    const completed = milestones.filter(
        (m: any) => m.status === 'COMPLETED' || m.status === 'PAID'
    ).length;

    return Math.round((completed / milestones.length) * 100);
};

/**
 * Calculate total paid amount for a project
 * @param milestones - Array of project milestones
 * @returns Total paid amount
 */
export const calculatePaidAmount = (milestones: any[]): number => {
    if (!milestones) return 0;

    return milestones
        .filter((m: any) => m.isPaid)
        .reduce((acc: number, m: any) => acc + (typeof m.amount === 'number' ? m.amount : 0), 0);
};

/**
 * Calculate amount in escrow (completed but not paid)
 * @param milestones - Array of project milestones
 * @returns  Escrow amount
 */
export const calculateEscrowAmount = (milestones: any[]): number => {
    if (!milestones) return 0;

    return milestones
        .filter((m: any) => m.status === 'COMPLETED' && !m.isPaid)
        .reduce((acc: number, m: any) => acc + (typeof m.amount === 'number' ? m.amount : 0), 0);
};
