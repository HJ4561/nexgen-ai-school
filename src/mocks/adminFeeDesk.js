/**
 * ============================================
 * MOCK DATA - FEES
 * ============================================
 * 
 * Purpose: Mock data for fee management system
 * Used for: Development, testing, and demo environments
 * 
 * Data Types:
 * - Fee Structures: Monthly fee amounts by class
 * - Fee Records: Individual student fee transactions
 * - Class Options: Dropdown options for class filtering
 * - Status Options: Fee status filtering options
 * - Scholarship Options: Scholarship percentage filtering
 * 
 * Usage:
 * import { MOCK_FEE_STRUCTURES, MOCK_FEES, getFeeStats } from '@/mocks/fees';
 * ============================================
 */

/**
 * ============================================
 * MOCK FEE STRUCTURES
 * ============================================
 * 
 * Monthly fee amounts by class and section
 * 
 * @constant {Array} MOCK_FEE_STRUCTURES
 * @property {number} id - Unique identifier
 * @property {string} class_section - Class and section name
 * @property {number} monthly_fee - Monthly fee amount in PKR
 * 
 * @example
 * // Get fee structure for a specific class
 * const grade10A = MOCK_FEE_STRUCTURES.find(f => f.class_section === 'Grade 10-A');
 */
export const MOCK_FEE_STRUCTURES = [
  { id: 1, class_section: "Grade 10-A", monthly_fee: 15000 },
  { id: 2, class_section: "Grade 10-B", monthly_fee: 15000 },
  { id: 3, class_section: "Grade 9-A", monthly_fee: 12000 },
  { id: 4, class_section: "Grade 9-B", monthly_fee: 12000 },
  { id: 5, class_section: "Grade 8-A", monthly_fee: 10000 },
  { id: 6, class_section: "Grade 8-B", monthly_fee: 10000 },
];

/**
 * ============================================
 * MOCK FEE RECORDS
 * ============================================
 * 
 * Individual fee records for students
 * 
 * @constant {Array} MOCK_FEES
 * @property {number} id - Unique fee record identifier
 * @property {number} student_id - Reference to the student
 * @property {string} student_name - Name of the student
 * @property {string} roll_number - Student roll number
 * @property {string} class_section - Class and section
 * @property {number} original_amount - Original fee amount before scholarship
 * @property {number} scholarship_percentage - Scholarship percentage applied
 * @property {number} amount - Final payable amount after scholarship
 * @property {number} amount_paid - Amount already paid
 * @property {string} status - Payment status (paid, pending, overdue, partial, waived)
 * @property {string} month - Fee month (YYYY-MM-01)
 * @property {string} due_date - Payment due date
 * @property {string|null} paid_date - Date payment was completed (null if not paid)
 * 
 * @example
 * // Get all overdue fees
 * const overdue = MOCK_FEES.filter(f => f.status === 'overdue');
 * 
 * // Calculate total revenue
 * const revenue = MOCK_FEES.reduce((sum, f) => sum + f.amount_paid, 0);
 */
export const MOCK_FEES = [
  {
    id: 1,
    student_id: 1,
    student_name: "Zain Ahmed",
    roll_number: "#22091",
    class_section: "Grade 10-A",
    original_amount: 15000,
    scholarship_percentage: 25,
    amount: 11250,
    amount_paid: 11250,
    status: "paid",
    month: "2023-08-01",
    due_date: "2023-08-10",
    paid_date: "2023-08-05",
  },
  {
    id: 2,
    student_id: 2,
    student_name: "Ayesha Khan",
    roll_number: "#22095",
    class_section: "Grade 9-B",
    original_amount: 12000,
    scholarship_percentage: 0,
    amount: 12000,
    amount_paid: 0,
    status: "overdue",
    month: "2023-08-01",
    due_date: "2023-08-10",
    paid_date: null,
  },
  {
    id: 3,
    student_id: 3,
    student_name: "Omar Farooq",
    roll_number: "#22088",
    class_section: "Grade 10-A",
    original_amount: 15000,
    scholarship_percentage: 100,
    amount: 0,
    amount_paid: 0,
    status: "waived",
    month: "2023-08-01",
    due_date: "2023-08-10",
    paid_date: null,
  },
  {
    id: 4,
    student_id: 4,
    student_name: "Fatima Malik",
    roll_number: "#22102",
    class_section: "Grade 10-B",
    original_amount: 15000,
    scholarship_percentage: 0,
    amount: 15000,
    amount_paid: 5000,
    status: "partial",
    month: "2023-08-01",
    due_date: "2023-08-10",
    paid_date: null,
  },
  {
    id: 5,
    student_id: 5,
    student_name: "Bilal Sheikh",
    roll_number: "#22115",
    class_section: "Grade 9-A",
    original_amount: 12000,
    scholarship_percentage: 50,
    amount: 6000,
    amount_paid: 6000,
    status: "paid",
    month: "2023-08-01",
    due_date: "2023-08-10",
    paid_date: "2023-08-08",
  },
  {
    id: 6,
    student_id: 6,
    student_name: "Sara Ahmed",
    roll_number: "#22120",
    class_section: "Grade 8-A",
    original_amount: 10000,
    scholarship_percentage: 0,
    amount: 10000,
    amount_paid: 0,
    status: "pending",
    month: "2023-08-01",
    due_date: "2023-08-10",
    paid_date: null,
  },
  {
    id: 7,
    student_id: 7,
    student_name: "Hamid Raza",
    roll_number: "#22133",
    class_section: "Grade 8-B",
    original_amount: 10000,
    scholarship_percentage: 25,
    amount: 7500,
    amount_paid: 7500,
    status: "paid",
    month: "2023-08-01",
    due_date: "2023-08-10",
    paid_date: "2023-08-06",
  },
  {
    id: 8,
    student_id: 8,
    student_name: "Zara Qureshi",
    roll_number: "#22140",
    class_section: "Grade 10-B",
    original_amount: 15000,
    scholarship_percentage: 0,
    amount: 15000,
    amount_paid: 0,
    status: "overdue",
    month: "2023-08-01",
    due_date: "2023-08-10",
    paid_date: null,
  },
];

/**
 * ============================================
 * CLASS OPTIONS
 * ============================================
 * 
 * Dropdown options for class filtering
 * Includes "All Classes" option for viewing all
 * 
 * @constant {Array} MOCK_CLASS_OPTIONS
 * @property {string} value - Option value
 * @property {string} label - Display label
 */
export const MOCK_CLASS_OPTIONS = [
  { value: 'all', label: 'All Classes' },
  { value: 'Grade 10-A', label: 'Grade 10-A' },
  { value: 'Grade 10-B', label: 'Grade 10-B' },
  { value: 'Grade 9-A', label: 'Grade 9-A' },
  { value: 'Grade 9-B', label: 'Grade 9-B' },
  { value: 'Grade 8-A', label: 'Grade 8-A' },
  { value: 'Grade 8-B', label: 'Grade 8-B' },
];

/**
 * ============================================
 * FEE STATUS OPTIONS
 * ============================================
 * 
 * Dropdown options for fee status filtering
 * 
 * @constant {Array} FEE_STATUS_OPTIONS
 * @property {string} value - Option value
 * @property {string} label - Display label
 */
export const FEE_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'partial', label: 'Partial' },
  { value: 'waived', label: 'Waived' },
];

/**
 * ============================================
 * SCHOLARSHIP OPTIONS
 * ============================================
 * 
 * Dropdown options for scholarship percentage filtering
 * 
 * @constant {Array} SCHOLARSHIP_OPTIONS
 * @property {string} value - Option value
 * @property {string} label - Display label
 */
export const SCHOLARSHIP_OPTIONS = [
  { value: 'all', label: 'All Scholarships' },
  { value: '0', label: '0%' },
  { value: '25', label: '25%' },
  { value: '50', label: '50%' },
  { value: '100', label: '100%' },
];

/**
 * ============================================
 * STATS HELPER
 * ============================================
 * 
 * Calculates fee statistics from fee records
 * 
 * @param {Array} fees - Array of fee records
 * @returns {Object} Fee statistics
 * @returns {number} total - Total number of fee records
 * @returns {number} paid - Number of paid fees
 * @returns {number} overdue - Number of overdue fees
 * @returns {number} partial - Number of partially paid fees
 * @returns {number} waived - Number of waived fees
 * @returns {number} totalRevenue - Total revenue collected
 * 
 * @example
 * const stats = getFeeStats(MOCK_FEES);
 * console.log(`Total Revenue: ${stats.totalRevenue}`);
 */
export const getFeeStats = (fees) => {
  const total = fees.length;
  const paid = fees.filter(f => f.status === 'paid').length;
  const overdue = fees.filter(f => f.status === 'overdue').length;
  const partial = fees.filter(f => f.status === 'partial').length;
  const waived = fees.filter(f => f.status === 'waived').length;
  const totalRevenue = fees.reduce((sum, f) => sum + (f.amount_paid || 0), 0);
  return { total, paid, overdue, partial, waived, totalRevenue };
};