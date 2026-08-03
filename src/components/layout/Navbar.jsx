/**
 * ============================================
 * NAVBAR COMPONENT
 * ============================================
 * 
 * Purpose: Top navigation bar for authenticated dashboards
 * Used by: Admin, Teacher, Student, Parent dashboards
 * 
 * Features:
 * - User avatar with initials
 * - User name and role display (truncates safely on narrow screens)
 * - Optional search bar — inline on tablet/desktop, collapses to an
 *   icon that opens a full-width row on phones
 * - Notification bell with unread count
 * - Settings button
 * - Logout button
 * - Role-based theming
 * - Responsive from small phones up to ultra-wide desktops
 * 
 * Structure (md and up):
 * ┌─────────────────────────────────────────────────────┐
 * │ [Avatar] Name    │ [Search]    │ [🔔][⚙️][🚪]     │
 * │ [Role]           │             │                    │
 * └─────────────────────────────────────────────────────┘
 *
 * Structure (below md, search toggled open):
 * ┌─────────────────────────────────────────────────────┐
 * │ [Avatar] Name           │        [🔍][🔔][⚙️][🚪]  │
 * ├─────────────────────────────────────────────────────┤
 * │ [Search..........................................] │
 * └─────────────────────────────────────────────────────┘
 * ============================================
 */

import React, { useState } from 'react';
import { Bell, Settings, LogOut, Search, X } from 'lucide-react';
import Searchbar from "@/components/layout/SearchBar";
import Badge from '@/components/ui/Badge';

/**
 * NAVBAR
 *
 * The top bar that sits above every page in a dashboard (Admin/Teacher).
 * Rendered once inside your layout, not on every individual page.
 *
 * Params you can pass:
 *  - logo: what to show on the left, e.g. "Edupulse" (text or your own element)
 *  - search: an object { value, onChange, onSearch } — if you pass this,
 *    a SearchBar shows inline on md+ screens, and collapses behind a
 *    search icon on phones. Leave it out to hide search entirely.
 *  - notificationCount: number → shows a small badge on the bell icon
 *    if greater than 0 (e.g. unread notifications). Leave out or 0 to hide it.
 *  - onNotificationClick: function — runs when the bell icon is clicked
 *  - userName: the logged-in user's name, e.g. "Ali Khan"
 *  - userRole: shown under the name, e.g. "Admin" or "Teacher"
 *  - onSettingsClick: function — runs when Settings icon is clicked
 *  - onLogout: function — runs when Logout icon is clicked
 *  - tone: role color → "brand" | "admin" | "teacher" | "student" | "parent"
 *
 * Note: Hamburger menu is removed because Sidebar component handles mobile toggle.
 *
 * Example:
 *   <Navbar
 *     logo="Edupulse"
 *     tone="admin"
 *     search={{ value: query, onChange: (e) => setQuery(e.target.value), onSearch: doSearch }}
 *     notificationCount={3}
 *     onNotificationClick={() => navigate('/notifications')}
 *     userName="Ali Khan"
 *     userRole="Admin"
 *     onSettingsClick={() => navigate('/settings')}
 *     onLogout={handleLogout}
 *   />
 */
function Navbar({
  logo,
  search,
  notificationCount = 0,
  onNotificationClick,
  userName,
  userRole,
  onSettingsClick,
  onLogout,
  tone = 'brand',
}) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Generate initials from user name
  const initials = userName
    ? userName
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  return (
    <header className="border-b border-surface-muted bg-surface">
      {/* ── MAIN ROW ── */}
      <div className="flex h-16 items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4">
        {/* ── LEFT: User Avatar + Name + Logo ── */}
        <div className="flex items-center gap-2 sm:gap-3 ml-14 lg:ml-0 min-w-0">
          {userName && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-semibold text-brand-text">
                {initials}
              </span>
              <span className="text-left min-w-0">
                <span className="block text-sm font-medium text-text-primary truncate max-w-[38vw] sm:max-w-[220px]">
                  {userName}
                </span>
                {userRole && (
                  <span className="hidden sm:block text-xs text-text-secondary truncate">
                    {userRole}
                  </span>
                )}
              </span>
            </div>
          )}
          {logo && (
            <span className="hidden md:inline text-lg font-semibold text-text-primary truncate">
              {logo}
            </span>
          )}
        </div>

        {/* ── CENTER: Search Bar (tablet/desktop only) ── */}
        {search && (
          <div className="hidden flex-1 max-w-md md:block">
            <Searchbar tone={tone} {...search} />
          </div>
        )}

        {/* ── RIGHT: Search toggle (mobile) + Notification + Settings + Logout ── */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
          {/* Search icon — phones only, opens the row below */}
          {search && (
            <button
              type="button"
              onClick={() => setMobileSearchOpen((open) => !open)}
              className="rounded-input p-2 text-text-secondary hover:bg-surface-dim md:hidden"
              aria-label={mobileSearchOpen ? "Close search" : "Open search"}
            >
              {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
          )}

          {/* Notification Bell */}
          {onNotificationClick && (
            <button
              type="button"
              onClick={onNotificationClick}
              className="relative rounded-input p-2 text-text-secondary hover:bg-surface-dim"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1">
                  <Badge color="danger">{notificationCount}</Badge>
                </span>
              )}
            </button>
          )}

          {/* Settings Icon */}
          {onSettingsClick && (
            <button
              type="button"
              onClick={onSettingsClick}
              className="hidden sm:inline-flex rounded-input p-2 text-text-secondary hover:bg-surface-dim"
              title="Settings"
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
          )}

          {/* Logout Icon */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-input p-2 text-text-secondary hover:bg-danger-light hover:text-danger transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>

      {/* ── MOBILE SEARCH ROW — only rendered when toggled open on phones ── */}
      {search && mobileSearchOpen && (
        <div className="border-t border-surface-muted px-3 py-2 md:hidden">
          <Searchbar tone={tone} {...search} />
        </div>
      )}
    </header>
  );
}

export default Navbar;