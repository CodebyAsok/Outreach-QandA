"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { signOut } from '@/utils/auth';
import SubmissionModal from './SubmissionModal';
import { generateSubmissionPDF } from '@/utils/pdfGenerator';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('outreach_assessment')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/admin';
  };

  const handleView = (submission) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  const handleDownloadPDF = (submission) => {
    generateSubmissionPDF(submission);
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const filteredSubmissions = submissions.filter(sub =>
    sub.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.phone_number?.includes(searchQuery)
  );

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-logo">
            <img src="/faith-logo-3.png" alt="FAITH Logo" className="admin-logo-img" />
            <span>Admin Dashboard</span>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">Logout</button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-card">
          <h2 className="admin-card-title">Psychologist Interview Submissions</h2>
          
          <div className="admin-search-bar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>

          {loading ? (
            <div className="admin-loading">Loading submissions...</div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Submission Date</th>
                    <th>Phone</th>
                    <th>Time Taken</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="admin-no-data">No submissions found</td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => (
                      <tr key={sub.id}>
                        <td>{sub.full_name}</td>
                        <td>{new Date(sub.submitted_at).toLocaleDateString()}</td>
                        <td>{sub.phone_number}</td>
                        <td>{formatTime(sub.time_taken_seconds)}</td>
                        <td>
                          <div className="admin-actions">
                            <button
                              onClick={() => handleView(sub)}
                              className="admin-action-btn admin-view-btn"
                              title="View"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(sub)}
                              className="admin-action-btn admin-download-btn"
                              title="Download PDF"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showModal && selectedSubmission && (
        <SubmissionModal
          submission={selectedSubmission}
          onClose={() => setShowModal(false)}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </div>
  );
}
