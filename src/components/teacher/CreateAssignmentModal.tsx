import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, FileText, Calendar, Plus } from 'lucide-react';

export const CreateAssignmentModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { createAssignment, currentUser, currentCollege } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectName, setSubjectName] = useState('Thermodynamics (ME301)');
  const [sectionName, setSectionName] = useState('ME-3A');
  const [dueDays, setDueDays] = useState(7);
  const [maxMarks, setMaxMarks] = useState(20);
  const [submissionType, setSubmissionType] = useState<'file' | 'text' | 'both'>('file');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const dueDate = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString();

    createAssignment({
      collegeId: currentCollege.id,
      teacherId: currentUser.id,
      teacherName: currentUser.fullName,
      subjectName,
      sectionName,
      title,
      description,
      dueAt: dueDate,
      maxMarks,
      submissionType,
    });

    onClose();
    alert(`Assignment "${title}" created for Section ${sectionName}.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-800">
              Create Coursework Assignment (T-05)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Assignment Title</label>
            <input
              type="text"
              placeholder="E.g., Assignment 3 — Steam Power Cycles & Rankine Analysis"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Problem Statement / Questions</label>
            <textarea
              rows={3}
              placeholder="List specific numerical problems, derivations, or project deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Subject</label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
              >
                <option value="Thermodynamics (ME301)">Thermodynamics (ME301)</option>
                <option value="Engineering Mechanics (ME302)">Engineering Mechanics (ME302)</option>
                <option value="Strength of Materials (ME303)">Strength of Materials (ME303)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Section</label>
              <select
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
              >
                <option value="ME-3A">ME-3A (46 Students)</option>
                <option value="ME-3B">ME-3B (44 Students)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Maximum Marks</label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Due in (Days)</label>
              <select
                value={dueDays}
                onChange={(e) => setDueDays(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2"
              >
                <option value={3}>3 Days</option>
                <option value={7}>7 Days (1 Week)</option>
                <option value={14}>14 Days (2 Weeks)</option>
              </select>
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
              type="submit"
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
            >
              Publish Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
