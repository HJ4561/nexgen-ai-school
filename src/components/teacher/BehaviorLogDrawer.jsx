/**
 * ============================================
 * BEHAVIOR LOG DRAWER COMPONENT (TEACHER VIEW)
 * ============================================
 * 
 * Purpose: Modal for teachers to log student behavior
 * Features:
 * - Student name display with info alert
 * - Behavior type dropdown selection
 * - Severity level selection (Low, Medium, High)
 * - Description text area
 * - Submit and Cancel actions
 * - Responsive modal layout
 * 
 * Dependencies:
 * - lucide-react for icons (AlertCircle)
 * - @/components/ui/Modal for modal container
 * - @/components/ui/Button for action buttons
 * - @/components/ui/TextArea for description input
 * - @/components/ui/Select for dropdowns
 * 
 * Usage:
 * <BehaviorLogDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   student={selectedStudent}
 * />
 * ============================================
 */

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import TextArea from "@/components/ui/TextArea";
import Select from '@/components/ui/Select';
import { AlertCircle } from 'lucide-react';

/**
 * ============================================
 * BEHAVIOR LOG DRAWER COMPONENT (TEACHER VIEW)
 * ============================================
 * 
 * Renders a modal for logging student behavior
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback function to close the modal
 * @param {Object} props.student - Student object being logged
 * @param {string} props.student.full_name - Student's full name
 * @returns {JSX.Element} Behavior log drawer UI
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [selectedStudent, setSelectedStudent] = useState(null);
 * 
 * <BehaviorLogDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   student={selectedStudent}
 * />
 * ============================================
 */
const BehaviorLogDrawer = ({ isOpen, onClose, student }) => {
  /**
   * ============================================
   * BEHAVIOR DATA STATE
   * ============================================
   * 
   * Manages the behavior log form data
   * - type: Selected behavior type
   * - description: Behavior description
   * - severity: Severity level (low, medium, high)
   */
  const [behaviorData, setBehaviorData] = useState({
    type: '',
    description: '',
    severity: 'medium'
  });

  /**
   * ============================================
   * HANDLE SUBMIT
   * ============================================
   * 
   * Handles behavior log submission
   * Currently logs to console (TODO: Implement API integration)
   * Closes the modal after submission
   */
  const handleSubmit = () => {
    // TODO: Implement behavior log submission
    console.log('Behavior log:', { student, ...behaviorData });
    onClose();
  };

  /**
   * ============================================
   * OPTIONS CONFIGURATION
   * ============================================
   * 
   * Severity levels for behavior logging
   * - Low: Minor issues
   * - Medium: Moderate issues
   * - High: Serious issues
   * 
   * Behavior types for categorization
   */
  const severityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const behaviorTypes = [
    'Positive Contribution',
    'Participation',
    'Disruption',
    'Disrespect',
    'Late Submission',
    'Other'
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Behavior Log">
      <div className="space-y-4">
        {/* ─── Student Info Alert ─── */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700">
            <AlertCircle size={16} className="inline mr-2" />
            Logging behavior for: <strong>{student?.full_name}</strong>
          </p>
        </div>

        {/* ─── Behavior Type Dropdown ─── */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Behavior Type</label>
          <Select
            value={behaviorData.type}
            onChange={(e) => setBehaviorData({ ...behaviorData, type: e.target.value })}
          >
            <option value="">Select Type</option>
            {behaviorTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
        </div>

        {/* ─── Severity Dropdown ─── */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Severity</label>
          <Select
            value={behaviorData.severity}
            onChange={(e) => setBehaviorData({ ...behaviorData, severity: e.target.value })}
          >
            {severityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </div>

        {/* ─── Description Text Area ─── */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Description</label>
          <TextArea
            value={behaviorData.description}
            onChange={(e) => setBehaviorData({ ...behaviorData, description: e.target.value })}
            placeholder="Describe the behavior..."
            rows={4}
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
            Submit Log
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BehaviorLogDrawer;