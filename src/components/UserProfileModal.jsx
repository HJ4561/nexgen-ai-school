/**
 * ============================================
 * USER PROFILE MODAL COMPONENT
 * ============================================
 * 
 * Purpose: Modal for viewing detailed user profile information
 * Used by: Admin - User Profile Management page
 * 
 * Features:
 * - Role-based styling (Student, Teacher, Parent)
 * - Avatar with initials
 * - Account information section
 * - Role-specific details (Academic, Professional, Parent)
 * - Status badge
 * - Responsive design
 * - Close button in header and footer
 * - Backdrop blur effect
 * 
 * Role Sections:
 * - Student: Roll Number, Registration, Class, Scholarship, Guardian, DOB
 * - Teacher: CNIC, Qualification, Specialization, Joining Date
 * - Parent: User ID
 * 
 * Dependencies:
 * - Badge component for status
 * - Lucide React icons
 * ============================================
 */

import { X, User, Mail, IdCard, Calendar, Phone, GraduationCap, BookOpen, Award, Users, BadgeCheck } from 'lucide-react';
import Badge from '@/components/ui/Badge';

// ─── Helpers ────────────────────────────────────────────────────────────────
const getInitials = (name) =>
  name?.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() || '??';

// ─── Role‑specific Tailwind classes ──────────────────────────────────────
const ROLE_CLASSES = {
  student: {
    label: 'Student',
    icon: <BookOpen size={20} />,
    bg: 'bg-student-light',
    border: 'border-student-primary',
    avatarBg: 'bg-student-primary',
    text: 'text-student-primary',
    iconBg: 'bg-student-primary/20',
  },
  teacher: {
    label: 'Teacher',
    icon: <GraduationCap size={20} />,
    bg: 'bg-teacher-light',
    border: 'border-teacher-primary',
    avatarBg: 'bg-teacher-primary',
    text: 'text-teacher-primary',
    iconBg: 'bg-teacher-primary/20',
  },
  parent: {
    label: 'Parent',
    icon: <Users size={20} />,
    bg: 'bg-parent-light',
    border: 'border-parent-primary',
    avatarBg: 'bg-parent-primary',
    text: 'text-parent-primary',
    iconBg: 'bg-parent-primary/20',
  },
};

/**
 * UserProfileModal Component
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Called when modal closes
 * @param {Object} props.user - User data object
 * @param {string} props.role - User role (student, teacher, parent)
 * @param {Array} props.classOptions - Available class options for display
 * @returns {JSX.Element|null} Rendered modal or null if closed
 * 
 * @example
 * <UserProfileModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   user={selectedUser}
 *   role="student"
 *   classOptions={classOptions}
 * />
 */
export default function UserProfileModal({ isOpen, onClose, user, role, classOptions }) {
  // ─── Return null if modal is closed or no user ──────────────────────────
  if (!isOpen || !user) return null;

  // ─── Role classes and helpers ────────────────────────────────────────────
  const classes = ROLE_CLASSES[role] || ROLE_CLASSES.student;
  const initials = getInitials(user.full_name);
  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';
  const isParent = role === 'parent';

  // ─── Helper: Get class name from ID ──────────────────────────────────────
  const getClassName = (classId) => {
    const found = classOptions?.find(c => c.value === classId);
    return found?.label || classId || '—';
  };

  const status = 'Active';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[520px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200/50">
        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <div className={`${classes.bg} border-b ${classes.border} px-6 py-5 flex items-start justify-between`}>
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className={`w-16 h-16 rounded-full ${classes.avatarBg} text-white flex items-center justify-center text-2xl font-bold shadow-lg ring-4 ring-white/50`}>
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">{user.full_name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <Badge color="success" className="text-[11px] font-bold px-3 py-0.5">
                  <BadgeCheck size={12} className="inline mr-1" /> {status}
                </Badge>
                <span className={`text-sm font-medium ${classes.text} flex items-center gap-1.5`}>
                  {classes.icon} {classes.label}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 transition-colors text-text-muted hover:text-text-primary"
          >
            <X size={22} />
          </button>
        </div>

        {/* ─── Body ────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* ─── Account Info Section ──────────────────────────────────────── */}
          <div>
            <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2 mb-3">
              <User size={14} className="text-text-muted" /> Account Information
            </h4>
            <div className="grid grid-cols-2 gap-4 bg-surface-dim/50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-gray-100 rounded-lg">
                  <User size={16} className="text-text-muted" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Full Name</p>
                  <p className="text-sm font-medium text-text-primary truncate">{user.full_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-gray-100 rounded-lg">
                  <Mail size={16} className="text-text-muted" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Email</p>
                  <p className="text-sm text-text-primary break-all">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Student Section ───────────────────────────────────────────── */}
          {isStudent && (
            <>
              <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-student-primary" /> Academic Details
              </h4>
              <div className={`${classes.bg} border ${classes.border} grid grid-cols-2 gap-4 p-4 rounded-xl`}>
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg ${classes.iconBg}`}>
                    <IdCard size={16} className={classes.text} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Roll Number</p>
                    <p className="text-sm font-mono text-text-primary">{user.roll_number || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg ${classes.iconBg}`}>
                    <IdCard size={16} className={classes.text} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Registration</p>
                    <p className="text-sm font-mono text-text-primary">{user.registration_number || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg ${classes.iconBg}`}>
                    <GraduationCap size={16} className={classes.text} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Class</p>
                    <p className="text-sm text-text-primary">{getClassName(user.class_section)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg ${classes.iconBg}`}>
                    <Award size={16} className={classes.text} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Scholarship</p>
                    <p className={`text-sm font-semibold ${classes.text}`}>{user.scholarship_percentage || 0}%</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 col-span-2">
                  <div className={`p-1.5 rounded-lg ${classes.iconBg}`}>
                    <Phone size={16} className={classes.text} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full min-w-0">
                    <div>
                      <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Guardian</p>
                      <p className="text-sm text-text-primary truncate">{user.guardian_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Guardian Phone</p>
                      <p className="text-sm text-text-primary truncate">{user.guardian_phone || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 col-span-2">
                  <div className={`p-1.5 rounded-lg ${classes.iconBg}`}>
                    <Calendar size={16} className={classes.text} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Date of Birth</p>
                    <p className="text-sm text-text-primary">{user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : '—'}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── Teacher Section ───────────────────────────────────────────── */}
          {isTeacher && (
            <>
              <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2 mb-3">
                <GraduationCap size={14} className="text-teacher-primary" /> Professional Details
              </h4>
              <div className={`${classes.bg} border ${classes.border} grid grid-cols-2 gap-4 p-4 rounded-xl`}>
                <div className="flex items-start gap-2.5 col-span-2">
                  <div className={`p-1.5 rounded-lg ${classes.iconBg}`}>
                    <IdCard size={16} className={classes.text} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">CNIC</p>
                    <p className="text-sm font-mono text-text-primary">{user.cnic || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg ${classes.iconBg}`}>
                    <Award size={16} className={classes.text} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Qualification</p>
                    <p className="text-sm text-text-primary truncate">{user.qualification || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg ${classes.iconBg}`}>
                    <Award size={16} className={classes.text} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Specialization</p>
                    <p className="text-sm text-text-primary truncate">{user.specialization || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 col-span-2">
                  <div className={`p-1.5 rounded-lg ${classes.iconBg}`}>
                    <Calendar size={16} className={classes.text} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Joining Date</p>
                    <p className="text-sm text-text-primary">{user.joining_date ? new Date(user.joining_date).toLocaleDateString() : '—'}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── Parent Section ───────────────────────────────────────────── */}
          {isParent && (
            <>
              <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2 mb-3">
                <Users size={14} className="text-parent-primary" /> Parent Details
              </h4>
              <div className={`${classes.bg} border ${classes.border} grid grid-cols-2 gap-4 p-4 rounded-xl`}>
                <div className="flex items-start gap-2.5 col-span-2">
                  <div className={`p-1.5 rounded-lg ${classes.iconBg}`}>
                    <IdCard size={16} className={classes.text} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">User ID</p>
                    <p className="text-sm font-mono text-text-primary">{user.user || user.id || '—'}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ─── Footer ──────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-sm hover:shadow transition-all ${classes.avatarBg}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}