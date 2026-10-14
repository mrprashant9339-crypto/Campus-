import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationPriority } from '../../types';
import { X, Megaphone, AlertTriangle, Pin, CheckCircle2 } from 'lucide-react';

export const CreateAnnouncementModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { addAnnouncement } = useApp();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<NotificationPriority>('normal');
  const [targetGroup, setTargetGroup] = useState('ME 3rd Sem — Section A');
  const [isPinned, setIsPinned] = useState(true);
  const [requiresAck, setRequiresAck] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    addAnnouncement({
      title,
      body,
      priority,
      targetGroup,
      isPinned,
      requiresAck,
    });

    onClose();
    alert(`Announcement "${title}" broadcasted to ${targetGroup}.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-800">
              Create Faculty Announcement (T-04)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Announcement Title</label>
            <input
              type="text"
              placeholder="E.g., Assignment 2 Submission Date Extended"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Message Body</label>
            <textarea
              rows={3}
              placeholder="Enter exact notice instructions for students..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Cohort</label>
              <select
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2"
              >
                <option value="ME 3rd Sem — Section A">ME 3rd Sem — Section A</option>
                <option value="ME 3rd Sem — Section B">ME 3rd Sem — Section B</option>
                <option value="Entire Mechanical Department">Mechanical Department</option>
                <option value="Entire College">Entire College (Broadcast)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Priority Tier</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-2 font-bold"
              >
                <option value="normal">Normal (Blue)</option>
                <option value="high">High (Yellow/Orange)</option>
                <option value="emergency">🚨 Emergency (Red - Bypass DND)</option>
                <option value="low">Low (Informational)</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Pin notice to the top of students' Home & Feed screen</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={requiresAck}
                onChange={(e) => setRequiresAck(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Require explicit student acknowledgement (Read Tracking)</span>
            </label>
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
              Broadcast Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
