import express from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { requireAdmin, requirePermission } from '../middlewares/admin-auth.middleware';
import * as dashboardController from '../controllers/admin.dashboard.controller';
import * as usersController from '../controllers/admin.users.controller';
import * as disputesController from '../controllers/admin.disputes.controller';
import * as metricsController from '../controllers/admin.metrics.controller';
import * as platformController from '../controllers/admin.platform.controller';
import * as settingsController from '../controllers/admin.settings.controller';
import * as projectsController from '../controllers/admin.projects.controller';
import * as financeController from '../controllers/admin.finance.controller';

const router = express.Router();

// All admin routes require JWT authentication first, then admin role check
router.use(authenticateJWT);
router.use(requireAdmin);

// ==========================================
// DASHBOARD ROUTES
// ==========================================
router.get('/dashboard/stats', dashboardController.getStats);
router.get('/dashboard/activity', dashboardController.getActivity);
router.get('/dashboard/health', dashboardController.getHealth);
router.get('/dashboard/moderation-queue', dashboardController.getModerationQueue);

// ==========================================
// USER MANAGEMENT ROUTES
// ==========================================
router.get('/users', requirePermission('USER_MANAGEMENT'), usersController.getUsers);
router.get('/users/:id', requirePermission('USER_MANAGEMENT'), usersController.getUser);
router.patch('/users/:id', requirePermission('USER_MANAGEMENT'), usersController.updateUser);
router.post('/users/:id/suspend', requirePermission('USER_MANAGEMENT'), usersController.suspendUser);
router.post('/users/:id/activate', requirePermission('USER_MANAGEMENT'), usersController.activateUser);
router.delete('/users/:id', requirePermission('USER_MANAGEMENT'), usersController.deleteUser);
router.post('/users/create', requirePermission('USER_MANAGEMENT'), usersController.createUser);

// ==========================================
// PROJECTS & PROPOSALS ROUTES
// ==========================================
router.get('/projects', requirePermission('SUPER_ADMIN'), projectsController.getProjects);
router.get('/projects/:id', requirePermission('SUPER_ADMIN'), projectsController.getProject);
router.put('/projects/:id/status', requirePermission('SUPER_ADMIN'), projectsController.updateProjectStatus);
router.put('/projects/:id/assign-vendor', requirePermission('SUPER_ADMIN'), projectsController.assignVendor);
router.post('/projects/:id/cancel', requirePermission('SUPER_ADMIN'), projectsController.cancelProject);
router.delete('/projects/:id', requirePermission('SUPER_ADMIN'), projectsController.deleteProject);
router.post('/projects/:id/notify', requirePermission('SUPER_ADMIN'), projectsController.notifyProjectParties);

// ==========================================
// FINANCE ROUTES
// ==========================================
router.get('/finance/dashboard', requirePermission('SUPER_ADMIN'), financeController.getFinanceDashboard);
router.get('/finance/transactions', requirePermission('SUPER_ADMIN'), financeController.getTransactions);
router.get('/finance/transactions/:id', requirePermission('SUPER_ADMIN'), financeController.getTransaction);
router.post('/finance/transactions/:id/complete', requirePermission('SUPER_ADMIN'), financeController.completeTransaction);
router.post('/finance/transactions/:id/refund', requirePermission('SUPER_ADMIN'), financeController.refundTransaction);
router.get('/finance/payment-requests', requirePermission('SUPER_ADMIN'), financeController.getPaymentRequests);
router.put('/finance/payment-requests/:id/approve', requirePermission('SUPER_ADMIN'), financeController.approvePaymentRequest);
router.get('/finance/accounts', requirePermission('SUPER_ADMIN'), financeController.getAccounts);
router.put('/finance/accounts/:id/balance', requirePermission('SUPER_ADMIN'), financeController.adjustAccountBalance);
router.post('/finance/accounts/:id/freeze', requirePermission('SUPER_ADMIN'), financeController.freezeAccount);

// ==========================================
// DISPUTE ROUTES
// ==========================================
router.get('/disputes/stats', requirePermission('DISPUTE_RESOLUTION'), disputesController.getDisputeStats);
router.get('/disputes', requirePermission('DISPUTE_RESOLUTION'), disputesController.getDisputes);
router.get('/disputes/:id', requirePermission('DISPUTE_RESOLUTION'), disputesController.getDispute);
router.post('/disputes/:id/analyze', requirePermission('DISPUTE_RESOLUTION'), disputesController.analyzeWithAI);
router.put('/disputes/:id/review', requirePermission('DISPUTE_RESOLUTION'), disputesController.reviewDispute);
router.post('/disputes/:id/resolve', requirePermission('DISPUTE_RESOLUTION'), disputesController.resolveDispute);
router.patch('/disputes/:id/status', requirePermission('DISPUTE_RESOLUTION'), disputesController.updateDisputeStatus);



// ==========================================
// METRICS & REPORTS ROUTES
// ==========================================
router.get('/metrics/general', requirePermission('METRICS_VIEW'), metricsController.getGeneralMetrics);
router.get('/metrics/tech-trends', requirePermission('METRICS_VIEW'), metricsController.getTechTrends);
router.get('/metrics/pricing-heatmap', requirePermission('METRICS_VIEW'), metricsController.getPricingHeatmap);
router.post('/reports/vendor/generate', requirePermission('REPORT_GENERATE'), metricsController.generateVendorReport);
router.get('/reports/vendor/:reportId', requirePermission('REPORT_GENERATE'), metricsController.getVendorReport);
router.get('/reports/revenue', requirePermission('METRICS_VIEW'), metricsController.getReportRevenue);

// ==========================================
// PLATFORM CONFIGURATION ROUTES
// ==========================================
router.get('/platform/config', requirePermission('PLATFORM_CONFIG'), platformController.getConfig);
router.patch('/platform/config', requirePermission('PLATFORM_CONFIG'), platformController.updateConfig);
router.get('/platform/skills', platformController.getSkills);
router.post('/platform/skills', requirePermission('PLATFORM_CONFIG'), platformController.addSkill);
router.delete('/platform/skills/:id', requirePermission('PLATFORM_CONFIG'), platformController.deleteSkill);
router.patch('/platform/ai-config', requirePermission('PLATFORM_CONFIG'), platformController.updateAIConfig);

// ==========================================
// SETTINGS & TEAM ROUTES
// ==========================================
router.get('/settings/team', requirePermission('SUPER_ADMIN'), settingsController.getTeam);
router.post('/settings/team/invite', requirePermission('SUPER_ADMIN'), settingsController.inviteTeamMember);
router.patch('/settings/team/:id', requirePermission('SUPER_ADMIN'), settingsController.updateTeamMember);
router.delete('/settings/team/:id', requirePermission('SUPER_ADMIN'), settingsController.removeTeamMember);
router.get('/settings/audit-log', settingsController.getAuditLog);
router.post('/settings/maintenance', requirePermission('SUPER_ADMIN'), settingsController.setMaintenanceMode);
router.post('/settings/cache-purge', requirePermission('SUPER_ADMIN'), settingsController.purgeCache);

export default router;
