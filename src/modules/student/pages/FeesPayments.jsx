/**
 * ============================================
 * STUDENT FEES & PAYMENTS COMPONENT
 * ============================================
 * 
 * Purpose: Manages student fee viewing and payment processing
 * Used by: Student module routes
 * 
 * Features:
 * - Fee summary cards with statistics
 * - Fee schedule table with filtering
 * - Payment panel for selected fee
 * - Payment history list
 * - Fee details modal
 * - Stripe payment integration
 * - GSAP entrance animations
 * - Icon hover animations
 * - Role-based theming (student primary color)
 * - Responsive layout
 * 
 * Dependencies:
 * - lucide-react for icons (CreditCard, Wallet)
 * - @/components/ui/Card for containers
 * - @/components/student/FeeSummaryCards for stats
 * - @/components/student/FeeScheduleTable for fee list
 * - @/components/student/PaymentPanel for payment UI
 * - @/components/student/PaymentHistory for history
 * - @/components/student/FeeDetailsModal for details
 * - @/modules/payments/StripePaymentModal for Stripe
 * - @/modules/student/store/studentThunks for data fetching
 * - @/modules/student/store/studentSlice for state management
 * - gsap for animations
 * - react-redux for state management
 * 
 * Usage:
 * <Route path="/student/fees" element={<FeesPayments />} />
 * ============================================
 */

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { gsap } from "gsap";

import {
  CreditCard,
  Wallet,
} from "lucide-react";

import Card from '@/components/ui/Card';

import FeeSummaryCards from "@/components/student/FeeSummaryCards";
import FeeScheduleTable from "@/components/student/FeeScheduleTable";
import PaymentPanel from "@/components/student/PaymentPanel";
import PaymentHistory from "@/components/student/PaymentHistory";
import FeeDetailsModal from "@/components/student/FeeDetailsModal";
import StripePaymentModal from "@/modules/payments/StripePaymentModal";

import {
  fetchFees,
  fetchPayments,
  createPaymentIntent,
} from "@/modules/student/store/studentThunks";

import {
  setSelectedFee,
} from "@/modules/student/store/studentSlice";

/**
 * ============================================
 * FEES & PAYMENTS COMPONENT
 * ============================================
 * 
 * Renders the student fees and payments page
 * 
 * @returns {JSX.Element} Fees and payments page
 * 
 * @example
 * // In student routes
 * <Route path="/student/fees" element={<FeesPayments />} />
 * ============================================
 */
function FeesPayments() {
  const dispatch = useDispatch();

  // ─── Redux State ──────────────────────────────────────────────────────
  const {
    fees,
    payments,
    selectedFee,
    loading,
    submitting,
  } = useSelector(
    (state) => state.student
  );

  // ─── Local State ─────────────────────────────────────────────────────
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [showStripe, setShowStripe] = useState(false);

  // ─── GSAP Refs ───────────────────────────────────────────────────────

  /**
   * ============================================
   * ANIMATION REFS
   * ============================================
   * 
   * Refs for animating different sections of the page
   */
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const walletIconRef = useRef(null);
  const cardIconRef = useRef(null);
  const summaryRef = useRef(null);
  const tablePanelRef = useRef(null);
  const historyRef = useRef(null);

  // ─── Data Fetching ───────────────────────────────────────────────────

  /**
   * ============================================
   * FETCH DATA ON MOUNT
   * ============================================
   * 
   * Fetches fees and payments when the component mounts
   */
  useEffect(() => {
    dispatch(fetchFees());
    dispatch(fetchPayments());
  }, [dispatch]);

  // ─── Entrance Animations ─────────────────────────────────────────────

  /**
   * ============================================
   * GSAP ENTRANCE ANIMATIONS
   * ============================================
   * 
   * Animates page sections on load with staggered timing:
   * - Header: fade in + slide up + scale
   * - Icons: pop in with rotation
   * - Summary: fade in + slide up
   * - Table: fade in + slide up
   * - History: fade in + slide up
   * 
   * Also adds gentle idle float animation to icons
   */
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // ─── Header Animation ───
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 24, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.65 }
      )
        // ─── Icons Animation ───
        .fromTo(
          [walletIconRef.current, cardIconRef.current],
          { opacity: 0, scale: 0, rotate: -20 },
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 0.5,
            ease: "back.out(2.2)",
            stagger: 0.12,
          },
          "-=0.3"
        )
        // ─── Summary Animation ───
        .fromTo(
          summaryRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.25"
        )
        // ─── Table Panel Animation ───
        .fromTo(
          tablePanelRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.35"
        )
        // ─── History Animation ───
        .fromTo(
          historyRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.35"
        );

      // ─── Idle Float Animation ───
      // Gentle up/down motion on header icons
      gsap.to([walletIconRef.current, cardIconRef.current], {
        y: -4,
        duration: 2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.3,
        delay: 1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  /**
   * ============================================
   * ICON HOVER HANDLERS
   * ============================================
   * 
   * Animate icons on hover with scale and rotation
   * 
   * @param {Object} ref - GSAP ref for the icon
   */
  const handleIconEnter = (ref) => {
    gsap.to(ref.current, {
      scale: 1.12,
      rotate: 8,
      duration: 0.3,
      ease: "back.out(2.5)",
    });
  };

  const handleIconLeave = (ref) => {
    gsap.to(ref.current, {
      scale: 1,
      rotate: 0,
      duration: 0.35,
      ease: "power2.out",
    });
  };

  // ─── Handlers ──────────────────────────────────────────────────────────

  /**
   * ============================================
   * HANDLE VIEW FEE
   * ============================================
   * 
   * Opens the fee details modal for the selected fee
   * 
   * @param {Object} fee - Fee object to view
   */
  const handleViewFee = (fee) => {
    dispatch(setSelectedFee(fee));
    setDetailsOpen(true);
  };

  /**
   * ============================================
   * HANDLE SELECT FEE
   * ============================================
   * 
   * Selects a fee for payment
   * 
   * @param {Object} fee - Fee object to select
   */
  const handleSelectFee = (fee) => {
    dispatch(setSelectedFee(fee));
  };

  /**
   * ============================================
   * HANDLE PAYMENT
   * ============================================
   * 
   * Creates a Stripe payment intent and opens the Stripe modal
   * 
   * @returns {Promise<void>}
   */
  const handlePayment = async () => {
    try {
      const response = await dispatch(
        createPaymentIntent({
          fee_id: selectedFee.id,
        })
      ).unwrap();

      console.log("Payment Intent:", response);

      if (!response.client_secret) {
        throw new Error("No client_secret returned from backend.");
      }

      setClientSecret(response.client_secret);
      setShowStripe(true);
    } catch (error) {
      console.error(error);
      alert(
        error?.response?.data?.detail ||
        error?.message ||
        "Unable to initialize payment."
      );
    }
  };

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="space-y-8">
        {/* ─── Header ────────────────────────────────────────────────────── */}
        <Card ref={headerRef} className="overflow-hidden">
          <div className="flex flex-col gap-6 bg-linear-to-r from-student-primary to-student-hover p-8 text-white lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Fees & Payments
              </h1>
              <p className="mt-2 text-white/90">
                View your tuition fee schedule, payment history and securely pay
                outstanding fees using Stripe.
              </p>
            </div>

            <div className="flex gap-4">
              {/* Wallet Icon */}
              <div
                ref={walletIconRef}
                onMouseEnter={() => handleIconEnter(walletIconRef)}
                onMouseLeave={() => handleIconLeave(walletIconRef)}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20"
              >
                <Wallet size={34} />
              </div>

              {/* Credit Card Icon */}
              <div
                ref={cardIconRef}
                onMouseEnter={() => handleIconEnter(cardIconRef)}
                onMouseLeave={() => handleIconLeave(cardIconRef)}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20"
              >
                <CreditCard size={34} />
              </div>
            </div>
          </div>
        </Card>

        {/* ─── Summary Cards ────────────────────────────────────────────── */}
        <div ref={summaryRef}>
          <FeeSummaryCards fees={fees} />
        </div>

        {/* ─── Table + Payment Panel ────────────────────────────────────── */}
        <div ref={tablePanelRef} className="grid gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <FeeScheduleTable
              fees={fees}
              onView={handleViewFee}
              onPay={handleSelectFee}
            />
          </div>

          <div>
            <PaymentPanel
              selectedFee={selectedFee}
              loading={submitting}
              onPay={handlePayment}
            />
          </div>
        </div>

        {/* ─── Payment History ───────────────────────────────────────────── */}
        <div ref={historyRef}>
          <PaymentHistory payments={payments} fees={fees} />
        </div>

        {/* ─── Fee Details Modal ────────────────────────────────────────── */}
        <FeeDetailsModal
          open={detailsOpen}
          fee={selectedFee}
          onClose={() => setDetailsOpen(false)}
        />
      </div>

      {/* ─── Stripe Payment Modal ────────────────────────────────────────── */}
      <StripePaymentModal
        open={showStripe}
        clientSecret={clientSecret}
        onClose={() => {
          setShowStripe(false);
          setClientSecret("");
        }}
        onSuccess={() => {
          setShowStripe(false);
          setClientSecret("");
          dispatch(fetchFees());
          dispatch(fetchPayments());
          alert("Payment Successful");
        }}
      />
    </>
  );
}

export default FeesPayments;