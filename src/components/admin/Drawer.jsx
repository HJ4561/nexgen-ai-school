/**
 * ============================================
 * DRAWER COMPONENT
 * ============================================
 * 
 * Purpose: Right-side sliding panel for admin module
 * Features:
 * - Slides in from right with smooth animation
 * - Backdrop overlay with click-to-close
 * - Escape key support
 * - Scroll locking when open
 * - Scrollable body content
 * - Sticky footer for action buttons
 * - Customizable width via Tailwind max-w classes
 * - Responsive design
 * - Role-based styling support
 * 
 * Dependencies:
 * - lucide-react for icons (X)
 * - Tailwind CSS for styling
 * 
 * Usage:
 * <Drawer
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Complaint Details"
 *   width="max-w-[480px]"
 *   footer={<Button onClick={handleSave}>Save</Button>}
 * >
 *   <p>Drawer content goes here</p>
 * </Drawer>
 * ============================================
 */

import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * ============================================
 * DRAWER COMPONENT
 * ============================================
 * 
 * Renders a sliding drawer panel from the right side
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls drawer visibility
 * @param {Function} props.onClose - Callback function when drawer should close
 * @param {string} props.title - Drawer heading text
 * @param {JSX} props.children - Scrollable body content
 * @param {JSX} props.footer - Sticky bottom section (action buttons, etc.)
 * @param {string} props.width - Tailwind max-w class (default: "max-w-[320px]")
 * @returns {JSX.Element|null} Drawer panel or null if not open
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * <Drawer
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Complaint Details"
 *   width="max-w-[480px]"
 *   footer={
 *     <div className="flex gap-3">
 *       <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button variant="primary" onClick={handleSave}>Save</Button>
 *     </div>
 *   }
 * >
 *   <p>Drawer content goes here</p>
 * </Drawer>
 * ============================================
 */
export default function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  width = "max-w-[320px]",
}) {
  /**
   * ============================================
   * ESCAPE KEY HANDLER
   * ============================================
   * 
   * Closes the drawer when Escape key is pressed
   * Only active when drawer is open
   */
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  /**
   * ============================================
   * BODY SCROLL LOCK
   * ============================================
   * 
   * Prevents body scrolling when drawer is open
   * Restores scroll when drawer closes
   * Cleanup on unmount
   */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Return null if drawer is not open
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* ─── Backdrop ─── */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* ─── Drawer Panel ─── */}
      <aside
        className={`absolute right-0 top-0 bottom-0 w-full ${width} bg-white flex flex-col shadow-2xl border-l border-gray-200 animate-slide-in-right`}
      >
        {/* ─── Header ─── */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            {title}
          </h2>
          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-[var(--color-text-secondary)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── Scrollable Body ─── */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
          {children}
        </div>

        {/* ─── Sticky Footer ─── */}
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
            {footer}
          </div>
        )}
      </aside>

      {/* ─── Slide-in Animation ─── */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
      `}</style>
    </div>
  );
}