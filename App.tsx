import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import CompanyProfile from './pages/CompanyProfile';
import Proposal from './pages/Proposal';
import HelpCenter from './pages/HelpCenter';
import SignUp from './pages/SignUp';
import HowItWorks from './pages/HowItWorks';
import Pricing from './pages/Pricing';
import ScrollToTop from './components/ScrollToTop';
import VendorLayout from './components/VendorLayout';

// Client Views
import ClientDashboard from './pages/client/ClientDashboard';
import ClientProfile from './pages/client/ClientProfile';
import ClientProjects from './pages/client/ClientProjects';
import ClientProjectDetails from './pages/client/ClientProjectDetails';
import ClientProposals from './pages/client/ClientProposals';
import ClientVendors from './pages/client/ClientVendors';
import ClientFunds from './pages/client/ClientFunds';
import ClientDeposit from './pages/client/ClientDeposit';
import ClientReviewRelease from './pages/client/ClientReviewRelease';
import ClientProjectTracking from './pages/client/ClientProjectTracking';
import ClientSettings from './pages/client/ClientSettings';
import ClientMessages from './pages/client/ClientMessages';
import ClientNotifications from './pages/client/ClientNotifications';
import ClientProjectFiles from './pages/client/ClientProjectFiles';
import ClientProjectDeliverables from './pages/client/ClientProjectDeliverables';
import ClientCalendar from './pages/client/ClientCalendar';

// Vendor Views
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProjects from './pages/vendor/VendorProjects';
import VendorProjectDetails from './pages/vendor/VendorProjectDetails';
import VendorProposals from './pages/vendor/VendorProposals';
import TemplateEditor from './pages/vendor/TemplateEditor';
import VendorClients from './pages/vendor/VendorClients';
import VendorFinance from './pages/vendor/VendorFinance';
import VendorProfile from './pages/vendor/VendorProfile';
import VendorSettings from './pages/vendor/VendorSettings';
import VendorMessages from './pages/vendor/VendorMessages';
import VendorCalendar from './pages/vendor/VendorCalendar';
import VendorNotifications from './pages/vendor/VendorNotifications';

// Admin Views
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMetrics from './pages/admin/AdminMetrics';
import AdminPlatform from './pages/admin/AdminPlatform';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminSettings from './pages/admin/AdminSettings';

// Helper component to scroll to top on route change
const ScrollToTopHelper = () => {
  ScrollToTop();
  return null;
};

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const user = localStorage.getItem('ai_dev_user');
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTopHelper />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/search" element={<Search />} />
        <Route path="/company/:id" element={<CompanyProfile />} />
        <Route path="/proposal/:companyId" element={<Proposal />} />
        <Route path="/support" element={<HelpCenter />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Client Protected Routes */}
        <Route path="/client/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
        <Route path="/client/profile" element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />
        <Route path="/client/projects" element={<ProtectedRoute><ClientProjects /></ProtectedRoute>} />
        <Route path="/client/projects" element={<ProtectedRoute><ClientProjects /></ProtectedRoute>} />
        <Route path="/client/projects/:id" element={<ProtectedRoute><ClientProjectDetails /></ProtectedRoute>} />

        <Route path="/client/proposals" element={<ProtectedRoute><ClientProposals /></ProtectedRoute>} />
        <Route path="/client/vendors" element={<ProtectedRoute><ClientVendors /></ProtectedRoute>} />
        <Route path="/client/calendar" element={<ProtectedRoute><ClientCalendar /></ProtectedRoute>} />

        <Route path="/client/funds" element={<ProtectedRoute><ClientFunds /></ProtectedRoute>} />
        <Route path="/client/funds/deposit" element={<ProtectedRoute><ClientDeposit /></ProtectedRoute>} />
        <Route path="/client/funds/review" element={<ProtectedRoute><ClientReviewRelease /></ProtectedRoute>} />
        <Route path="/client/settings" element={<ProtectedRoute><ClientSettings /></ProtectedRoute>} />
        <Route path="/client/messages" element={<ProtectedRoute><ClientMessages /></ProtectedRoute>} />
        <Route path="/client/notifications" element={<ProtectedRoute><ClientNotifications /></ProtectedRoute>} />

        {/* Vendor Protected Routes */}
        <Route path="/vendor/dashboard" element={<ProtectedRoute><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/projects" element={<ProtectedRoute><VendorProjects /></ProtectedRoute>} />
        <Route path="/vendor/projects/:id" element={<ProtectedRoute><VendorProjectDetails /></ProtectedRoute>} />
        <Route path="/vendor/projects" element={<ProtectedRoute><VendorProjects /></ProtectedRoute>} />
        <Route path="/vendor/proposals" element={<ProtectedRoute><VendorProposals /></ProtectedRoute>} />
        <Route path="/vendor/templates" element={<ProtectedRoute><VendorLayout><TemplateEditor /></VendorLayout></ProtectedRoute>} />
        <Route path="/vendor/calendar" element={<ProtectedRoute><VendorCalendar /></ProtectedRoute>} />
        <Route path="/vendor/clients" element={<ProtectedRoute><VendorClients /></ProtectedRoute>} />
        <Route path="/vendor/finance" element={<ProtectedRoute><VendorFinance /></ProtectedRoute>} />
        <Route path="/vendor/profile" element={<ProtectedRoute><VendorProfile /></ProtectedRoute>} />
        <Route path="/vendor/settings" element={<ProtectedRoute><VendorSettings /></ProtectedRoute>} />
        <Route path="/vendor/messages" element={<ProtectedRoute><VendorMessages /></ProtectedRoute>} />
        <Route path="/vendor/notifications" element={<ProtectedRoute><VendorNotifications /></ProtectedRoute>} />

        {/* Admin Protected Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/metrics" element={<ProtectedRoute><AdminMetrics /></ProtectedRoute>} />
        <Route path="/admin/platform" element={<ProtectedRoute><AdminPlatform /></ProtectedRoute>} />
        <Route path="/admin/disputes" element={<ProtectedRoute><AdminDisputes /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;