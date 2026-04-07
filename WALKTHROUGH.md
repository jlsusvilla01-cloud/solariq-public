# Walkthrough: SolarIQ SaaS & Trial System

We have successfully transitioned SolarIQ from a single-tenant ERP to a multi-tenant SaaS platform with self-service user registration and a 15-day free trial.

## Key Changes

### 1. Separate Authentication Flows
- **User Sign In/Up**: New contractors can now register via `/#/signup` and sign in via `/#/signin`.
- **Admin Portal**: Internal admin access is now moved to a subtle footer link to clean up the main navigation for customers.
- **Landing Page**: The "Sign In" and "Start Free Trial" buttons now route directly to the user authentication flow.

### 2. 15-Day Free Trial Logic
- **Auto-Trial**: Every new registration automatically starts a 15-day trial period.
- **Expiration Tracking**: The system calculates the trial end date (`created_at + 15 days`) and monitors status on every login and API request.
- **Dashboard Banner**: A dynamic banner in the user dashboard shows the remaining trial days or active subscription status.

### 3. Subscription Paywall
- **Automated Gate**: Once the trial expires, the `Paywall` component is triggered, blocking access to project management features.
- **Mock Checkout**: Users can select between Starter, Professional, or Enterprise plans (Monthly/Annual) and "subscribe" via a mock payment flow.
- **Plan Features**: Each plan is detailed with Filipino-tailored pricing (₱) and specific feature sets.

### 4. User Workspace Isolation
- **Private Data**: Projects created by self-service users are linked to their account IDs and are only visible to them.
- **Client Tracking**: Each project generates a `shareToken` so contractors can still provide progress tracking to their own clients.

## Implementation Details

### Server-Side
- **Schema**: Added `users` table and `userId` field to `projects`.
- **Routes**: Implemented `/api/user/*` endpoint group with separate `requireUser` and `requireActiveUser` middlewares.
- **Persistence**: Implemented user logic in both `MemStorage.ts` (Vercel) and `LibSQLStorage.ts` (Real DB).

### Client-Side
- [UserAuth.tsx](file:///c:/Users/jswag/Downloads/SolarIQ_Project_Files%20%281%29/solariq-public/client/src/pages/UserAuth.tsx)
- [Paywall.tsx](file:///c:/Users/jswag/Downloads/SolarIQ_Project_Files%20%281%29/solariq-public/client/src/pages/Paywall.tsx)
- [UserDashboard.tsx](file:///c:/Users/jswag/Downloads/SolarIQ_Project_Files%20%281%29/solariq-public/client/src/pages/UserDashboard.tsx)
