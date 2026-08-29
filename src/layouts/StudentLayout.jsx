/**
 * ============================================
 * STUDENT LAYOUT COMPONENT
 * ============================================
 * 
 * Purpose: Layout wrapper for all student pages
 * Used by: Student module routes
 * 
 * Features:
 * - Student-specific sidebar navigation
 * - Student header with profile dropdown
 * - Role-based theming
 * - Responsive sidebar (collapsible on mobile)
 * - Breadcrumb navigation
 * - Full width content with proper max-width
 * ============================================
 */

import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

function StudentLayout() {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar - Fixed on desktop, hidden on mobile */}
      <StudentSidebar />
      
      {/* Main Content Area - Takes remaining width */}
      <div className="flex-1 flex flex-col w-full min-w-0 overflow-hidden">
        {/* Header - Fixed height */}
        <StudentHeader />
        
        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto w-full bg-slate-50">
          {/* Content wrapper with full width and proper max-width */}
          <div className="w-full min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;