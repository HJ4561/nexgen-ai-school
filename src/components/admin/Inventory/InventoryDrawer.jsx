import Button from '@/components/ui/Button';
import Drawer from '@/components/admin/Drawer';

export default function InventoryDrawer({
  isOpen,
  onClose,
  mode,
  formData,
  setFormData,
  onSave,
  loading,
}) {
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add New Item' : 'Edit Item'}
      width="max-w-[380px]"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" tone="admin" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" tone="admin" fullWidth onClick={onSave} disabled={loading}>
            {mode === 'add' ? 'Add' : 'Save'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Item Name <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            type="text"
            value={formData.item_name || ''}
            onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
            placeholder="e.g., MacBook Air M2"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Category <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            type="text"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Electronics, Furniture, Stationery, Sports, Other"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Total Quantity <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            type="number"
            value={formData.total_quantity || ''}
            onChange={(e) => setFormData({ ...formData, total_quantity: parseInt(e.target.value) || '' })}
            placeholder="e.g., 45"
            min="0"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Assigned Room
          </label>
          <input
            type="text"
            value={formData.assigned_to_room || ''}
            onChange={(e) => setFormData({ ...formData, assigned_to_room: e.target.value })}
            placeholder="e.g., IT Lab, Room 101"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent text-sm"
          />
        </div>
      </div>
    </Drawer>
  );
}
