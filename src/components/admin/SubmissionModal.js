"use client";

export default function SubmissionModal({ submission, onClose, onDownloadPDF }) {
  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Submission Details</h3>
          <button onClick={onClose} className="admin-modal-close">×</button>
        </div>
        
        <div className="admin-modal-content">
          <div className="admin-modal-section">
            <h4 className="admin-modal-section-title">Personal Information</h4>
            <div className="admin-modal-grid">
              <div className="admin-modal-field">
                <label>Full Name</label>
                <span>{submission.full_name}</span>
              </div>
              <div className="admin-modal-field">
                <label>Email</label>
                <span>{submission.email || 'N/A'}</span>
              </div>
              <div className="admin-modal-field">
                <label>Phone</label>
                <span>{submission.phone_number}</span>
              </div>
              <div className="admin-modal-field">
                <label>Time Taken</label>
                <span>{formatTime(submission.time_taken_seconds)}</span>
              </div>
              <div className="admin-modal-field">
                <label>Submission Date</label>
                <span>{new Date(submission.submitted_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="admin-modal-section">
            <h4 className="admin-modal-section-title">Written Assessment Responses</h4>
            <div className="admin-modal-questions">
              <div className="admin-modal-question">
                <label>Q1: What is the main objective of mental health project?</label>
                <p>{submission.q1_objective}</p>
              </div>
              <div className="admin-modal-question">
                <label>Q2: Target Populations</label>
                <p>{Array.isArray(submission.q2_target_populations) ? submission.q2_target_populations.join(', ') : 'N/A'}</p>
              </div>
              <div className="admin-modal-question">
                <label>Q3: Communication skill most important during counselling?</label>
                <p>{submission.q3_communication}</p>
              </div>
              <div className="admin-modal-question">
                <label>Q4: Program Flow</label>
                <p>{submission.q4_program_flow}</p>
              </div>
              <div className="admin-modal-question">
                <label>Q5: Key Roles and Responsibilities</label>
                <p>{submission.q5_roles}</p>
              </div>
              <div className="admin-modal-question">
                <label>Q6: Referral Circumstances</label>
                <p>{submission.q6_referral}</p>
              </div>
              <div className="admin-modal-question">
                <label>Q7: Challenges and Risks</label>
                <p>{submission.q7_challenges}</p>
              </div>
              <div className="admin-modal-question">
                <label>Q8: Key Learnings</label>
                <p>{submission.q8_learnings}</p>
              </div>
              <div className="admin-modal-question">
                <label>Q9: Confidentiality and Ethics</label>
                <p>{submission.q9_confidentiality}</p>
              </div>
              <div className="admin-modal-question">
                <label>Q10: Refusal Handling</label>
                <p>{submission.q10_refusal}</p>
              </div>
              <div className="admin-modal-question">
                <label>Q11: Contract Renewal Factors</label>
                <p>{submission.q11_contract_renewal}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button
            onClick={() => onDownloadPDF(submission)}
            className="admin-modal-download-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
