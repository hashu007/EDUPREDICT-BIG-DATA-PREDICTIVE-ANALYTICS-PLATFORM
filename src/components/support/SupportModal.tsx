import React, { useState } from 'react';
import {
  LifeBuoy,
  Send,
  CheckCircle2,
  HelpCircle,
  Mail,
  MessageSquare,
  FileQuestion,
  ChevronDown
} from 'lucide-react';
import { SupportTicket, User, ThemeMode } from '../../types';

interface SupportModalProps {
  activeUser: User;
  theme?: ThemeMode;
}

export const SupportModal: React.FC<SupportModalProps> = ({ activeUser }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TCK-802',
      timestamp: '2026-09-29',
      senderName: activeUser.name,
      senderEmail: activeUser.email,
      role: activeUser.role,
      category: 'Model Query',
      priority: 'medium',
      subject: 'Inquiry regarding K-Means cluster centroid re-centering frequency',
      message: 'Does the Spark MLlib job recalculate the 4 cluster centroids every 24 hours or on every batch commit?',
      status: 'in_progress'
    },
    {
      id: 'TCK-791',
      timestamp: '2026-09-27',
      senderName: 'Prof. Marcus Vance',
      senderEmail: 'm.vance@university.edu',
      role: 'faculty',
      category: 'Intervention Workflow',
      priority: 'high',
      subject: 'Attendance warning automated notification dispatch test',
      message: 'Verified that students below 70% receive automated Dean notices successfully.',
      status: 'resolved'
    }
  ]);

  const [category, setCategory] = useState<SupportTicket['category']>('Model Query');
  const [priority, setPriority] = useState<SupportTicket['priority']>('medium');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How does EduPredict calculate the student dropout risk score?',
      a: 'EduPredict utilizes a multi-factor predictive model trained on academic data. Key factors include classroom attendance rate (34%), weekly study hours and quiz practice (24%), midterm exam scores (21%), and assignment punctuality (12%).'
    },
    {
      q: 'How does EduPredict keep student records safely stored and backed up?',
      a: 'Campus Cloud Storage provides distributed, secure, and fault-tolerant storage for student course records, attendance check-ins, and study hours. Records are partitioned by semester and saved with automatic 3x backup protection across multiple independent campus drives, ensuring zero data loss.'
    },
    {
      q: 'How are statistical anomalies (like ghost attendance) detected?',
      a: 'The system runs automated comparison algorithms to detect discrepancies between student effort metrics (e.g. 95% attendance) and academic outcomes (e.g. < 45% exam grades), alerting faculty to unmonitored exam anxiety or passive presence.'
    },
    {
      q: 'How do faculty log student interventions?',
      a: 'Faculty members can access the course roster in the Faculty Portal, select any student flagged with High or Critical risk, and log interventions such as 1-on-1 counseling, peer tutoring referrals, or Dean warnings. Logging an intervention immediately recalibrates the student’s risk trajectory.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: SupportTicket = {
      id: `TCK-${Math.floor(Math.random() * 900 + 100)}`,
      timestamp: new Date().toISOString().split('T')[0],
      senderName: activeUser.name,
      senderEmail: activeUser.email,
      role: activeUser.role,
      category,
      priority,
      subject,
      message,
      status: 'open'
    };

    setTickets([newTicket, ...tickets]);
    setSubmitted(true);
    setSubject('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-700 font-bold">
            <span>EduPredict Academic & Technical Support</span>
            <span className="text-slate-300">·</span>
            <span>Academic Technology Helpdesk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display-academic font-bold text-slate-900 mt-1">
            Academic Advising, Feedback & Technical Support Desk
          </h1>
          <p className="text-xs text-slate-500 font-serif-academic italic mt-0.5">
            Contact the institutional academic advisory team for student record reviews, guidance queries, or campus system assistance.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-amber-900 bg-amber-50 px-3.5 py-2 rounded-lg border border-amber-200">
          <Mail className="w-3.5 h-3.5 text-amber-700" />
          <span>support@edupredict.internal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Submission Form */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold font-display-academic text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-700" />
            <span>Submit a Feedback or Support Ticket</span>
          </h3>

          {submitted && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ticket submitted successfully! A support specialist will respond shortly.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-amber-600"
                >
                  <option value="Model Query">Grade Prediction & Guidance Question</option>
                  <option value="Data Discrepancy">Student Record or Attendance Discrepancy</option>
                  <option value="HDFS Sync">Cloud Storage & Drive Backup Sync</option>
                  <option value="Intervention Workflow">Counseling & Intervention Workflow</option>
                  <option value="Academic Guidance">Academic Advisory & Curriculum Support</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-amber-600 capitalize"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your question or issue..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-amber-600"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Detailed Description</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide specific details, student IDs, or course references..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-amber-600"
                required
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        </div>

        {/* Existing Tickets */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3.5">
            <h3 className="text-sm font-bold font-display-academic text-slate-900 flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-amber-700" />
              <span>Tracked Mentorship Tickets</span>
            </h3>

            <div className="space-y-2.5">
              {tickets.map((t) => (
                <div key={t.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-amber-800 font-bold">{t.id}</span>
                    <span
                      className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded ${
                        t.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : t.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {t.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">{t.subject}</div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{t.message}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
                    <span>Category: {t.category}</span>
                    <span>Date: {t.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold font-display-academic text-slate-900 flex items-center gap-2">
          <FileQuestion className="w-4 h-4 text-amber-700" />
          <span>Technical FAQ & Knowledge Repository</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-900">{faq.q}</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
