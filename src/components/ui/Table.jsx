/**
 * ============================================
 * TABLE COMPONENT
 * ============================================
 * 
 * Purpose: Reusable table component for displaying tabular data
 * Features:
 * - Dynamic columns with custom cell rendering
 * - Loading state with spinner indicator
 * - Empty state with customizable message
 * - Responsive horizontal scrolling
 * - Hover effects on rows
 * - Customizable background color
 * - Consistent styling with border and shadow
 * 
 * Column Structure:
 * {
 *   key: "full_name",
 *   label: "Full Name"
 * }
 * 
 * Custom Render Example:
 * {
 *   key: "status",
 *   label: "Status",
 *   render: (row) => <Badge>{row.status}</Badge>
 * }
 * 
 * Dependencies:
 * - React
 * 
 * Usage:
 * <div class="overflow-x-auto -mx-4 sm:mx-6 lg:mx-8 sm:mx-6 lg:mx-8 sm:mx-0"><div class="inline-block md:hidden min-w-full align-middle"><table
 *   columns={columns}
 *   data={students}
 *   loading={isLoading}
 *   emptyMessage="No students found"
 *   className="mt-4 px-4 sm:px-6 lg:px-8"
 *   bgColor="bg-white"
 * />
 * ============================================
 */

/**
 * ============================================
 * TABLE COMPONENT
 * ============================================
 * 
 * Renders a configurable table with custom columns and data
 * 
 * @param {Object} props - Component props
 * @param {Array} props.columns - Array of column configurations
 * @param {string} props.columns.key - Unique key for the column
 * @param {string} props.columns.label - Display label for the column
 * @param {Function} props.columns.render - Optional custom render function
 * @param {Array} props.data - Array of row objects
 * @param {boolean} props.loading - Displays loading state (default: false)
 * @param {string} props.emptyMessage - Message shown when data is empty (default: "No data found.")
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.bgColor - Background color classes (default: "bg-white")
 * @returns {JSX.Element} Table UI
 * 
 * @example
 * const columns = [
 *   { key: "full_name", label: "Full Name" },
 *   { key: "email", label: "Email" },
 *   { key: "status", label: "Status", render: (row) => <Badge>{row.status}</Badge> }
 * ];
 * 
 * <div class="overflow-x-auto -mx-4 sm:mx-6 lg:mx-8 sm:mx-6 lg:mx-8 sm:mx-0"><div class="inline-block md:hidden min-w-full align-middle"><table
 *   columns={columns}
 *   data={students}
 *   loading={isLoading}
 *   emptyMessage="No students found"
 * />
 * ============================================
 */
function Table({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No data found.",
  className = "",
  bgColor = "bg-white",
}) {
  /**
   * ============================================
   * LOADING STATE
   * ============================================
   * 
   * Displayed while data is being fetched
   */
  if (loading) {
    return (
      <div className="rounded-card border border-slate-200 bg-surface p-4 sm:p-6 sm:p-8 text-center px-4 sm:px-6 lg:px-8">
        <p className="text-text-secondary px-4 sm:px-6 lg:px-8">Loading...</p>
      </div>
    );
  }

  return (
    /**
     * ============================================
     * TABLE CONTAINER
     * ============================================
     * 
     * Provides border, background, shadow,
     * and responsive overflow handling
     */
    <div
      className={`
        overflow-hidden md:block md:hidden rounded-card
        border
        border-slate-200
        ${bgColor}
        shadow-soft
        ${className}
      `}
    >
      {/* ─── Horizontal scrolling on small screens ─── */}
      <div className="overflow-x-auto px-4 sm:px-6 lg:px-8">
        <div class="overflow-x-auto -mx-4 sm:mx-6 lg:mx-8 sm:mx-6 lg:mx-8 sm:mx-0"><div class="inline-block md:hidden min-w-full align-middle"><table className="w-full min-w-max px-4 sm:px-6 lg:px-8">
          {/* ============================================
              TABLE HEADER
              ============================================ */}
          <thead className="bg-slate-50 px-4 sm:px-6 lg:px-8">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="
                    border-b
                    border-slate-200
                    px-5
                    py-4
                    text-left
                    text-sm md:text-base md:text-base font-semibold
                    text-text-primary
                   px-4 sm:px-6 lg:px-8"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* ============================================
              TABLE BODY
              ============================================ */}
          <tbody>
            {data.length === 0 ? (
              // ─── Empty State ──────────────────────────────────────
              <tr>
                <td
                  colSpan={columns.length}
                  className="
                    px-5
                    py-10
                    text-center
                    text-text-secondary
                   px-4 sm:px-6 lg:px-8"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              // ─── Render Table Rows ────────────────────────────────
              data.map((row, index) => (
                <tr
                  key={index}
                  className="
                    transition-colors
                    hover:bg-slate-50
                   px-4 sm:px-6 lg:px-8"
                >
                  {/* ─── Render Table Cells ─── */}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="
                        border-b
                        border-slate-100
                        px-5
                        py-4
                        text-sm md:text-base md:text-base text-text-secondary
                       px-4 sm:px-6 lg:px-8"
                    >
                      {/* Use custom renderer if available,
                          otherwise display field value */}
                      {column.render
                        ? column.render(row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table></div></div>
      </div>
    </div>
  );
}

export default Table;