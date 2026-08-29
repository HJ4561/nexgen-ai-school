import { useSelector, useDispatch } from 'react-redux';
import { setActiveChild } from '@/store/chat/chatSlice';

export default function ChildSelector() {
  const dispatch = useDispatch();
  const children = useSelector((s) => s.auth.user?.children) || [];
  const activeChild = useSelector((s) => s.chat.activeChild);
  const role = useSelector((s) => s.auth.user?.role);

  // Only show for parents with children
  if (role !== 'parent' || children.length === 0) return null;

  return (
    <div className="relative min-w-[120px] sm:min-w-[140px] md:min-w-[160px]">
      <select
        value={activeChild || ''}
        onChange={(e) => dispatch(setActiveChild(e.target.value))}
        className="w-full appearance-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg 
                   px-3 sm:px-3.5 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base 
                   text-white placeholder-white/50 focus:outline-none focus:ring-2 
                   focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all
                   cursor-pointer hover:bg-white/15"
        aria-label="Select child"
      >
        <option value="" className="text-gray-800 bg-white">
          All children
        </option>
        {children.map((child) => (
          <option key={child.id} value={child.id} className="text-gray-800 bg-white">
            {child.name}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/60">
        <svg 
          className="w-3 h-3 sm:w-3.5 sm:h-3.5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}