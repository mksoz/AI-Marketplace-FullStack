
# Frontend Documentation - AI Marketplace

## 1. Overview
The frontend is built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**. It uses a route-based architecture with distinct layouts for Public, Client, Vendor, and Admin users.

**Key Technologies:**
- **Routing**: `react-router-dom`
- **State**: standard React hooks (`useState`, `useEffect`) + `localStorage` for persistence/auth simulation.
- **AI Integration**: `GoogleGenerativeAI` (Gemini) for matchmaking and dispute analysis.
- **Styling**: Tailwind CSS with custom `index.css` animations (fade-in, slide-in, zoom-in).

---

## 2. Public Module
**Layout**: `Layout.tsx` (Header + Footer).
**Auth**: `SignUp.tsx` handles role selection (Client vs Vendor). Vendor signup is a multi-step wizard.

| Page | File | Key Features |
| :--- | :--- | :--- |
| **Home** | `Home.tsx` | Hero search, "How it Works" steps, Featured Vendors carousel. |
| **Search** | `Search.tsx` | **AI Match-Making**: Chat interface that parses requirements and filters vendors. Filters by industry, size. |
| **Vendor Profile** | `CompanyProfile.tsx` | Public view of a vendor. Portfolio, Use Cases, "Send Proposal" CTA. |
| **Pricing** | `Pricing.tsx` | Starter (Free) vs Pro ($29/mo) plans. Billing toggle. |
| **How it Works** | `HowItWorks.tsx` | Explainer steps for Clients and Vendors. |

---

## 3. Client Module
**Layout**: `ClientLayout.tsx` (Sidebar navigation + Topbar with user profile).
**Base Route**: `/client`

### Dashboard & Profile
- **Dashboard** (`ClientDashboard.tsx`): High-level stats (Active Projects, Escrow Funds), "Quick Actions", and Activity Feed.
- **Profile** (`ClientProfile.tsx`):
    - **Identity**: Personal info, Avatar.
    - **AI Context**: Defines "Technical Level" (No-code to Expert) and "Tone" for AI interactions.
    - **Trust Center**: Verification badges (Identity, Payment).
    - **Integrations**: Toggles for Slack, Jira, GitHub.

### Project Management
- **Projects List** (`ClientProjects.tsx`):
    - **Smart Search**: Dropdown with typeahead for projects/vendors.
    - **Project Cards**: Progress bars, next event highlights, quick links to sub-modules.
- **Tracking** (`ClientProjectTracking.tsx`): Visual roadmap (Gantt-style), Financial summary, Risk alerts.
- **Deliverables** (`ClientProjectDeliverables.tsx`):
    - **Milestone Timeline**: Vertical list of milestones.
    - **Status Logic**: Completed (Green), In Progress (Blue), Pending (Gray).
    - **Approval Flow**: "Review" or "Approve" actions for deliverables.
- **Files** (`ClientProjectFiles.tsx`):
    - **Dual View**: Toggle between **Documents** (Folder/File grid) and **Repository** (GitHub integration visual).
    - **Repo Details**: Commits, Languages, Readme preview.

### Financials & Escrow
- **Funds** (`ClientFunds.tsx`): Wallet overview. Table of funds locked in escrow vs released.
- **Deposit** (`ClientDeposit.tsx`): 3-Step checkout (Details -> Payment -> Confirm). Supports Credit Card/Bank Transfer.
- **Review Release** (`ClientReviewRelease.tsx`): Critical flow.
    - Displays evidence (files/links).
    - Actions: **Approve Release** (transfers funds) or **Reject/Dispute**.

### Communication
- **Messages** (`ClientMessages.tsx`): Chat interface.
    - **Meeting Scheduler**: Modal to book video calls.
    - **Context Sidebar**: Shows active agreements and shared files.
- **Calendar** (`ClientCalendar.tsx`): Month view. Events for Milestones (Green), Meetings (Blue), Deadlines (Red). RSVP modal.

---

## 4. Vendor Module
**Layout**: `VendorLayout.tsx`.
**Base Route**: `/vendor`

### Dashboard & Business
- **Dashboard** (`VendorDashboard.tsx`): Income graph, Profile views, recent proposals.
- **Profile Edit** (`VendorProfile.tsx`): Edit public appearance. Portfolio manager, Service listing.
- **Finance** (`VendorFinance.tsx`):
    - **Cash Flow**: Available vs Escrow vs Projected.
    - **Transactions**: History table with CSV export.
    - **Withdrawal**: "Request Release" logic.

### Projects & Clients
- **Projects** (`VendorProjects.tsx`):
    - **Kanban/List**: Manage ongoing work.
    - **Milestone Manager**: Request approval for active milestones.
    - **GitHub Sync**: Connect repo to project for client visibility.
- **Clients** (`VendorClients.tsx`): CRM-lite. Client cards with LTV (Lifetime Value) and pending payment alerts.

### Tools
- **Template Editor** (`VendorTemplateEditor.tsx`): Drag-and-drop builder for "Requirement Forms" sent to clients.
- **Calendar** (`VendorCalendar.tsx`): Similar to Client calendar but focused on deliverables and client meetings.
- **Notifications** (`VendorNotifications.tsx`):
    - **Types**: Opportunity (Gold Leads), Payments, Messages.
    - **Priority**: Visual distinction for "Gold" leads.

---

## 5. Admin Module
**Layout**: `AdminLayout.tsx`.
**Base Route**: `/admin`

### Operations
- **Dashboard** (`AdminDashboard.tsx`): Platform health. GMV, Net Revenue, Dispute Rate.
- **Users** (`AdminUsers.tsx`):
    - **User Table**: Filter by Role (Client/Vendor) and Status (Active/Suspended/Pending).
    - **Moderation**: Edit/Suspend users. Manual verification of vendors.
- **Platform Config** (`AdminPlatform.tsx`):
    - **Fees**: Set Vendor Commission % and Client Fee %.
    - **AI Config**: Set System Prompt, Model (Gemini Pro/Flash), Temperature.
    - **Skills**: Manage global skill tags.

### Intelligence & Security
- **Disputes** (`AdminDisputes.tsx`):
    - **AI Arbitrator**: Uses Gemini to analyze chat logs/contracts and recommend a resolution (Refund vs Release).
    - **Confidence Score**: AI explains *why* it recommends a verdict.
- **Metrics** (`AdminMetrics.tsx`):
    - **Market Insights**: Radar chart of trending tech (e.g., "RAG Frameworks").
    - **Pricing Heatmap**: Developer rates by region.
    - **Vendor Benchmarks**: Report generator (e.g., "Your rates are 20% above avg").
- **Settings** (`AdminSettings.tsx`):
    - **System**: Maintenance Mode toggle.
    - **Security**: Force 2FA, Audit Logs.
    - **Team**: Manage admin staff roles.

---

## 6. Shared Components & data
- **Protected Route**: Enforces `localStorage` auth check.
- **Mock Data**: Heavy reliance on `constants.ts` and component-level mock arrays for "live" feel without a backend.
- **Modal**: reusable `Modal.tsx` for all popups.

## 7. Current State
- **Development**: Running on `http://localhost:5173`.
- **Completeness**: All core flows (Signup -> Search -> Project -> Escrow -> Dispute) are visually implemented.
