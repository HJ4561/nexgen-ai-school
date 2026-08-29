/**
 * ============================================
 * SEND NOTIFICATION DRAWER COMPONENT
 * ============================================
 * 
 * Purpose: Send notifications to users with role-based or specific targeting
 * Features:
 * - Recipient type selection (Role-based or Specific User)
 * - Role-based targeting (Students, Teachers, Parents, All Users)
 * - Specific user search with autocomplete dropdown
 * - User selection with name, email, and role display
 * - Selected user badge with clear option
 * - Message textarea with validation
 * - Loading state during send
 * - Responsive drawer layout
 * - Admin-themed styling
 * 
 * Dependencies:
 * - lucide-react for icons (Send, Search, X)
 * - @/components/ui/Button for action buttons
 * - @/components/ui/Select for dropdowns
 * - @/components/admin/Drawer for sliding panel
 * 
 * Usage:
 * <SendNotificationDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   form={form}
 *   setForm={setForm}
 *   onSend={handleSend}
 *   loading={isSending}
 *   users={usersList}
 * />
 * ============================================
 */

import { useState, useMemo } from 'react';
import { Send, Search, X } from 'lucide-react';
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Drawer from "@/components/admin/Drawer";

/**
 * ============================================
 * SEND NOTIFICATION DRAWER COMPONENT
 * ============================================
 * 
 * Renders a drawer for composing and sending notifications
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls drawer visibility
 * @param {Function} props.onClose - Callback function to close the drawer
 * @param {Object} props.form - Form data object containing notification fields
 * @param {Function} props.setForm - Setter function for form data
 * @param {Function} props.onSend - Callback function to send the notification
 * @param {boolean} props.loading - Loading state for send operation
 * @param {Array} props.users - Array of user objects for recipient search
 * @returns {JSX.Element} Send notification drawer UI
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [form, setForm] = useState({
 *   recipientType: 'role',
 *   target_role: 'Student',
 *   receiver_id: '',
 *   receiver_name: '',
 *   receiver_role: '',
 *   message: ''
 * });
 * 
 * <SendNotificationDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   form={form}
 *   setForm={setForm}
 *   onSend={handleSend}
 *   loading={isSending}
 *   users={users}
 * />
 * ============================================
 */
export default function SendNotificationDrawer({
  isOpen,
  onClose,
  form,
  setForm,
  onSend,
  loading,
  users = [],
}) {
  // ─── State Management ──────────────────────────────────────────────
  const [searchUser, setSearchUser] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  /**
   * ============================================
   * USERS LIST VALIDATION
   * ============================================
   * 
   * Ensures users is always an array to prevent rendering errors
   */
  const usersList = Array.isArray(users) ? users : [];

  /**
   * ============================================
   * FILTER USERS
   * ============================================
   * 
   * Filters users based on search query
   * Searches by full_name, email, or role_name
   * Limits results to 10 for performance
   */
  const filteredUsers = useMemo(() => {
    if (!searchUser.trim()) return usersList.slice(0, 10);
    const q = searchUser.toLowerCase();
    return usersList.filter(u =>
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role_name?.toLowerCase().includes(q)
    );
  }, [usersList, searchUser]);

  /**
   * ============================================
   * SELECT USER
   * ============================================
   * 
   * Handles user selection from dropdown
   * Updates form with selected user data
   * Closes dropdown and sets search input
   * 
   * @param {Object} user - Selected user object
   */
  const handleSelectUser = (user) => {
    setForm({
      ...form,
      receiver_id: user.id,
      receiver_name: user.full_name,
      receiver_role: user.role_name,
    });
    setSearchUser(user.full_name);
    setIsDropdownOpen(false);
  };

  /**
   * ============================================
   * CLEAR SELECTED USER
   * ============================================
   * 
   * Clears the selected user from form
   * Resets search input
   */
  const handleClearUser = () => {
    setForm({ ...form, receiver_id: '', receiver_name: '', receiver_role: '' });
    setSearchUser('');
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Send Notification"
      width="max-w-md"
      footer={
        // ─── Drawer Footer with Action Buttons ───
        <div className="flex gap-3">
          <Button
            variant="outline"
            tone="admin"
            fullWidth
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            tone="admin"
            fullWidth
            onClick={onSend}
            disabled={loading || !form.message.trim()}
            leftIcon={<Send size={16} />}
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* ─── Recipient Type ────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Send To <span className="text-danger">*</span>
          </label>
          <Select
            value={form.recipientType}
            onChange={(val) => {
              setForm({ ...form, recipientType: val, receiver_id: '', receiver_name: '' });
              setSearchUser('');
            }}
            options={[
              { value: 'role', label: 'All by Role' },
              { value: 'specific', label: 'Specific User' },
            ]}
            tone="admin"
          />
        </div>

        {/* ─── Role-based Targeting ──────────────────────────────────── */}
        {form.recipientType === 'role' ? (
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Target Role <span className="text-danger">*</span>
            </label>
            <Select
              value={form.target_role}
              onChange={(val) => setForm({ ...form, target_role: val })}
              options={[
                { value: 'Student', label: 'All Students' },
                { value: 'Teacher', label: 'All Teachers' },
                { value: 'Parent', label: 'All Parents' },
                { value: 'All', label: 'All Users' },
              ]}
              tone="admin"
            />
          </div>
        ) : (
          /* ─── Specific User – Searchable Dropdown ────────────────── */
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Search User <span className="text-danger">*</span>
            </label>
            <div className="relative">
              {/* ─── Search Input ─── */}
              <div className="flex items-center border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-admin-primary/20">
                <Search size={16} className="ml-3 text-text-muted shrink-0" />
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => {
                    setSearchUser(e.target.value);
                    setIsDropdownOpen(true);
                    if (form.receiver_id) {
                      setForm({ ...form, receiver_id: '', receiver_name: '', receiver_role: '' });
                    }
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Type user name, email, or role..."
                  className="w-full px-3 py-2 bg-transparent outline-none text-sm"
                />
                {/* Clear button */}
                {searchUser && (
                  <button
                    type="button"
                    onClick={handleClearUser}
                    className="mr-2 text-text-muted hover:text-text-primary"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* ─── Dropdown Results ─── */}
              {isDropdownOpen && filteredUsers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="px-4 py-2 hover:bg-admin-light/50 cursor-pointer transition-colors flex items-center justify-between"
                      onClick={() => handleSelectUser(user)}
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary">{user.full_name}</p>
                        <p className="text-xs text-text-muted">{user.email || 'No email'}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-surface-muted rounded-full text-text-muted">
                        {user.role_name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* ─── Selected User Badge ─── */}
              {form.receiver_id && form.receiver_name && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-admin-light/50 rounded-lg border border-admin-primary/20">
                  <span className="text-sm font-medium text-text-primary">{form.receiver_name}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-white rounded-full text-text-muted">
                    {form.receiver_role}
                  </span>
                  <span className="text-xs text-text-muted">ID: {form.receiver_id}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Message ────────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Message <span className="text-danger">*</span>
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Write your notification message here..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-admin-primary/20 outline-none text-sm resize-none"
          />
        </div>
      </div>
    </Drawer>
  );
}