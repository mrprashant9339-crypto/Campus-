import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle2, FileText, Award, MessageSquare } from 'lucide-react';

export const SubmissionsReviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
}> = ({ isOpen, onClose, assignmentId }) => {
  const { assignments, gradeSubmission } = useApp();

  const asg = assignments.find((a) => a.id === assignmentId) || assignments[0];

  const [awardedMarks, setAwardedMarks] = useState(19);
  const [feedbackText, setFeedbackText] = useState('Clean derivations and accurate thermodynamic calculations.');

  if (!isOpen || !asg) return null;

  const handleGrade = () => {
    gradeSubmission(asg.id, awardedMarks, feedbackText);
    alert(`Graded submission for Assignment with ${awardedMarks}/${asg.maxMarks} marks.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">
              Grade Student Submissions (T-06)
            </h3>
            <p className="text-[11px] text-slate-500">{asg.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Student: Prashant Kumar</span>
              <span className="font-mono text-indigo-700 font-bold">Roll: ME2024001</span>
            </div>
            <div className="text-slate-600">
              File: <strong className="font-mono text-slate-800">Prashant_Kumar_ME3A_Assignment2.pdf</strong> (1.8 MB)
            </div>
            <div className="text-[11px] text-slate-500">
              Submitted: Yesterday 18:30 • On-time submission
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Marks Awarded (Out of {asg.maxMarks}):
            </label>
            <input
              type="number"
              max={asg.maxMarks}
              min={0}
              value={awardedMarks}
              onChange={(e) => setAwardedMarks(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg p-2 font-bold text-sm"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Faculty Feedback & Rubric Remarks:
            </label>
            <textarea
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGrade}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
          >
            Save Grade & Post Score
          </button>
        </div>
      </div>
    </div>
  );
};
