/**
 * ============================================
 * NAVBAR COMPONENT
 * ============================================
 * 
 * Purpose: Top navigation bar for authenticated dashboards
 * Features:
 * - User avatar with initials
 * - User name and role display
 * - Optional search bar
 * - Notification bell with unread count
 * - Settings button
 * - Logout button
 * - Role-based theming
 * - Fully responsive
 * - Hamburger menu for mobile
 * 
 * Usage:
 * <Navbar
 *   logo="Edupulse"
 *   tone="admin"
 *   search={{ value: query, onChange: handleChange, onSearch: doSearch }}
 *   notificationCount={3}
 *   onNotificationClick={() => navigate('/notifications')}
 *   userName="Ali Khan"
 *   userRole="Admin"
 *   onSettingsClick={() => navigate('/settings')}
 *   onLogout={handleLogout}
 *   onMenuClick={toggleSidebar}
 * />
 * ============================================
 */

import React, { useState, useCallback } from 'react';
import { Bell, Settings, LogOut, Search, X, Menu } from 'lucide-react';
import Searchbar from "@/components/layout/SearchBar";
import Badge from '@/components/ui/Badge';

function Navbar({
  logo,
  search,
  notificationCount = 0,
  onNotificationClick,
  userName,
  userRole,
  onSettingsClick,
  onLogout,
  onMenuClick,
  tone = 'brand',
  isMobile = false,
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
    : 'U';

  // Toggle mobile search
  const toggleMobileSearch = useCallback(() => {
    setMobileSearchOpen(prev => !prev);
  }, []);

  return (
    <header className="border-b border-surface-muted bg-surface sticky top-0 z-30">
      {/* -- MAIN ROW -- */}
      <div className="flex h-14 sm:h-16 items-center justify-between gap-2 px-3 sm:px-4 md:px-6 lg:px-8">
        {/* -- LEFT: Hamburger (mobile) + User Info -- */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Hamburger Menu - Mobile Only */}
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden rounded-input p-1.5 sm:p-2 text-text-secondary hover:bg-surface-dim transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} className="sm:w-5 sm:h-5" />
            </button>
          )}

          {/* User Avatar + Name */}
          {userName && (
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs sm:text-sm font-semibold text-brand-text">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-xs sm:text-sm font-medium text-text-primary truncate max-w-[120px] sm:max-w-[180px] md:max-w-[220px]">
                  {userName}
                </span>
                {userRole && (
                  <span className="hidden sm:block text-[10px] sm:text-xs text-text-secondary truncate">
                    {userRole}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Logo */}
          {logo && (
            <span className="hidden md:inline text-base sm:text-lg font-semibold text-text-primary truncate">
              {logo}
            </span>
          )}
        </div>

        {/* -- CENTER: Search Bar (tablet/desktop only) -- */}
        {search && (
          <div className="hidden md:block flex-1 max-w-xs lg:max-w-md mx-2 lg:mx-4">
            <Searchbar tone={tone} {...search} />
          </div>
        )}

        {/* -- RIGHT: Actions -- */}
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 shrink-0">
          {/* Search toggle - mobile only */}
          {search && (
            <button
              type="button"
              onClick={toggleMobileSearch}
              className="md:hidden rounded-input p-1.5 sm:p-2 text-text-secondary hover:bg-surface-dim transition-colors"
              aria-label={mobileSearchOpen ? "Close search" : "Open search"}
            >
              {mobileSearchOpen ? <X size={18} className="sm:w-5 sm:h-5" /> : <Search size={18} className="sm:w-5 sm:h-5" />}
            </button>
          )}

          {/* Notification Bell */}
          {onNotificationClick && (
            <button
              type="button"
              onClick={onNotificationClick}
              className="relative rounded-input p-1.5 sm:p-2 text-text-secondary hover:bg-surface-dim transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} className="sm:w-5 sm:h-5" />
              {notificationCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5">
                  <Badge color="danger" className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                </span>
              )}
            </button>
          )}

          {/* Settings Icon */}
          {onSettingsClick && (
            <button
              type="button"
              onClick={onSettingsClick}
              className="hidden sm:inline-flex rounded-input p-1.5 sm:p-2 text-text-secondary hover:bg-surface-dim transition-colors"
              title="Settings"
              aria-label="Settings"
            >
              <Settings size={18} className="sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Logout Icon */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-input p-1.5 sm:p-2 text-text-secondary hover:bg-danger-light hover:text-danger transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={18} className="sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>

      {/* -- MOBILE SEARCH ROW -- */}
      {search && mobileSearchOpen && (
        <div className="border-t border-surface-muted px-3 py-2 md:hidden">
          <Searchbar tone={tone} {...search} size="sm" />
        </div>
      )}
    </header>
  );
}

export default Navbar;