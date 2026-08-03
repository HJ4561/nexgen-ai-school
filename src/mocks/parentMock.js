/**
 * ============================================
 * PARENT MOCK DATA
 * ============================================
 * 
 * Purpose: Mock data for parent module
 * Used for: Development, testing, and demo environments
 * 
 * Data Types:
 * - Profile: Parent user profile
 * - Parent-Student Links: Parent to student relationships
 * - Attendance: Student attendance records
 * - Behavior Logs: Student behavior records
 * - Grades: Student grade records
 * - Fees: Fee records for students
 * - Payments: Payment history
 * - Notifications: Parent notifications
 * - Complaints: Parent complaints
 * - Events: Event participations
 * - Certificates: Student certificates
 * - Submissions: Assignment submissions
 * - Chat: Chat sessions and messages
 * 
 * Usage:
 * import { profile, parentLinks, attendance, grades } from '@/mocks/parentMock';
 * ============================================
 */

/**
 * ============================================
 * PARENT PROFILE
 * ============================================
 * 
 * Parent user profile data
 * (Custom until profile endpoint schema is available)
 * 
 * @constant {Object} profile
 * @property {number} id - Parent user ID
 * @property {string} full_name - Parent's full name
 * @property {string} email - Parent's email address
 * @property {string} phone - Parent's phone number
 * @property {string} role_name - User role
 * @property {string} status - Account status
 */
export const profile = {
  id: 1,
  full_name: "Sara Ali",
  email: "sara.ali@school.edu",
  phone: "0301-1234567",
  role_name: "Parent",
  status: "Active",
};

/**
 * ============================================
 * PARENT ↔ STUDENT LINKS
 * ============================================
 * 
 * GET /parent-links
 * 
 * @constant {Array} parentLinks
 * @property {number} id - Link ID
 * @property {number} parent - Parent user ID
 * @property {number} student - Student ID
 * @property {string} relation - Parent's relation to child
 * @property {boolean} is_primary_contact - Whether this is the primary contact
 * @property {string} student_roll_number - Student's roll number
 * @property {string} student_name - Student's name
 */
export const parentLinks = [
  {
    id: 1,
    parent: 1,
    student: 101,
    relation: "Father",
    is_primary_contact: true,
    student_roll_number: "2023-IT-101",
    student_name: "Ahmad Ali",
    roll_number: "2023-IT-101",
  },
  {
    id: 2,
    parent: 1,
    student: 102,
    relation: "Mother",
    is_primary_contact: false,
    student_roll_number: "2024-CS-021",
    student_name: "Zainab Ali",
    roll_number: "2024-CS-021",
  },
];

/**
 * ============================================
 * ATTENDANCE
 * ============================================
 * 
 * GET /parent/attendance
 * 
 * @constant {Array} attendance
 * @property {number} id - Attendance record ID
 * @property {string} student_name - Student's name
 * @property {string} date - Attendance date
 * @property {string} status - Attendance status (Present, Absent, Leave)
 * @property {number} class_section - Class section ID
 * @property {boolean} is_locked - Whether attendance is locked
 */
export const attendance = [
  {
    id: 1,
    student_name: "Ahmad Ali",
    date: "2026-07-01",
    status: "Present",
    class_section: 1,
    is_locked: true,
  },
  {
    id: 2,
    student_name: "Ahmad Ali",
    date: "2026-07-02",
    status: "Absent",
    class_section: 1,
    is_locked: true,
  },
  {
    id: 3,
    student_name: "Zainab Ali",
    date: "2026-07-01",
    status: "Present",
    class_section: 2,
    is_locked: true,
  },
];

/**
 * ============================================
 * BEHAVIOR LOGS
 * ============================================
 * 
 * GET /parent/behavior-logs
 * 
 * @constant {Array} behaviorLogs
 * @property {number} id - Log ID
 * @property {string} student_name - Student's name
 * @property {string} date - Incident date
 * @property {string} description - Incident description
 * @property {string} severity - Severity level (Low, Medium, High)
 * @property {string} action_taken - Action taken
 * @property {string} reported_by_name - Reporter's name
 */
export const behaviorLogs = [
  {
    id: 1,
    student_name: "Ahmad Ali",
    date: "2026-06-24",
    description:
      "Actively participated in classroom discussion and helped classmates.",
    severity: "Low",
    action_taken: "Acknowledged by parent",
    reported_by_name: "Sara Khan",
  },
  {
    id: 2,
    student_name: "Ahmad Ali",
    date: "2026-06-20",
    description: "Assignment submitted after the deadline.",
    severity: "Medium",
    action_taken: "Student was advised to improve time management.",
    reported_by_name: "Ali Hassan",
  },
  {
    id: 3,
    student_name: "Ahmad Ali",
    date: "2026-06-15",
    description: "Repeatedly disturbed classroom activities.",
    severity: "High",
    action_taken: "Meeting arranged with parents.",
    reported_by_name: "Sara Khan",
  },
  {
    id: 4,
    student_name: "Zainab Ali",
    date: "2026-06-12",
    description: "Excellent teamwork during science project.",
    severity: "Low",
    action_taken: "Appreciation certificate awarded.",
    reported_by_name: "Fatima Noor",
  },
  {
    id: 5,
    student_name: "Zainab Ali",
    date: "2026-06-08",
    description: "Absent without prior notice during practical session.",
    severity: "Medium",
    action_taken: "Parent informed.",
    reported_by_name: "Ahmed Raza",
  },
  {
    id: 6,
    student_name: "Ahmad Ali",
    date: "2026-06-04",
    description: "Inappropriate behavior towards classmates.",
    severity: "High",
    action_taken: "Disciplinary warning issued.",
    reported_by_name: "Ali Hassan",
  },
];

/**
 * ============================================
 * GRADES
 * ============================================
 * 
 * GET /parent/grades
 * 
 * @constant {Array} grades
 * @property {number} id - Grade record ID
 * @property {string} subject_name - Subject name
 * @property {string} student_name - Student's name
 * @property {string} exam_type - Exam type (Mid Term, Final, etc.)
 * @property {string} obtained_marks - Marks obtained
 * @property {string} total_marks - Total marks
 * @property {string} exam_date - Exam date
 */
export const grades = [
  // ─── Ahmad Ali — Mid Term ───
  {
    id: 1,
    subject_name: "Mathematics",
    student_name: "Ahmad Ali",
    exam_type: "Mid Term",
    obtained_marks: "91.00",
    total_marks: "100.00",
    exam_date: "2026-05-20",
  },
  {
    id: 2,
    subject_name: "Science",
    student_name: "Ahmad Ali",
    exam_type: "Mid Term",
    obtained_marks: "88.00",
    total_marks: "100.00",
    exam_date: "2026-05-21",
  },
  {
    id: 3,
    subject_name: "English",
    student_name: "Ahmad Ali",
    exam_type: "Mid Term",
    obtained_marks: "84.00",
    total_marks: "100.00",
    exam_date: "2026-05-22",
  },
  {
    id: 4,
    subject_name: "Urdu",
    student_name: "Ahmad Ali",
    exam_type: "Mid Term",
    obtained_marks: "76.00",
    total_marks: "100.00",
    exam_date: "2026-05-23",
  },
  {
    id: 5,
    subject_name: "Islamiat",
    student_name: "Ahmad Ali",
    exam_type: "Mid Term",
    obtained_marks: "94.00",
    total_marks: "100.00",
    exam_date: "2026-05-24",
  },
  {
    id: 6,
    subject_name: "Computer",
    student_name: "Ahmad Ali",
    exam_type: "Mid Term",
    obtained_marks: "97.00",
    total_marks: "100.00",
    exam_date: "2026-05-25",
  },
  {
    id: 7,
    subject_name: "Social Studies",
    student_name: "Ahmad Ali",
    exam_type: "Mid Term",
    obtained_marks: "81.00",
    total_marks: "100.00",
    exam_date: "2026-05-26",
  },

  // ─── Ahmad Ali — Final ───
  {
    id: 8,
    subject_name: "Mathematics",
    student_name: "Ahmad Ali",
    exam_type: "Final",
    obtained_marks: "95.00",
    total_marks: "100.00",
    exam_date: "2026-06-20",
  },
  {
    id: 9,
    subject_name: "Science",
    student_name: "Ahmad Ali",
    exam_type: "Final",
    obtained_marks: "90.00",
    total_marks: "100.00",
    exam_date: "2026-06-21",
  },
  {
    id: 10,
    subject_name: "English",
    student_name: "Ahmad Ali",
    exam_type: "Final",
    obtained_marks: "87.00",
    total_marks: "100.00",
    exam_date: "2026-06-22",
  },
  {
    id: 11,
    subject_name: "Urdu",
    student_name: "Ahmad Ali",
    exam_type: "Final",
    obtained_marks: "80.00",
    total_marks: "100.00",
    exam_date: "2026-06-23",
  },
  {
    id: 12,
    subject_name: "Islamiat",
    student_name: "Ahmad Ali",
    exam_type: "Final",
    obtained_marks: "96.00",
    total_marks: "100.00",
    exam_date: "2026-06-24",
  },
  {
    id: 13,
    subject_name: "Computer",
    student_name: "Ahmad Ali",
    exam_type: "Final",
    obtained_marks: "98.00",
    total_marks: "100.00",
    exam_date: "2026-06-25",
  },
  {
    id: 14,
    subject_name: "Social Studies",
    student_name: "Ahmad Ali",
    exam_type: "Final",
    obtained_marks: "86.00",
    total_marks: "100.00",
    exam_date: "2026-06-26",
  },

  // ─── Zainab Ali — Mid Term ───
  {
    id: 15,
    subject_name: "Mathematics",
    student_name: "Zainab Ali",
    exam_type: "Mid Term",
    obtained_marks: "84.00",
    total_marks: "100.00",
    exam_date: "2026-05-20",
  },
  {
    id: 16,
    subject_name: "Science",
    student_name: "Zainab Ali",
    exam_type: "Mid Term",
    obtained_marks: "89.00",
    total_marks: "100.00",
    exam_date: "2026-05-21",
  },
  {
    id: 17,
    subject_name: "English",
    student_name: "Zainab Ali",
    exam_type: "Mid Term",
    obtained_marks: "92.00",
    total_marks: "100.00",
    exam_date: "2026-05-22",
  },
  {
    id: 18,
    subject_name: "Urdu",
    student_name: "Zainab Ali",
    exam_type: "Mid Term",
    obtained_marks: "88.00",
    total_marks: "100.00",
    exam_date: "2026-05-23",
  },
  {
    id: 19,
    subject_name: "Islamiat",
    student_name: "Zainab Ali",
    exam_type: "Mid Term",
    obtained_marks: "93.00",
    total_marks: "100.00",
    exam_date: "2026-05-24",
  },
  {
    id: 20,
    subject_name: "Computer",
    student_name: "Zainab Ali",
    exam_type: "Mid Term",
    obtained_marks: "95.00",
    total_marks: "100.00",
    exam_date: "2026-05-25",
  },
  {
    id: 21,
    subject_name: "Social Studies",
    student_name: "Zainab Ali",
    exam_type: "Mid Term",
    obtained_marks: "82.00",
    total_marks: "100.00",
    exam_date: "2026-05-26",
  },

  // ─── Zainab Ali — Final ───
  {
    id: 22,
    subject_name: "Mathematics",
    student_name: "Zainab Ali",
    exam_type: "Final",
    obtained_marks: "89.00",
    total_marks: "100.00",
    exam_date: "2026-06-20",
  },
  {
    id: 23,
    subject_name: "Science",
    student_name: "Zainab Ali",
    exam_type: "Final",
    obtained_marks: "91.00",
    total_marks: "100.00",
    exam_date: "2026-06-21",
  },
  {
    id: 24,
    subject_name: "English",
    student_name: "Zainab Ali",
    exam_type: "Final",
    obtained_marks: "95.00",
    total_marks: "100.00",
    exam_date: "2026-06-22",
  },
  {
    id: 25,
    subject_name: "Urdu",
    student_name: "Zainab Ali",
    exam_type: "Final",
    obtained_marks: "90.00",
    total_marks: "100.00",
    exam_date: "2026-06-23",
  },
  {
    id: 26,
    subject_name: "Islamiat",
    student_name: "Zainab Ali",
    exam_type: "Final",
    obtained_marks: "96.00",
    total_marks: "100.00",
    exam_date: "2026-06-24",
  },
  {
    id: 27,
    subject_name: "Computer",
    student_name: "Zainab Ali",
    exam_type: "Final",
    obtained_marks: "97.00",
    total_marks: "100.00",
    exam_date: "2026-06-25",
  },
  {
    id: 28,
    subject_name: "Social Studies",
    student_name: "Zainab Ali",
    exam_type: "Final",
    obtained_marks: "88.00",
    total_marks: "100.00",
    exam_date: "2026-06-26",
  },
];

/**
 * ============================================
 * FEES
 * ============================================
 * 
 * GET /parent/fees
 * 
 * @constant {Array} fees
 * @property {number} id - Fee record ID
 * @property {string} student_name - Student's name
 * @property {string} month - Fee month
 * @property {string} original_amount - Original fee amount
 * @property {string} amount - Payable amount
 * @property {string} amount_paid - Amount paid
 * @property {string} due_date - Due date
 * @property {string|null} paid_date - Paid date (null if not paid)
 * @property {string} status - Payment status (Paid, Pending, Partial, Overdue)
 */
export const fees = [
  {
    id: 1,
    student_name: "Ahmad Ali",
    month: "2026-06-01",
    original_amount: "25000.00",
    amount: "20000.00",
    amount_paid: "20000.00",
    due_date: "2026-06-10",
    paid_date: "2026-06-08",
    status: "Paid",
  },
  {
    id: 2,
    student_name: "Zainab Ali",
    month: "2026-06-01",
    original_amount: "22000.00",
    amount: "22000.00",
    amount_paid: "0.00",
    due_date: "2026-06-10",
    paid_date: null,
    status: "Pending",
  },
];

/**
 * ============================================
 * PAYMENTS
 * ============================================
 * 
 * GET /parent/payments
 * 
 * @constant {Array} payments
 * @property {number} id - Payment ID
 * @property {number} fee - Fee ID reference
 * @property {string} student_name - Student's name
 * @property {string} amount_paid - Amount paid
 * @property {string} payment_method - Payment method
 * @property {string} transaction_id - Transaction ID
 * @property {string} payment_date - Payment date
 */
export const payments = [
  {
    id: 1,
    fee: 1,
    student_name: "Ahmad Ali",
    amount_paid: "20000.00",
    payment_method: "stripe",
    transaction_id: "TXN-100245",
    payment_date: "2026-06-08",
  },
  {
    id: 2,
    fee: 2,
    student_name: "Zainab Ali",
    amount_paid: "0.00",
    payment_method: "stripe",
    transaction_id: "dfe2343f",
    payment_date: "2026-06-10",
  },
];

/**
 * ============================================
 * NOTIFICATIONS
 * ============================================
 * 
 * GET /parent/notifications
 * 
 * @constant {Array} notifications
 * @property {number} id - Notification ID
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {string} type - Notification type (Fee, Announcement, etc.)
 * @property {string} sender_name - Sender's name
 * @property {boolean} is_read - Read status
 * @property {string} created_at - ISO date string
 */
export const notifications = [
  {
    id: 1,
    title: "Fee Reminder",
    message: "Your June fee is due on 10 June.",
    type: "Fee",
    sender_name: "School Admin",
    is_read: false,
    created_at: "2026-06-05T09:30:00Z",
  },
  {
    id: 2,
    title: "PTM Announcement",
    message: "Parent Teacher Meeting will be held on Friday.",
    type: "Announcement",
    sender_name: "Principal",
    is_read: true,
    created_at: "2026-06-03T11:00:00Z",
  },
];

/**
 * ============================================
 * COMPLAINTS
 * ============================================
 * 
 * GET /parent/complaints
 * 
 * @constant {Array} complaints
 * @property {number} id - Complaint ID
 * @property {string} complaint_type - Type of complaint
 * @property {string} description - Complaint description
 * @property {string} status - Complaint status (Open, Resolved, etc.)
 * @property {string} created_at - ISO date string
 */
export const complaints = [
  {
    id: 1,
    complaint_type: "Academic",
    description: "Mathematics marks need review.",
    status: "Open",
    created_at: "2026-06-15T10:00:00Z",
  },
  {
    id: 2,
    complaint_type: "Transport",
    description: "School bus arrived late.",
    status: "Resolved",
    created_at: "2026-05-28T08:30:00Z",
  },
];

/**
 * ============================================
 * EVENT PARTICIPATIONS
 * ============================================
 * 
 * GET /parent/events/participations
 * 
 * @constant {Array} events
 * @property {number} id - Event ID
 * @property {string} event_name - Name of the event
 * @property {string} event_date - Event date
 * @property {string} student_name - Student's name
 * @property {string} role - Role in the event
 * @property {string|null} position - Position achieved (1st, 2nd, 3rd)
 * @property {boolean} certificate - Whether certificate was earned
 */
export const events = [
  {
    id: 1,
    event_name: "Sports Day",
    event_date: "2026-07-20",
    student_name: "Ahmad Ali",
    role: "Participant",
    position: "1st",
    certificate: true,
  },
  {
    id: 2,
    event_name: "Science Exhibition",
    event_date: "2026-08-05",
    student_name: "Zainab Ali",
    role: "Participant",
    position: null,
    certificate: false,
  },
];

/**
 * ============================================
 * CERTIFICATES
 * ============================================
 * 
 * GET /parent/certificates
 * 
 * @constant {Array} certificates
 * @property {number} id - Certificate ID
 * @property {string} student_name - Student's name
 * @property {string} cert_type - Type of certificate
 * @property {string} created_at - Issue date
 */
export const certificates = [
  {
    id: 1,
    student_name: "Ahmad Ali",
    cert_type: "Best Student",
    created_at: "2026-03-10",
  },
  {
    id: 2,
    student_name: "Zainab Ali",
    cert_type: "Science Fair Winner",
    created_at: "2026-04-15",
  },
];

/**
 * ============================================
 * ASSIGNMENT SUBMISSIONS
 * ============================================
 * 
 * GET /parent/submissions
 * 
 * @constant {Array} submissions
 * @property {number} id - Submission ID
 * @property {string} assignment_title - Assignment title
 * @property {string} student_name - Student's name
 * @property {string} submitted_at - Submission timestamp
 * @property {string} marks - Marks obtained
 * @property {string} feedback - Teacher feedback
 */
export const submissions = [
  {
    id: 1,
    assignment_title: "Math Assignment",
    student_name: "Ahmad Ali",
    submitted_at: "2026-06-11T09:00:00Z",
    marks: "19.00",
    feedback: "Excellent work.",
  },
  {
    id: 2,
    assignment_title: "Science Project",
    student_name: "Zainab Ali",
    submitted_at: "2026-06-13T10:30:00Z",
    marks: "18.00",
    feedback: "Very creative presentation.",
  },
];

/**
 * ============================================
 * CHAT SESSIONS
 * ============================================
 * 
 * GET /parent/chat/sessions
 * 
 * @constant {Array} chatSessions
 * @property {number} id - Session ID
 * @property {string} bot_type - Bot type
 * @property {string} title - Session title
 * @property {number} active_child - Active child ID
 * @property {string} active_child_name - Active child name
 * @property {string} created_at - Session creation timestamp
 */
export const chatSessions = [
  {
    id: 1,
    bot_type: "general",
    title: "Attendance Inquiry",
    active_child: 101,
    active_child_name: "Ahmad Ali",
    created_at: "2026-06-10T09:00:00Z",
  },
  {
    id: 2,
    bot_type: "general",
    title: "Fee Discussion",
    active_child: 102,
    active_child_name: "Zainab Ali",
    created_at: "2026-06-12T02:15:00Z",
  },
];

/**
 * ============================================
 * CHAT MESSAGES
 * ============================================
 * 
 * GET /parent/chat/messages
 * 
 * @constant {Array} chatMessages
 * @property {number} id - Message ID
 * @property {number} session - Session ID reference
 * @property {string} role - Message role (user, assistant)
 * @property {string} content - Message content
 * @property {string} created_at - Message timestamp
 */
export const chatMessages = [
  {
    id: 1,
    session: 1,
    role: "user",
    content: "How many absences does Ahmad have?",
    created_at: "2026-06-10T09:01:00Z",
  },
  {
    id: 2,
    session: 1,
    role: "assistant",
    content: "Ahmad has 2 absences this month.",
    created_at: "2026-06-10T09:01:05Z",
  },
  {
    id: 3,
    session: 2,
    role: "user",
    content: "Has June fee been paid?",
    created_at: "2026-06-12T02:16:00Z",
  },
  {
    id: 4,
    session: 2,
    role: "assistant",
    content: "No, the June fee is still pending.",
    created_at: "2026-06-12T02:16:05Z",
  },
];