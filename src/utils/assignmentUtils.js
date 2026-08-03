/**
 * ============================================
 * ASSIGNMENT UTILITIES
 * ============================================
 * 
 * Purpose: Merge assignment data with submission data
 * Used by: Student assignment pages
 * 
 * Data Sources:
 * - GET /student/assignments - Assignment list
 * - GET /student/submissions - Submission list
 * 
 * Enriches assignments with:
 * - status: 'Pending' | 'Submitted' | 'Graded'
 * - submission: { id, file_url, file_name, submitted_at }
 * - marks: number | null
 * - feedback: string
 * ============================================
 */

/**
 * Merge assignments with submissions
 * 
 * Matches each assignment with its corresponding submission
 * and adds submission details and status
 * 
 * @param {Array} assignments - List of assignments from API
 * @param {Array} submissions - List of submissions from API
 * @returns {Array} Enriched assignments with submission data
 * 
 * @example
 * const assignments = [{ id: 1, title: "Math Homework" }];
 * const submissions = [{ assignment: 1, marks: 85, file_url: "..." }];
 * const result = mergeAssignments(assignments, submissions);
 * // Result: [{ id: 1, title: "Math Homework", status: "Graded", marks: 85 }]
 */
export const mergeAssignments = (
  assignments = [],
  submissions = []
) => {
  return assignments.map(
    (assignment) => {
      // Find matching submission for this assignment
      const submission =
        submissions.find(
          (item) =>
            item.assignment ===
            assignment.id
        );

      // Determine status based on submission
      let status = "Pending";

      if (submission) {
        status =
          submission.marks != null
            ? "Graded"
            : "Submitted";
      }

      return {
        ...assignment,

        // Status: Pending | Submitted | Graded
        status,

        // Fallback to created_at or due_date if assigned_at is missing
        assigned_at:
          assignment.assigned_at ??
          assignment.created_at ??
          assignment.due_date,

        // Submission details if exists
        submission: submission
          ? {
              id: submission.id,
              file_url:
                submission.file_url,
              // Extract filename from URL
              file_name:
                submission.file_url
                  .split("/")
                  .pop(),
              submitted_at:
                submission.submitted_at,
            }
          : null,

        // Marks and feedback (null/empty if not graded)
        marks:
          submission?.marks ??
          null,

        feedback:
          submission?.feedback ??
          "",
      };
    }
  );
};