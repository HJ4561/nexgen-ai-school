/**
 * ============================================
 * STUDENT MOCK DATA
 * ============================================
 * 
 * Purpose: Mock data for student module
 * Used for: Development, testing, and demo environments
 * 
 * Data Types:
 * - Profile: Student profile information
 * - Dashboard: Dashboard statistics
 * - Attendance: Attendance records
 * - Report Card: Grades and academic performance
 * - Assignments: Assignment and submission data
 * - Fees: Fee records and payment history
 * - Payments: Payment transaction records
 * - Timetable: Weekly class schedule
 * - Events: Upcoming events and participations
 * - Notifications: Student notifications
 * - Complaints: Student complaints
 * - Chat: Chat sessions and messages
 * 
 * Usage:
 * import { profile, attendance, reportCard } from '@/mocks/studentMock';
 * ============================================
 */

/**
 * ============================================
 * STUDENT PROFILE
 * ============================================
 * 
 * Student's personal and account information
 * 
 * @constant {Object} profile
 * @property {number} id - Student ID
 * @property {string} full_name - Student's full name
 * @property {string} email - Student's email address
 * @property {string} role_name - User role
 * @property {string} status - Account status (Active, Inactive)
 * @property {string} phone - Contact phone number
 * @property {string} address - Physical address
 * @property {string} avatar - Profile picture URL (empty for default)
 * @property {string} created_at - Account creation timestamp
 */
export const profile = {
  id: 1,
  full_name: "Fazail Nadeem",
  email: "student@school.edu",
  role_name: "Student",
  status: "Active",
  phone: "0300-1234567",
  address: "Lahore, Pakistan",
  avatar: "",
  created_at: "2025-01-15T09:30:00Z",
};

/**
 * ============================================
 * STUDENT DASHBOARD
 * ============================================
 * 
 * Quick statistics for the student dashboard
 * 
 * @constant {Object} studentDashboard
 * @property {number} attendancePercentage - Overall attendance percentage
 * @property {number} pendingAssignments - Number of pending assignments
 * @property {number} feeDue - Outstanding fee amount
 * @property {number} unreadNotifications - Unread notification count
 */
export const studentDashboard = {
  attendancePercentage: 92,
  pendingAssignments: 4,
  feeDue: 5000,
  unreadNotifications: 3,
};

/**
 * ============================================
 * ATTENDANCE RECORDS
 * ============================================
 * 
 * Student attendance history
 * June 2026
 * 
 * @constant {Array} attendance
 * @property {number} id - Attendance record ID
 * @property {number} student_id - Student ID reference
 * @property {number} class_id - Class ID reference
 * @property {string} date - Attendance date
 * @property {string} status - Attendance status (Present, Absent, Leave)
 * @property {number} marked_by_teacher_id - Teacher who marked attendance
 * @property {boolean} is_locked - Whether attendance is locked for editing
 * @property {string} created_at - Record creation timestamp
 */
export const attendance = [
  {
    id: 1,
    student_id: 1,
    class_id: 1,
    date: "2026-06-01",
    status: "Present",
    marked_by_teacher_id: 3,
    is_locked: true,
    created_at: "2026-06-01T08:15:00",
  },
  {
    id: 2,
    student_id: 1,
    class_id: 1,
    date: "2026-06-02",
    status: "Present",
    marked_by_teacher_id: 3,
    is_locked: true,
    created_at: "2026-06-02T08:12:00",
  },
  {
    id: 3,
    student_id: 1,
    class_id: 1,
    date: "2026-06-03",
    status: "Absent",
    marked_by_teacher_id: 3,
    is_locked: true,
    created_at: "2026-06-03T08:18:00",
  },
  {
    id: 4,
    student_id: 1,
    class_id: 1,
    date: "2026-06-04",
    status: "Present",
    marked_by_teacher_id: 3,
    is_locked: true,
    created_at: "2026-06-04T08:11:00",
  },
  {
    id: 5,
    student_id: 1,
    class_id: 1,
    date: "2026-06-05",
    status: "Leave",
    marked_by_teacher_id: 3,
    is_locked: true,
    created_at: "2026-06-05T08:10:00",
  },
  {
    id: 6,
    student_id: 1,
    class_id: 1,
    date: "2026-06-06",
    status: "Present",
    marked_by_teacher_id: 3,
    is_locked: true,
    created_at: "2026-06-06T08:13:00",
  },
  {
    id: 7,
    student_id: 1,
    class_id: 1,
    date: "2026-06-07",
    status: "Present",
    marked_by_teacher_id: 3,
    is_locked: true,
    created_at: "2026-06-07T08:12:00",
  },
  {
    id: 8,
    student_id: 1,
    class_id: 1,
    date: "2026-06-08",
    status: "Present",
    marked_by_teacher_id: 3,
    is_locked: true,
    created_at: "2026-06-08T08:09:00",
  },
  {
    id: 9,
    student_id: 1,
    class_id: 1,
    date: "2026-06-09",
    status: "Absent",
    marked_by_teacher_id: 3,
    is_locked: true,
    created_at: "2026-06-09T08:14:00",
  },
  {
    id: 10,
    student_id: 1,
    class_id: 1,
    date: "2026-06-10",
    status: "Present",
    marked_by_teacher_id: 3,
    is_locked: true,
    created_at: "2026-06-10T08:15:00",
  },
];

/**
 * ============================================
 * REPORT CARD / GRADES
 * ============================================
 * 
 * Student's academic performance and grades
 * 
 * @constant {Object} reportCard
 * @property {string} academic_year - Academic year
 * @property {string} published_at - Report publication date
 * @property {Array} grades - List of grade entries
 * @property {number} grades.id - Grade record ID
 * @property {number} grades.subject - Subject ID reference
 * @property {string} grades.subject_name - Subject name
 * @property {string} grades.teacher_name - Teacher's name
 * @property {string} grades.exam_type - Type of exam (Mid Term, Final, Quiz, Assignment)
 * @property {string} grades.obtained_marks - Marks obtained
 * @property {string} grades.total_marks - Total marks possible
 * @property {string} grades.exam_date - Exam date
 */
export const reportCard = {
  academic_year: "2025-2026",
  published_at: "2026-06-20",

  grades: [
    {
      id: 1,
      subject: 1,
      subject_name: "Database Systems",
      teacher_name: "Ali Hassan",
      exam_type: "Mid Term",
      obtained_marks: "42.00",
      total_marks: "50.00",
      exam_date: "2026-05-20",
    },
    {
      id: 2,
      subject: 2,
      subject_name: "Operating Systems",
      teacher_name: "Ali Hassan",
      exam_type: "Mid Term",
      obtained_marks: "18.00",
      total_marks: "20.00",
      exam_date: "2026-05-20",
    },
    {
      id: 3,
      subject: 3,
      subject_name: "Software Engineering",
      teacher_name: "Sara Khan",
      exam_type: "Final",
      obtained_marks: "47.00",
      total_marks: "50.00",
      exam_date: "2026-06-18",
    },
    {
      id: 4,
      subject: 4,
      subject_name: "Computer Networks",
      teacher_name: "Ahmed Raza",
      exam_type: "Quiz",
      obtained_marks: "19.00",
      total_marks: "20.00",
      exam_date: "2026-06-05",
    },
    {
      id: 5,
      subject: 5,
      subject_name: "Artificial Intelligence",
      teacher_name: "Fatima Noor",
      exam_type: "Assignment",
      obtained_marks: "9.00",
      total_marks: "10.00",
      exam_date: "2026-06-10",
    },
  ],
};

/**
 * ============================================
 * ASSIGNMENTS
 * ============================================
 * 
 * Student's assignments with submission status
 * 
 * @constant {Array} assignments
 * @property {number} id - Assignment ID
 * @property {string} title - Assignment title
 * @property {number} subject_id - Subject ID reference
 * @property {string} subject_name - Subject name
 * @property {string} description - Assignment description
 * @property {string} assigned_at - Assignment date
 * @property {string} due_date - Due date
 * @property {string} status - Status (Pending, Submitted, Graded)
 * @property {Object|null} submission - Submission details (null if not submitted)
 * @property {number|null} marks - Marks obtained (null if not graded)
 * @property {string|null} feedback - Teacher feedback (null if not graded)
 */
export const assignments = [
  {
    id: 1,
    title: "Database Assignment",
    subject_id: 1,
    subject_name: "Database Systems",
    description: "Create ER Diagram and normalize schema to 3NF.",
    assigned_at: "2026-06-20",
    due_date: "2026-06-25",
    status: "Pending",
    submission: null,
    marks: null,
    feedback: null,
  },
  {
    id: 2,
    title: "Operating Systems Report",
    subject_id: 2,
    subject_name: "Operating Systems",
    description: "Prepare report on Process Scheduling Algorithms.",
    assigned_at: "2026-06-18",
    due_date: "2026-06-28",
    status: "Submitted",
    submission: {
      id: 15,
      file_name: "os-report.pdf",
      file_url: "/uploads/os-report.pdf",
      submitted_at: "2026-06-22",
    },
    marks: null,
    feedback: null,
  },
  {
    id: 3,
    title: "Software Engineering Project",
    subject_id: 3,
    subject_name: "Software Engineering",
    description: "Develop Use Case Diagram and SRS Document.",
    assigned_at: "2026-06-15",
    due_date: "2026-06-30",
    status: "Graded",
    submission: {
      id: 20,
      file_name: "srs-project.pdf",
      file_url: "/uploads/srs-project.pdf",
      submitted_at: "2026-06-20",
    },
    marks: 9,
    feedback: "Excellent work and proper documentation.",
  },
];

/**
 * ============================================
 * STUDENT FEES
 * ============================================
 * 
 * Matches GET /api/student/fees
 * 
 * @constant {Array} fees
 * @property {number} id - Fee record ID
 * @property {string} month - Fee month (YYYY-MM-01)
 * @property {string} original_amount - Original fee amount
 * @property {string} amount - Payable amount
 * @property {string} amount_paid - Amount paid
 * @property {string} due_date - Payment due date
 * @property {string|null} paid_date - Payment completion date (null if not paid)
 * @property {string} status - Payment status (Paid, Partial, Pending)
 */
export const fees = [
  {
    id: 1,
    month: "2026-01-01",
    original_amount: "10000.00",
    amount: "5000.00",
    amount_paid: "5000.00",
    due_date: "2026-01-31",
    paid_date: "2026-01-18",
    status: "Paid",
  },
  {
    id: 2,
    month: "2026-02-01",
    original_amount: "10000.00",
    amount: "5000.00",
    amount_paid: "5000.00",
    due_date: "2026-02-28",
    paid_date: "2026-02-20",
    status: "Paid",
  },
  {
    id: 3,
    month: "2026-03-01",
    original_amount: "10000.00",
    amount: "5000.00",
    amount_paid: "5000.00",
    due_date: "2026-03-31",
    paid_date: "2026-03-17",
    status: "Paid",
  },
  {
    id: 4,
    month: "2026-04-01",
    original_amount: "10000.00",
    amount: "5000.00",
    amount_paid: "3000.00",
    due_date: "2026-04-30",
    paid_date: null,
    status: "Partial",
  },
  {
    id: 5,
    month: "2026-05-01",
    original_amount: "10000.00",
    amount: "5000.00",
    amount_paid: "0.00",
    due_date: "2026-05-31",
    paid_date: null,
    status: "Pending",
  },
  {
    id: 6,
    month: "2026-06-01",
    original_amount: "10000.00",
    amount: "5000.00",
    amount_paid: "0.00",
    due_date: "2026-06-30",
    paid_date: null,
    status: "Pending",
  },
  {
    id: 7,
    month: "2026-07-01",
    original_amount: "10000.00",
    amount: "5000.00",
    amount_paid: "0.00",
    due_date: "2026-07-31",
    paid_date: null,
    status: "Pending",
  },
  {
    id: 8,
    month: "2026-08-01",
    original_amount: "10000.00",
    amount: "5000.00",
    amount_paid: "0.00",
    due_date: "2026-08-31",
    paid_date: null,
    status: "Pending",
  },
  {
    id: 9,
    month: "2026-09-01",
    original_amount: "10000.00",
    amount: "5000.00",
    amount_paid: "0.00",
    due_date: "2026-09-30",
    paid_date: null,
    status: "Pending",
  },
  {
    id: 10,
    month: "2026-10-01",
    original_amount: "10000.00",
    amount: "5000.00",
    amount_paid: "0.00",
    due_date: "2026-10-31",
    paid_date: null,
    status: "Pending",
  },
  {
    id: 11,
    month: "2026-11-01",
    original_amount: "10000.00",
    amount: "5000.00",
    amount_paid: "0.00",
    due_date: "2026-11-30",
    paid_date: null,
    status: "Pending",
  },
  {
    id: 12,
    month: "2026-12-01",
    original_amount: "10000.00",
    amount: "5000.00",
    amount_paid: "0.00",
    due_date: "2026-12-31",
    paid_date: null,
    status: "Pending",
  },
];

/**
 * ============================================
 * STUDENT PAYMENTS
 * ============================================
 * 
 * Matches GET /api/student/payments
 * 
 * @constant {Array} payments
 * @property {number} id - Payment ID
 * @property {number} fee - Fee ID reference
 * @property {string} amount_paid - Amount paid
 * @property {string} payment_method - Payment method (Stripe, Cash, etc.)
 * @property {string} transaction_id - Payment transaction ID
 * @property {string} payment_date - Payment date
 */
export const payments = [
  {
    id: 1,
    fee: 1,
    amount_paid: "5000.00",
    payment_method: "Stripe",
    transaction_id: "pi_3QAbCDeFgH123456",
    payment_date: "2026-01-18",
  },
  {
    id: 2,
    fee: 2,
    amount_paid: "5000.00",
    payment_method: "Stripe",
    transaction_id: "pi_3QAbCDeFgH123457",
    payment_date: "2026-02-20",
  },
  {
    id: 3,
    fee: 3,
    amount_paid: "5000.00",
    payment_method: "Stripe",
    transaction_id: "pi_3QAbCDeFgH123458",
    payment_date: "2026-03-17",
  },
  {
    id: 4,
    fee: 4,
    amount_paid: "3000.00",
    payment_method: "Stripe",
    transaction_id: "pi_3QAbCDeFgH123459",
    payment_date: "2026-04-15",
  },
];

/**
 * ============================================
 * TIMETABLE
 * ============================================
 * 
 * Student's weekly class schedule
 * 
 * @constant {Array} timetable
 * @property {number} id - Timetable entry ID
 * @property {number} class_section_id - Class section ID
 * @property {string} class_name - Class name
 * @property {string} section - Section name
 * @property {number} subject_id - Subject ID
 * @property {string} subject_name - Subject name
 * @property {number} teacher_id - Teacher ID
 * @property {string} teacher_name - Teacher name
 * @property {string} day - Day of week
 * @property {string} start_time - Start time (HH:MM:SS)
 * @property {string} end_time - End time (HH:MM:SS)
 * @property {string} room - Room number
 */
export const timetable = [
  {
    id: 1,
    class_section_id: 1,
    class_name: "BSIT",
    section: "6A",
    subject_id: 1,
    subject_name: "Database Systems",
    teacher_id: 3,
    teacher_name: "Ali Hassan",
    day: "Monday",
    start_time: "09:00:00",
    end_time: "10:00:00",
    room: "A101",
  },
  {
    id: 2,
    class_section_id: 1,
    class_name: "BSIT",
    section: "6A",
    subject_id: 2,
    subject_name: "Operating Systems",
    teacher_id: 4,
    teacher_name: "Sara Khan",
    day: "Monday",
    start_time: "10:00:00",
    end_time: "11:00:00",
    room: "A102",
  },
  {
    id: 3,
    class_section_id: 1,
    class_name: "BSIT",
    section: "6A",
    subject_id: 3,
    subject_name: "Software Engineering",
    teacher_id: 5,
    teacher_name: "Usman Tariq",
    day: "Tuesday",
    start_time: "09:00:00",
    end_time: "10:00:00",
    room: "A103",
  },
];

/**
 * ============================================
 * UPCOMING EVENTS
 * ============================================
 * 
 * School events and activities
 * 
 * @constant {Array} events
 * @property {number} id - Event ID
 * @property {string} title - Event title
 * @property {string} description - Event description
 * @property {string} event_type - Type of event (Sports, Seminar, Celebration)
 * @property {string} venue - Event venue
 * @property {string} start_date - Event start date/time
 * @property {string} end_date - Event end date/time
 * @property {boolean} registration_required - Whether registration is required
 * @property {string|null} registration_deadline - Registration deadline (null if not required)
 * @property {string} banner_url - Event banner image URL
 * @property {string} created_at - Event creation timestamp
 */
export const events = [
  {
    id: 1,
    title: "Annual Sports Day",
    description: "Inter-department sports competitions including cricket, football and athletics.",
    event_type: "Sports",
    venue: "University Main Ground",
    start_date: "2026-07-10T09:00:00",
    end_date: "2026-07-10T17:00:00",
    registration_required: true,
    registration_deadline: "2026-07-05T23:59:59",
    banner_url: "/events/sports-day.jpg",
    created_at: "2026-06-15T10:00:00",
  },
  {
    id: 2,
    title: "AI & Technology Seminar",
    description: "Seminar on Artificial Intelligence and emerging technologies.",
    event_type: "Seminar",
    venue: "University Auditorium",
    start_date: "2026-08-05T10:00:00",
    end_date: "2026-08-05T13:00:00",
    registration_required: true,
    registration_deadline: "2026-08-01T23:59:59",
    banner_url: "/events/ai-seminar.jpg",
    created_at: "2026-06-18T11:30:00",
  },
  {
    id: 3,
    title: "Independence Day Celebration",
    description: "Flag hoisting ceremony and cultural performances.",
    event_type: "Celebration",
    venue: "Central Lawn",
    start_date: "2026-08-14T08:00:00",
    end_date: "2026-08-14T12:00:00",
    registration_required: false,
    registration_deadline: null,
    banner_url: "/events/independence.jpg",
    created_at: "2026-06-20T09:15:00",
  },
];

/**
 * ============================================
 * MY PARTICIPATIONS
 * ============================================
 * 
 * Student's event participation records
 * 
 * @constant {Array} participations
 * @property {number} id - Participation ID
 * @property {number} student_id - Student ID reference
 * @property {number} event_id - Event ID reference
 * @property {string} event_title - Event title
 * @property {string} event_type - Event type
 * @property {string} venue - Event venue
 * @property {string} start_date - Event start date
 * @property {string} end_date - Event end date
 * @property {string} participation_role - Student's role (Participant, Volunteer, etc.)
 * @property {string} registration_date - Registration date
 * @property {string} attendance_status - Attendance status (Registered, Attended)
 * @property {string|null} result_position - Position achieved (null if not placed)
 * @property {string|null} certificate_no - Certificate number (null if not awarded)
 */
export const participations = [
  {
    id: 1,
    student_id: 1,
    event_id: 1,
    event_title: "Annual Sports Day",
    event_type: "Sports",
    venue: "University Main Ground",
    start_date: "2026-07-10T09:00:00",
    end_date: "2026-07-10T17:00:00",
    participation_role: "Participant",
    registration_date: "2026-06-22T14:00:00",
    attendance_status: "Registered",
    result_position: null,
    certificate_no: null,
  },
  {
    id: 2,
    student_id: 1,
    event_id: 4,
    event_title: "Programming Competition",
    event_type: "Competition",
    venue: "Computer Lab A",
    start_date: "2026-05-18T09:00:00",
    end_date: "2026-05-18T14:00:00",
    participation_role: "Participant",
    registration_date: "2026-05-10T12:00:00",
    attendance_status: "Attended",
    result_position: "2nd Place",
    certificate_no: "CERT-2026-001",
  },
];

/**
 * ============================================
 * NOTIFICATIONS
 * ============================================
 * 
 * Student notifications and alerts
 * 
 * @constant {Array} notifications
 * @property {number} id - Notification ID
 * @property {string} type - Notification type (in_app, email)
 * @property {string} message - Notification message
 * @property {boolean} is_read - Read status
 * @property {string} created_at - Notification date
 */
export const notifications = [
  {
    id: 1,
    type: "in_app",
    message: "Your fee payment is due on 30 June.",
    is_read: false,
    created_at: "2026-06-22",
  },
  {
    id: 2,
    type: "in_app",
    message: "Database Assignment is due tomorrow.",
    is_read: false,
    created_at: "2026-06-23",
  },
  {
    id: 3,
    type: "email",
    message: "Result of Mid-Term examination has been published.",
    is_read: true,
    created_at: "2026-06-20",
  },
];

/**
 * ============================================
 * COMPLAINTS
 * ============================================
 * 
 * Student complaints and their status
 * 
 * @constant {Array} complaints
 * @property {number} id - Complaint ID
 * @property {string} complaint_type - Type of complaint
 * @property {string} description - Complaint description
 * @property {string} status - Complaint status (Open, Resolved, etc.)
 * @property {string} created_at - Complaint date
 */
export const complaints = [
  {
    id: 1,
    complaint_type: "Classroom Issue",
    description: "Projector in Room A101 is not working.",
    status: "Open",
    created_at: "2026-06-20",
  },
  {
    id: 2,
    complaint_type: "Library Issue",
    description: "Requested book is unavailable.",
    status: "Resolved",
    created_at: "2026-06-10",
  },
];

/**
 * ============================================
 * CHAT SESSIONS
 * ============================================
 * 
 * Student's chat sessions
 * 
 * @constant {Array} chatSessions
 * @property {number} id - Session ID
 * @property {string} title - Session title
 * @property {string} role - User role
 * @property {string} bot_type - Bot type (general, etc.)
 * @property {string} created_at - Session creation date
 */
export const chatSessions = [
  {
    id: 1,
    title: "General Chat",
    role: "student",
    bot_type: "general",
    created_at: "2026-06-22",
  },
];

/**
 * ============================================
 * CHAT MESSAGES
 * ============================================
 * 
 * Messages from chat sessions
 * 
 * @constant {Array} chatMessages
 * @property {number} id - Message ID
 * @property {string} role - Message sender role (user, assistant)
 * @property {string} content - Message content
 * @property {string} created_at - Message timestamp
 */
export const chatMessages = [
  {
    id: 1,
    role: "assistant",
    content: "Hello Fazail! How can I help you today?",
    created_at: "2026-06-22 10:00",
  },
  {
    id: 2,
    role: "user",
    content: "Show my attendance.",
    created_at: "2026-06-22 10:01",
  },
  {
    id: 3,
    role: "assistant",
    content: "Your current attendance is 92%.",
    created_at: "2026-06-22 10:01",
  },
];