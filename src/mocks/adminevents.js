/**
 * ============================================
 * MOCK DATA - EVENTS
 * ============================================
 * 
 * Purpose: Mock data for events and related entities
 * Used for: Development, testing, and demo environments
 * 
 * Data Types:
 * - Events: School events with dates, venues, and metadata
 * - Event Participants: Student participation records
 * - Certificates: Award certificates for event participation
 * 
 * Usage:
 * import { MOCK_EVENTS, MOCK_EVENT_PARTICIPANTS, MOCK_CERTIFICATES } from '@/mocks/events';
 * ============================================
 */

/**
 * ============================================
 * MOCK EVENTS
 * ============================================
 * 
 * Collection of school events with details
 * 
 * @constant {Array} MOCK_EVENTS
 * @property {number} id - Unique event identifier
 * @property {string} event_name - Name of the event
 * @property {string} event_date - ISO date string of the event
 * @property {string} venue - Location of the event
 * @property {string} created_at - ISO date string when event was created
 * 
 * @example
 * // Get upcoming events
 * const upcoming = MOCK_EVENTS.filter(e => new Date(e.event_date) > new Date());
 */
export const MOCK_EVENTS = [
  {
    id: 1,
    event_name: "Annual Science Symposium",
    event_date: "2023-11-24T09:00:00Z",
    venue: "Main Auditorium",
    created_at: "2023-10-01T10:00:00Z",
  },
  {
    id: 2,
    event_name: "Inter-School Athletic Meet",
    event_date: "2023-12-05T08:00:00Z",
    venue: "Sports Complex",
    created_at: "2023-10-10T14:00:00Z",
  },
  {
    id: 3,
    event_name: "Winter Gala Concert",
    event_date: "2023-12-15T18:30:00Z",
    venue: "Arts Center",
    created_at: "2023-11-01T09:00:00Z",
  },
  {
    id: 4,
    event_name: "Robotics Competition 2023",
    event_date: "2024-01-20T09:00:00Z",
    venue: "Engineering Lab",
    created_at: "2023-11-15T11:00:00Z",
  },
  {
    id: 5,
    event_name: "Annual Sports Day",
    event_date: "2024-02-10T08:00:00Z",
    venue: "Main Ground",
    created_at: "2023-12-01T10:00:00Z",
  },
];

/**
 * ============================================
 * MOCK EVENT PARTICIPANTS
 * ============================================
 * 
 * Records of student participation in events
 * 
 * @constant {Array} MOCK_EVENT_PARTICIPANTS
 * @property {number} id - Unique participant identifier
 * @property {number} event_id - Reference to the event
 * @property {number} student_id - Reference to the student
 * @property {string} student_name - Name of the student
 * @property {string} role - Role in the event (Participant, Judge, Volunteer)
 * @property {string} position - Specific position or title
 * 
 * @example
 * // Get all participants for an event
 * const participants = MOCK_EVENT_PARTICIPANTS.filter(p => p.event_id === 1);
 */
export const MOCK_EVENT_PARTICIPANTS = [
  { id: 1, event_id: 1, student_id: 1, student_name: "Ali Hassan", role: "Participant", position: "Presenter" },
  { id: 2, event_id: 1, student_id: 2, student_name: "Fatima Malik", role: "Participant", position: "Researcher" },
  { id: 3, event_id: 1, student_id: 3, student_name: "Usman Khan", role: "Judge", position: "Panel Lead" },
  { id: 4, event_id: 1, student_id: 4, student_name: "Ayesha Siddiqui", role: "Volunteer", position: "Coordinator" },
  { id: 5, event_id: 2, student_id: 5, student_name: "Bilal Sheikh", role: "Participant", position: "Athlete" },
  { id: 6, event_id: 2, student_id: 6, student_name: "Zara Qureshi", role: "Participant", position: "Runner" },
  { id: 7, event_id: 3, student_id: 1, student_name: "Ali Hassan", role: "Participant", position: "Performer" },
  { id: 8, event_id: 3, student_id: 7, student_name: "Hamid Raza", role: "Volunteer", position: "Stage Crew" },
];

/**
 * ============================================
 * MOCK CERTIFICATES
 * ============================================
 * 
 * Award certificates issued to students for event participation
 * 
 * @constant {Array} MOCK_CERTIFICATES
 * @property {number} id - Unique certificate identifier
 * @property {number} student_id - Reference to the student
 * @property {string} student_name - Name of the student
 * @property {number} event_id - Reference to the event
 * @property {string} event_name - Name of the event
 * @property {string} cert_type - Type of certificate (merit, participation, etc.)
 * @property {string} generated_text - Certificate text content
 * @property {string} created_at - ISO date string when certificate was issued
 * 
 * @example
 * // Get all certificates for a student
 * const studentCerts = MOCK_CERTIFICATES.filter(c => c.student_id === 1);
 */
export const MOCK_CERTIFICATES = [
  {
    id: 1,
    student_id: 1,
    student_name: "Ali Hassan",
    event_id: 1,
    event_name: "Annual Science Symposium",
    cert_type: "merit",
    generated_text: "This certificate is awarded to Ali Hassan for outstanding performance in the Annual Science Symposium.",
    created_at: "2023-11-25T10:00:00Z",
  },
  {
    id: 2,
    student_id: 2,
    student_name: "Fatima Malik",
    event_id: 1,
    event_name: "Annual Science Symposium",
    cert_type: "merit",
    generated_text: "This certificate is awarded to Fatima Malik for excellent research presentation in the Annual Science Symposium.",
    created_at: "2023-11-25T10:30:00Z",
  },
];