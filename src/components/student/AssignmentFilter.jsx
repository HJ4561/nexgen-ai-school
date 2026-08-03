/**
 * ============================================
 * ASSIGNMENT FILTERS COMPONENT
 * ============================================
 * 
 * Purpose: Filtering controls for assignment management
 * Features:
 * - Search input for assignment titles
 * - Status filter dropdown (All Status, Pending, Submitted, Graded)
 * - Subject filter dropdown with dynamic options
 * - Responsive grid layout (1 column mobile, 3 columns desktop)
 * - Consistent card styling with border and surface background
 * - Clean outline styling with focus states
 * 
 * Dependencies:
 * - React
 * 
 * Usage:
 * <AssignmentFilters
 *   search={search}
 *   setSearch={setSearch}
 *   status={status}
 *   setStatus={setStatus}
 *   subject={subject}
 *   setSubject={setSubject}
 *   subjects={subjectsList}
 * />
 * ============================================
 */

/**
 * ============================================
 * ASSIGNMENT FILTERS COMPONENT
 * ============================================
 * 
 * Renders filter controls for assignment management
 * 
 * @param {Object} props - Component props
 * @param {string} props.search - Current search query value
 * @param {Function} props.setSearch - Setter function for search state
 * @param {string} props.status - Current status filter value
 * @param {Function} props.setStatus - Setter function for status filter
 * @param {string} props.subject - Current subject filter value
 * @param {Function} props.setSubject - Setter function for subject filter
 * @param {Array} props.subjects - Array of subject options for dropdown
 * @returns {JSX.Element} Assignment filters UI
 * 
 * @example
 * const [search, setSearch] = useState('');
 * const [status, setStatus] = useState('');
 * const [subject, setSubject] = useState('');
 * const subjects = ['Mathematics', 'Science', 'English'];
 * 
 * <AssignmentFilters
 *   search={search}
 *   setSearch={setSearch}
 *   status={status}
 *   setStatus={setStatus}
 *   subject={subject}
 *   setSubject={setSubject}
 *   subjects={subjects}
 * />
 * ============================================
 */
function AssignmentFilters({
  search,
  setSearch,
  status,
  setStatus,
  subject,
  setSubject,
  subjects,
}) {
  return (
    <div className="grid gap-4 rounded-card border border-slate-200 bg-surface p-5 md:grid-cols-3">
      {/* ─── Search Input ─── */}
      <input
        type="text"
        placeholder="Search assignment..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-lg border border-slate-200 px-4 py-3 outline-none"
      />

      {/* ─── Status Filter Dropdown ─── */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg border border-slate-200 px-4 py-3 outline-none"
      >
        <option value="">All Status</option>
        <option value="Pending">Pending</option>
        <option value="Submitted">Submitted</option>
        <option value="Graded">Graded</option>
      </select>

      {/* ─── Subject Filter Dropdown ─── */}
      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="rounded-lg border border-slate-200 px-4 py-3 outline-none"
      >
        <option value="">All Subjects</option>
        {subjects.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

export default AssignmentFilters;