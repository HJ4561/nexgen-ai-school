/**
 * ============================================
 * PROFILE CARD COMPONENT
 * ============================================
 * 
 * Purpose: Display user profile information in a card layout
 * Used across: All modules (student, teacher, parent, admin)
 * 
 * Features:
 * - Avatar image support or generated initials avatar
 * - User name, role, and email display
 * - Additional metadata section (subtitle, meta1, meta2)
 * - Responsive: stacks vertically on mobile, horizontal on desktop
 * - Custom background styling
 * - Hover effects
 * 
 * Common Use Cases:
 * - Student Profile Card
 * - Teacher Profile Card
 * - Parent Profile Card
 * - Admin Profile Card
 * - Team Member Cards
 * 
 * Dependencies:
 * - Card component for container
 * - Lucide React icons
 * ============================================
 */

import Card from '@/components/ui/Card';
import {
  Mail,
  UserRound,
} from 'lucide-react';

/**
 * ProfileCard Component
 * 
 * @component
 * @param {Object} props
 * @param {string} props.name - User's full name
 * @param {string} props.role - User's role or designation
 * @param {string} props.email - User's email address
 * @param {string} props.avatar - Profile image URL (optional)
 * @param {string} props.subtitle - Additional information or description (optional)
 * @param {string} props.bgColor - Custom background classes (optional)
 * @param {string} props.meta1 - Additional metadata line (optional)
 * @param {string} props.meta2 - Additional metadata line (optional)
 * @param {string} props.className - Additional custom classes (optional)
 * @returns {JSX.Element} Rendered profile card
 * 
 * @example
 * // Student Profile
 * <ProfileCard
 *   name="Fazail Nadeem"
 *   role="Student"
 *   email="student@school.edu"
 *   subtitle="Class 10 - Computer Science"
 *   meta1="Roll Number: 2025-CS-01"
 *   meta2="Section: A"
 * />
 * 
 * @example
 * // Teacher Profile with Avatar
 * <ProfileCard
 *   name="Ali Hassan"
 *   role="Teacher"
 *   email="teacher@school.edu"
 *   avatar="/images/teacher.jpg"
 *   subtitle="Computer Science Department"
 *   meta1="Experience: 5 Years"
 *   meta2="Classes Assigned: 10th & 11th"
 * />
 */
function ProfileCard({
  name,
  role,
  email,
  avatar,
  subtitle,
  bgColor,
  meta1,
  meta2,
  className = '',
}) {
  return (
    <Card
      hover
      bgColor={bgColor}
      className={`
        bg-gradient-to-br
        from-white
        via-slate-50
        to-blue-50
        w-full
        ${className}
      `}
    >
      {/* ==================================================
          Profile Header
          Displays avatar and basic user information.
          Stacks vertically + centered on very small screens,
          switches to a horizontal row from `sm` upward.
      ================================================== */}
      <div
        className="
          flex flex-col md:flex-row-col
          items-center
          text-center
          gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 sm:flex-row
          sm:items-start
          sm:text-left
          sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 sm:p-4 sm:p-6 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8"
      >
        {/* Avatar */}
        {avatar ? (
          /*
          ==================================================
          User profile image
          ==================================================
          */
          <img
            src={avatar}
            alt={name}
            className="
              h-14
              w-14
              shrink-0
              rounded-full
              object-cover
              ring-4
              ring-brand-primary/20
              sm:h-16
              sm:w-16
             px-4 sm:px-6 lg:px-8"
          />
        ) : (
          /*
          ==================================================
          Fallback avatar using first letter of name
          ==================================================
          */
          <div
            className="
              flex flex-col md:flex-row h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-brand-primary
              to-parent-primary
              text-xl md:text-2xl md:text-2xl font-bold
              text-white
              shadow-lg
              sm:h-16
              sm:w-16
              sm:text-2xl md:text-3xl px-4 sm:px-6 lg:px-8"
          >
            {name?.charAt(0)}
          </div>
        )}

        {/* ==================================================
            User Information
        ================================================== */}
        <div className="w-full min-w-0 flex-1 px-4 sm:px-6 lg:px-8">
          {/* User Name */}
          <h3 className="truncate text-lg md:text-xl md:text-2xl font-bold text-text-primary sm:text-xl md:text-2xl md:text-2xl px-4 sm:px-6 lg:px-8">
            {name}
          </h3>

          {/* User Role */}
          <div
            className="
              mt-1
              flex flex-col md:flex-row items-center
              justify-center
              gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 text-sm md:text-base md:text-base text-text-secondary
              sm:justify-start
              sm:text-base
             px-4 sm:px-6 lg:px-8"
          >
            <UserRound size={16} className="shrink-0 px-4 sm:px-6 lg:px-8" />
            <span className="truncate px-4 sm:px-6 lg:px-8">{role}</span>
          </div>

          {/* User Email */}
          {email && (
            <div
              className="
                mt-2
                flex flex-col md:flex-row items-center
                justify-center
                gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 text-sm md:text-base md:text-base text-text-secondary
                sm:justify-start
               px-4 sm:px-6 lg:px-8"
            >
              <Mail size={16} className="shrink-0 px-4 sm:px-6 lg:px-8" />
              <span className="truncate px-4 sm:px-6 lg:px-8">{email}</span>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================
          Additional Information Section
          Rendered only if at least one piece of
          extra information is provided
      ================================================== */}
      {(subtitle || meta1 || meta2) && (
        <div className="mt-5 border-t border-slate-200 pt-4 text-center sm:mt-6 sm:text-left px-4 sm:px-6 lg:px-8">
          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm md:text-base md:text-base text-text-primary break-words px-4 sm:px-6 lg:px-8">
              {subtitle}
            </p>
          )}

          {/* First Metadata Line */}
          {meta1 && (
            <p className="mt-2 text-sm md:text-base md:text-base text-text-secondary break-words px-4 sm:px-6 lg:px-8">
              {meta1}
            </p>
          )}

          {/* Second Metadata Line */}
          {meta2 && (
            <p className="mt-1 text-sm md:text-base md:text-base text-text-secondary break-words px-4 sm:px-6 lg:px-8">
              {meta2}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

export default ProfileCard;















