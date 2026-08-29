// src/modules/admin/pages/AdminDashboard.jsx
import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import {
  TrendingUp, TrendingDown, ClockAlert, CalendarDays,
  MessageSquareWarning, UserCheck, ShieldAlert, Bell,
  Wallet, ChevronRight, BarChart3, ClipboardList,
  Settings2, ScrollText, RefreshCw, Clock, Users,
} from "lucide-react";

// --- Custom hook ------------------------------------------------------
import { useDashboardData } from "@/hooks/data/useDashboardData";

// --- Frontend-only constants -------------------------------------------
const REVENUE_TARGET = 25000;

const ROLE_COLORS = {
  Students: "#3b82f6",
  Teachers: "#8b5cf6",
  Parents: "#f59e0b",
  Pending: "#ef4444"
};

const NOTIF_META = {
  behavior: { icon: <ShieldAlert size={15} />, color: "#ef4444" },
  complaint: { icon: <MessageSquareWarning size={15} />, color: "#f59e0b" },
  approval: { icon: <UserCheck size={15} />, color: "#8b5cf6" },
  fee: { icon: <Wallet size={15} />, color: "#3b82f6" }
};

// --- Helpers ------------------------------------------------------------
const formatCurrency = (n) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(n);

const formatEventDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return "—";
  }
};

const daysUntil = (iso) => {
  try {
    return Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "U";
};

// --- Chart Components --------------------------------------------------
function FeeBarChart({ data }) {
  const maxCollected = useMemo(() => {
    return Math.max(...data.map(d => d.collected), 1);
  }, [data]);
  
  const wrapRef = useRef(null);
  const barRefs = useRef([]);
  barRefs.current = [];
  const addBarRef = (el) => el && barRefs.current.push(el);

  useEffect(() => {
    if (barRefs.current.length === 0 || !wrapRef.current) return;
    gsap.fromTo(
      barRefs.current,
      { scaleY: 0 },
      {
        scaleY: 1,
        duration: 1,
        ease: "power3.out",
        stagger: 0.15,
        transformOrigin: "bottom"
      }
    );
  }, [data]);

  return (
    <div ref={wrapRef} style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', padding: '0 4px' }}>
      {data.map((d, i) => {
        const height = (d.collected / maxCollected) * 100;
        const isLast = i === data.length - 1;
        return (
          <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              bottom: '100%', 
              marginBottom: '8px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              background: '#1f2937', 
              color: 'white', 
              fontSize: '10px', 
              padding: '4px 8px', 
              borderRadius: '8px', 
              opacity: 0, 
              transition: 'opacity 0.2s', 
              whiteSpace: 'nowrap', 
              zIndex: 10, 
              pointerEvents: 'none' 
            }}>
              {formatCurrency(d.collected)}
            </div>
            <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'flex-end' }}>
              <div
                ref={addBarRef}
                style={{
                  width: '100%',
                  borderRadius: '4px 4px 0 0',
                  height: `${Math.max(height, 2)}%`,
                  background: isLast ? '#3b82f6' : '#93c5fd',
                  transition: 'background 0.3s',
                  boxShadow: isLast ? '0 4px 6px -1px rgba(59, 130, 246, 0.3)' : 'none'
                }}
              />
            </div>
            <span style={{ fontSize: '10px', fontWeight: '600', color: isLast ? '#2563eb' : '#6b7280' }}>
              {d.month}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function AttendanceSparkline({ data }) {
  const width = 280, height = 60, padX = 8;
  const step = (width - padX * 2) / (data.length - 1);
  const points = data.map((d, i) => ({
    x: padX + i * step,
    y: height - (d.percentage / 100) * height
  }));
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  const wrapRef = useRef(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    gsap.fromTo(
      wrapRef.current.querySelector('polyline'),
      { strokeDasharray: '1000', strokeDashoffset: 1000 },
      { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" }
    );
  }, [data]);

  return (
    <svg ref={wrapRef} viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '60px' }}>
      <defs>
        <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon 
        points={`${points[0].x},${height} ${points.map(p => `${p.x},${p.y}`).join(' ')} ${points[points.length - 1].x},${height}`} 
        fill="url(#areaGrad2)" 
      />
      <polyline 
        points={polyline} 
        fill="none" 
        stroke="#8b5cf6" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeDasharray="1000"
        strokeDashoffset="1000"
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke="#8b5cf6" strokeWidth="2" />
      ))}
    </svg>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((a, b) => a + b.count, 0) || 1;
  let offset = 0;
  const r = 14;
  const circ = 2 * Math.PI * r;

  return (
    <svg viewBox="0 0 36 36" style={{ width: '100px', height: '100px', transform: 'rotate(-90deg)' }}>
      <circle cx="18" cy="18" r={r} fill="none" stroke="#f1f5f9" strokeWidth="5" />
      {data.map((d, i) => {
        const pct = d.count / total;
        const dash = pct * circ;
        const color = ROLE_COLORS[d.role] ?? "#94a3b8";
        const el = (
          <circle
            key={i}
            cx="18" cy="18" 
            r={r} 
            fill="none"
            stroke={color} 
            strokeWidth="5"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

// --- Skeleton & Error -------------------------------------------------
function DashboardSkeleton() {
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '100vh', background: '#f8f9fa' }}>
      <div style={{ height: '32px', width: '256px', borderRadius: '8px', background: '#e5e7eb' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: '112px', borderRadius: '12px', background: '#e5e7eb' }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        <div style={{ height: '256px', borderRadius: '12px', background: '#e5e7eb' }} />
        <div style={{ height: '256px', borderRadius: '12px', background: '#e5e7eb' }} />
      </div>
    </div>
  );
}

function DashboardError({ message, onRetry }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', maxWidth: '448px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', margin: '0 auto', borderRadius: '9999px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <ShieldAlert size={24} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
          Couldn't load dashboard
        </h3>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>{message}</p>
        <button 
          onClick={onRetry}
          style={{ 
            padding: '8px 24px', 
            background: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// --- MAIN DASHBOARD -----------------------------------------------------
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { loading, error, stats, pendingApprovals, recentNotifications, upcomingEvents } = useDashboardData();
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState(null);

  // Define ALL refs at the top level
  const attendanceCardRef = useRef(null);
  const donutCardRef = useRef(null);
  
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const revenuePercent = useMemo(
    () => stats ? Math.round((stats.monthly_revenue / REVENUE_TARGET) * 100) : 0,
    [stats]
  );

  const userDistributionWithMeta = useMemo(() => {
    if (!stats) return [];
    const dist = [
      { role: 'Students', count: stats.total_students || 0 },
      { role: 'Teachers', count: stats.total_teachers || 0 },
      { role: 'Parents', count: stats.total_parents || 0 },
    ];
    const total = dist.reduce((a, b) => a + b.count, 0) || 1;
    return dist.map((d) => ({
      ...d,
      color: ROLE_COLORS[d.role] ?? '#94a3b8',
      percentage: Math.round((d.count / total) * 100)
    }));
  }, [stats]);

  const unreadCount = useMemo(
    () => recentNotifications?.filter((n) => !n.is_read).length || 0,
    [recentNotifications]
  );

  const totalUsers = useMemo(
    () => userDistributionWithMeta.reduce((a, b) => a + b.count, 0),
    [userDistributionWithMeta]
  );

  const attendanceInView = useInView(attendanceCardRef, { once: true, amount: 0.1 });
  const [animatedAttendance, setAnimatedAttendance] = useState(0);

  // Fix: Proper GSAP animation without using `this.targets`
  useEffect(() => {
    if (attendanceInView && stats?.avg_attendance) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: stats.avg_attendance,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: function() {
          setAnimatedAttendance(Math.round(obj.val));
        }
      });
    }
  }, [attendanceInView, stats?.avg_attendance]);

  const [animatedTotalUsers, setAnimatedTotalUsers] = useState(0);

  // Fix: Proper GSAP animation without using `this.targets`
  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: totalUsers,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: function() {
        setAnimatedTotalUsers(Math.round(obj.val));
      }
    });
  }, [totalUsers]);

  const handleExportSummary = useCallback(async () => {
    if (!stats) return;
    setIsExporting(true);
    try {
      const summary = {
        date: new Date().toISOString(),
        totalStudents: stats.total_students || 0,
        totalTeachers: stats.total_teachers || 0,
        totalParents: stats.total_parents || 0,
        monthlyRevenue: stats.monthly_revenue || 0,
        averageAttendance: stats.avg_attendance || 0,
        openComplaints: stats.open_complaints || 0,
        pendingApprovals: pendingApprovals?.length || 0,
        revenueTarget: REVENUE_TARGET,
        revenuePercentage: revenuePercent
      };

      const headers = ["Metric", "Value"];
      const rows = Object.entries(summary).map(([key, value]) => [
        key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value
      ]);
      
      const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-summary-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      showToast("Export completed successfully", "success");
    } catch (error) {
      console.error("Export failed:", error);
      showToast("Export failed. Please try again.", "error");
    } finally {
      setIsExporting(false);
    }
  }, [stats, pendingApprovals, revenuePercent]);

  const handleManageEvents = useCallback(() => navigate("/admin/events"), [navigate]);
  const handleViewAllNotifications = useCallback(() => navigate("/admin/notifications"), [navigate]);
  const handleReviewApprovals = useCallback(() => navigate("/admin/user-approvals"), [navigate]);
  const handleReviewComplaints = useCallback(() => navigate("/admin/complaints"), [navigate]);
  const handleManageTimetable = useCallback(() => navigate("/admin/timetable"), [navigate]);
  const handleManageStructure = useCallback(() => navigate("/admin/academics"), [navigate]);
  const handleUserApprovals = useCallback(() => navigate("/admin/users"), [navigate]);

  // Styles
  const styles = {
    container: {
      display: 'block',
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      padding: '24px',
      background: '#ffffff',
      position: 'relative',
      overflow: 'visible'
    },
    grid4: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px'
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '16px'
    },
    grid12: {
      display: 'grid',
      gridTemplateColumns: '5fr 7fr',
      gap: '16px'
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    card: {
      background: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
    },
    cardBorderTop: (color) => ({
      background: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #e5e7eb',
      borderTop: `4px solid ${color}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
    }),
    cardTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1f2937'
    },
    cardSubtitle: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px'
    },
    flexBetween: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  };

  if (loading || !stats) return <DashboardSkeleton />;
  if (error) return <DashboardError message={error} onRetry={() => window.location.reload()} />;

  // Force visibility with inline styles on the container
  return (
    <div 
      style={{
        display: 'block',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        padding: '24px',
        background: '#ffffff',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            School Insights Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
            Welcome back, Admin. Here's what's happening today.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          {unreadCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: '1px solid #fecaca' }}>
              <span style={{ position: 'relative', display: 'flex', height: '8px', width: '8px' }}>
                <span style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', background: '#ef4444', opacity: 0.75 }} />
                <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '6px', width: '6px', background: '#ef4444' }} />
              </span>
              <Bell size={14} />
              <span>{unreadCount} unread alerts</span>
            </div>
          )}
          <button 
            onClick={handleExportSummary}
            disabled={isExporting}
            style={{ 
              padding: '8px 16px', 
              background: '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: isExporting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isExporting ? 0.6 : 1
            }}
          >
            <RefreshCw size={14} style={{ animation: isExporting ? 'spin 1s linear infinite' : 'none' }} />
            {isExporting ? 'Exporting...' : 'Export Summary'}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ marginBottom: '20px' }}>
        <div style={styles.grid4}>
          <div style={{ borderRadius: '12px', overflow: 'hidden', borderTop: '4px solid #2563eb', background: 'white', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>Total Students</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', margin: '0 0 4px 0' }}>{stats.total_students?.toLocaleString() || "0"}</p>
            <p style={{ fontSize: '12px', color: '#16a34a', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={12} /> Enrolled this year
            </p>
          </div>
          <div style={{ borderRadius: '12px', overflow: 'hidden', borderTop: '4px solid #8b5cf6', background: 'white', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>Total Teachers</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', margin: '0 0 4px 0' }}>{stats.total_teachers?.toLocaleString() || "0"}</p>
            <p style={{ fontSize: '12px', color: '#16a34a', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={12} /> Active staff
            </p>
          </div>
          <div style={{ borderRadius: '12px', overflow: 'hidden', borderTop: '4px solid #f59e0b', background: 'white', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>Monthly Revenue</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', margin: '0 0 4px 0' }}>PKR {((stats.monthly_revenue || 0) / 1000).toFixed(0)}k</p>
            <p style={{ fontSize: '12px', color: revenuePercent >= 80 ? '#16a34a' : '#f59e0b', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {revenuePercent >= 80 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {revenuePercent}% of target
            </p>
          </div>
          <div style={{ borderRadius: '12px', overflow: 'hidden', borderTop: '4px solid #2563eb', background: 'white', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>Open Complaints</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', margin: '0 0 4px 0' }}>{stats.open_complaints || 0}</p>
            <p style={{ fontSize: '12px', color: '#dc2626', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ClockAlert size={12} /> Needs attention
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ marginBottom: '20px' }}>
        <div style={styles.grid3}>
          <div style={styles.cardBorderTop('#2563eb')}>
            <div style={styles.flexBetween}>
              <div>
                <h3 style={styles.cardTitle}>Monthly Fee Collection</h3>
                <p style={styles.cardSubtitle}>Collected vs target • last 6 months</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#2563eb', display: 'inline-block' }} />
                  Collected
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#93c5fd', display: 'inline-block' }} />
                  Target
                </span>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <FeeBarChart data={stats.fee_collection_chart || []} />
            </div>
          </div>

          <div ref={attendanceCardRef} style={{ ...styles.cardBorderTop('#8b5cf6'), display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={styles.cardTitle}>Attendance This Week</h3>
              <p style={styles.cardSubtitle}>Daily average across all classes</p>
            </div>
            <div style={{ margin: '16px 0' }}>
              <AttendanceSparkline data={stats.attendance_trend || []} />
            </div>
            <div style={styles.flexBetween}>
              <div>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#7c3aed', margin: 0 }}>{animatedAttendance}%</p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Today's average</p>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(stats.attendance_trend || []).map((d) => (
                  <div key={d.day} style={{ textAlign: 'center' }}>
                    <div style={{ width: '6px', borderRadius: '9999px', background: '#c4b5fd', margin: '0 auto', height: `${(d.percentage / 100) * 24}px` }} />
                    <span style={{ fontSize: '8px', color: '#6b7280' }}>{d.day?.[0] || "?"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div style={{ marginBottom: '20px' }}>
        <div style={styles.grid12}>
          <div style={{ ...styles.cardBorderTop('#2563eb'), display: 'flex', flexDirection: 'column' }}>
            <div style={styles.flexBetween}>
              <div>
                <h3 style={styles.cardTitle}>Pending Approvals</h3>
                <p style={styles.cardSubtitle}>
                  {stats.pending_approvals || 0} request{stats.pending_approvals !== 1 ? "s" : ""} awaiting review
                </p>
              </div>
              <button
                onClick={handleReviewApprovals}
                style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Review All <ChevronRight size={12} />
              </button>
            </div>

            {!pendingApprovals || pendingApprovals.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 0', gap: '8px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '9999px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={18} color="#16a34a" />
                </div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', margin: 0 }}>All caught up!</p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>No pending approval requests.</p>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pendingApprovals.slice(0, 3).map((user) => {
                    const roleKey = user.role_name?.toLowerCase() || "student";
                    const colors = {
                      student: { bg: '#eff6ff', text: '#2563eb' },
                      teacher: { bg: '#f5f3ff', text: '#7c3aed' },
                      parent: { bg: '#fffbeb', text: '#d97706' }
                    };
                    const c = colors[roleKey] || colors.student;
                    return (
                      <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '12px', background: '#f9fafb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0, background: c.bg, color: c.text }}>
                            {getInitials(user.full_name)}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {user.full_name}
                            </p>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '8px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '500', padding: '2px 8px', borderRadius: '4px', background: c.bg, color: c.text }}>
                            {user.role_name || "Unknown"}
                          </span>
                          <Clock size={13} color="#f59e0b" />
                        </div>
                      </div>
                    );
                  })}
                  {pendingApprovals.length > 3 && (
                    <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginTop: '4px' }}>
                      +{pendingApprovals.length - 3} more pending
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div ref={donutCardRef} style={styles.cardBorderTop('#f59e0b')}>
              <h3 style={{ ...styles.cardTitle, marginBottom: '16px' }}>User Distribution</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <DonutChart data={userDistributionWithMeta} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                      {animatedTotalUsers.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '10px', color: '#6b7280' }}>Total</span>
                  </div>
                </div>
                <div style={{ flex: 1, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {userDistributionWithMeta.map((d) => (
                    <div key={d.role} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '9999px', flexShrink: 0, background: d.color }} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', margin: 0 }}>{d.role}</p>
                        <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>
                          {d.count.toLocaleString()} ({d.percentage}%)
                        </p>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '9999px', flexShrink: 0, background: '#2563eb' }} />
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Total</p>
                      <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>
                        {userDistributionWithMeta.reduce((a, b) => a + b.count, 0).toLocaleString()} (100%)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <button onClick={handleReviewComplaints} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ padding: '12px', background: '#eff6ff', color: '#2563eb', borderRadius: '12px', marginBottom: '8px' }}>
                  <ClipboardList size={18} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', textAlign: 'center' }}>Review Complaints</span>
              </button>
              <button onClick={handleManageTimetable} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ padding: '12px', background: '#eff6ff', color: '#2563eb', borderRadius: '12px', marginBottom: '8px' }}>
                  <BarChart3 size={18} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', textAlign: 'center' }}>Manage Timetable</span>
              </button>
              <button onClick={handleManageStructure} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ padding: '12px', background: '#eff6ff', color: '#2563eb', borderRadius: '12px', marginBottom: '8px' }}>
                  <Settings2 size={18} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', textAlign: 'center' }}>Manage Structure</span>
              </button>
              <button onClick={handleUserApprovals} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ padding: '12px', background: '#eff6ff', color: '#2563eb', borderRadius: '12px', marginBottom: '8px' }}>
                  <ScrollText size={18} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', textAlign: 'center' }}>User Approvals</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ marginBottom: '16px' }}>
        <div style={styles.grid2}>
          <div style={styles.cardBorderTop('#22c55e')}>
            <div style={styles.flexBetween}>
              <h3 style={styles.cardTitle}>Upcoming Events</h3>
              <button onClick={handleManageEvents} style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Manage <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {!upcomingEvents || upcomingEvents.length === 0 ? (
                  <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', padding: '24px 0', margin: 0 }}>No upcoming events.</p>
                ) : (
                  upcomingEvents.slice(0, 3).map((ev) => {
                    const days = daysUntil(ev.event_date);
                    return (
                      <div key={ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: '12px', background: '#f9fafb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CalendarDays size={17} />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.event_name}</p>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatEventDate(ev.event_date)} • {ev.venue}</p>
                          </div>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: '500', padding: '2px 8px', borderRadius: '4px', background: days <= 3 ? '#fef2f2' : days <= 7 ? '#fffbeb' : '#f3f4f6', color: days <= 3 ? '#dc2626' : days <= 7 ? '#d97706' : '#6b7280', flexShrink: 0, marginLeft: '8px' }}>
                          {days <= 0 ? "Today" : `${days}d`}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div style={styles.cardBorderTop('#06b6d4')}>
            <div style={styles.flexBetween}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <h3 style={styles.cardTitle}>Notifications</h3>
                {unreadCount > 0 && (
                  <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', background: '#fef2f2', color: '#dc2626', borderRadius: '9999px' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <button onClick={handleViewAllNotifications} style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {!recentNotifications || recentNotifications.length === 0 ? (
                  <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', padding: '24px 0', margin: 0 }}>No notifications.</p>
                ) : (
                  recentNotifications.slice(0, 3).map((n) => {
                    const meta = NOTIF_META[n.type] ?? NOTIF_META.fee;
                    return (
                      <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', borderRadius: '12px', background: n.is_read ? '#f9fafb' : '#eff6ff', border: n.is_read ? 'none' : '1px solid #bfdbfe' }}>
                        <span style={{ marginTop: '2px', flexShrink: 0, color: meta.color }}>{meta.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', lineHeight: '1.4', color: n.is_read ? '#4b5563' : '#1f2937', fontWeight: n.is_read ? '400' : '500', margin: 0 }}>
                            {n.message}
                          </p>
                          <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                            {new Date(n.created_at).toLocaleDateString("en-US", {
                              month: "short", day: "numeric",
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </p>
                        </div>
                        {!n.is_read && (
                          <span style={{ position: 'relative', display: 'flex', height: '8px', width: '8px', flexShrink: 0, marginTop: '4px' }}>
                            <span style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', background: '#3b82f6', opacity: 0.75 }} />
                            <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '6px', width: '6px', background: '#3b82f6' }} />
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 50,
          background: toast.type === "success" ? '#059669' : toast.type === "error" ? '#dc2626' : '#2563eb',
          color: 'white',
          fontSize: '14px',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          maxWidth: '448px'
        }}>
          {toast.type === "success" && <span style={{ fontSize: '20px', flexShrink: 0 }}>✅</span>}
          {toast.type === "error" && <span style={{ fontSize: '20px', flexShrink: 0 }}>❌</span>}
          <span style={{ wordBreak: 'break-word' }}>{toast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}