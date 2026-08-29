/**
 * ============================================
 * PUBLIC ROUTES
 * ============================================
 * 
 * Purpose: Public module route definitions (no authentication required)
 * Used by: Main App Router
 * 
 * Features:
 * - Publicly accessible routes (no auth required)
 * - Homepage for all visitors
 * - Authentication pages with AuthLayout
 * - Login, Register, Forgot Password flows
 * - Pending approval page for unapproved users
 * 
 * Dependencies:
 * - react-router-dom for routing
 * - Public page components
 * - AuthLayout for authentication pages
 * 
 * Routes:
 * - /                    → Home page (landing)
 * - /login               → Login page
 * - /register            → Registration page
 * - /forgot-password     → Password reset page
 * - /pending-approval    → User awaiting approval page
 * ============================================
 */


import { Route } from "react-router-dom";

// ─── Public Pages ──────────────────────────────────────────────────────
import HomePage from "@/modules/public/HomePage.jsx";

// ─── Auth Pages ────────────────────────────────────────────────────────
import AuthLayout from "@/layouts/AuthLayout.jsx";
import Login from "@/modules/auth/pages/Login.jsx";
import Register from "@/modules/auth/pages/Register.jsx";
import ForgotPassword from "@/modules/auth/pages/ForgotPassword.jsx";
import PendingApproval from "@/modules/auth/pages/PendingApproval.jsx";

const PublicRoutes = (
  <>
    {/* Homepage - Public landing page */}
    <Route path="/" element={<HomePage />} />

    {/* Auth Pages - Login, Register, Forgot Password, Pending Approval */}
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/pending-approval" element={<PendingApproval />} />
    </Route>
  </>
);

export default PublicRoutes;