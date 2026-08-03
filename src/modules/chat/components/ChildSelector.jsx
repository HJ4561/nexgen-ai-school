import { useSelector, useDispatch } from 'react-redux';
import { setActiveChild } from '@/store/chat/chatSlice';

export default function ChildSelector() {
  const dispatch = useDispatch();
  const children = useSelector((s) => s.auth.user?.children) || [];
  const activeChild = useSelector((s) => s.chat.activeChild);
  const role = useSelector((s) => s.auth.user?.role);

  if (role !== 'parent' || children.length === 0) return null;

  return (
    <select
      value={activeChild || ''}
      onChange={(e) => dispatch(setActiveChild(e.target.value))}
      className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-sm"
    >
      <option value="">All children</option>
      {children.map((child) => (
        <option key={child.id} value={child.id}>
          {child.name}
        </option>
      ))}
    </select>
  );
}
