/**
 * ============================================
 * STUDENT DASHBOARD COMPONENT
 * ============================================
 * 
 * Purpose: Main dashboard for student users
 * Used by: Student module routes
 * 
 * Features:
 * - Dashboard header with welcome message
 * - Quick statistics cards
 * - Attendance trend chart
 * - Grade summary bar chart
 * - Pending assignments list
 * - Your participations list
 * - GSAP entrance animations
 * - Data fetching on mount
 * 
 * Dependencies:
 * - react-redux for state management
 * - gsap for animations
 * - @/modules/student/store/studentThunks for data fetching
 * - Various student dashboard components
 * 
 * Usage:
 * <Route path="/student/dashboard" element={<StudentDashboard />} />
 * ============================================
 */

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { gsap } from "gsap";

import {
  fetchProfile,
  fetchAttendance,
  fetchReportCard,
  fetchAssignments,
  fetchParticipations,
} from "@/modules/student/store/studentThunks";
import DashboardHeader from "@/components/student/dashboard/DashboardHeader";
import QuickStats from "@/components/student/dashboard/QuickStats";
import AttendanceChart from "@/components/student/dashboard/AttendanceChart";
import GradeSummaryChart from "@/components/student/dashboard/GradeSummaryChart";
import PendingAssignments from "@/components/student/dashboard/PendingAssignments";
import YourParticipations from "@/components/student/dashboard/YourParticipations";

const StudentDashboard = () => {
  const dispatch = useDispatch();

  // ─── GSAP Refs ───────────────────────────────────────────────────────
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const chartsRef = useRef(null);
  const listsRef = useRef(null);

  // ─── Fetch Data on Mount ────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchProfile("student"));
    dispatch(fetchAttendance("student"));
    dispatch(fetchReportCard("student"));
    dispatch(fetchAssignments("student"));
    dispatch(fetchParticipations("student"));
  }, [dispatch]);

  // ─── Entrance Animations ─────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = [
        headerRef.current,
        statsRef.current,
        chartsRef.current,
        listsRef.current,
      ].filter(Boolean);

      gsap.fromTo(
        sections,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.15,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="space-y-6">
      <div ref={headerRef}>
        <DashboardHeader />
      </div>

      <div ref={statsRef}>
        <QuickStats />
      </div>

      <div ref={chartsRef} className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AttendanceChart />
        <GradeSummaryChart />
      </div>

      <div ref={listsRef} className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PendingAssignments />
        <YourParticipations />
      </div>
    </div>
  );
};

export default StudentDashboard;