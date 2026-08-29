/**
 * ============================================
 * ASSIGNMENT SUBMISSION MODAL COMPONENT
 * ============================================
 * 
 * Purpose: Modal for students to submit assignments
 * Features:
 * - Displays assignment title
 * - File upload input
 * - Optional comment text area
 * - Submit and Cancel actions
 * - Responsive modal layout
 * 
 * Dependencies:
 * - @/components/ui/Modal for modal container
 * - @/components/ui/Button for action buttons
 * - @/components/ui/Input for file input
 * - @/components/ui/TextArea for comment input
 * 
 * Usage:
 * <AssignmentSubmissionModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   assignment={selectedAssignment}
 *   onSubmit={handleSubmit}
 * />
 * ============================================
 */

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from "@/components/ui/TextArea";

/**
 * ============================================
 * ASSIGNMENT SUBMISSION MODAL COMPONENT
 * ============================================
 * 
 * Renders a modal for submitting assignments
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback function to close the modal
 * @param {Object} props.assignment - Assignment object being submitted
 * @param {Function} props.onSubmit - Callback function to submit the assignment
 * @returns {JSX.Element} Assignment submission modal UI
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [selectedAssignment, setSelectedAssignment] = useState(null);
 * 
 * const handleSubmit = (submissionData) => {
 *   // Handle file upload and submission
 *   console.log(submissionData);
 * };
 * 
 * <AssignmentSubmissionModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   assignment={selectedAssignment}
 *   onSubmit={handleSubmit}
 * />
 * ============================================
 */
const AssignmentSubmissionModal = ({ isOpen, onClose, assignment, onSubmit }) => {
  /**
   * ============================================
   * SUBMISSION STATE
   * ============================================
   * 
   * Manages the submission form data
   * - file: Selected file object
   * - comment: Optional comment text
   */
  const [submission, setSubmission] = useState({
    file: null,
    comment: ''
  });

  /**
   * ============================================
   * HANDLE SUBMIT
   * ============================================
   * 
   * Triggers the submit callback with submission data
   * Closes the modal after submission
   */
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(submission);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Assignment">
      <div className="space-y-4">
        {/* ─── Assignment Title ─── */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Assignment</label>
          <p className="font-medium">{assignment?.title || 'Untitled'}</p>
        </div>

        {/* ─── File Upload ─── */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">File</label>
          <Input
            type="file"
            onChange={(e) => setSubmission({ ...submission, file: e.target.files[0] })}
          />
        </div>

        {/* ─── Comment Input ─── */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Comment</label>
          <TextArea
            value={submission.comment}
            onChange={(e) => setSubmission({ ...submission, comment: e.target.value })}
            placeholder="Add any additional comments..."
            rows={3}
          />
        </div>

        {/* ─── Action Buttons ─── */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignmentSubmissionModal;