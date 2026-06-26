import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateSubmissionPDF(submission) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(0, 96, 57); // Primary color
  doc.text('Psychologist Interview Submission', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);

  // Personal Information
  doc.setFontSize(16);
  doc.setTextColor(0, 96, 57);
  doc.text('Personal Information', 20, 45);

  const personalData = [
    ['Full Name', submission.full_name || 'N/A'],
    ['Email', submission.email || 'N/A'],
    ['Phone', submission.phone_number || 'N/A'],
    ['Time Taken', formatTime(submission.time_taken_seconds)],
    ['Submission Date', new Date(submission.submitted_at).toLocaleString()],
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Field', 'Value']],
    body: personalData,
    theme: 'grid',
    headStyles: { fillColor: [0, 96, 57] },
  });

  // Written Assessment Responses
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(16);
  doc.setTextColor(0, 96, 57);
  doc.text('Written Assessment Responses', 20, finalY);

  const questions = [
    ['Q1: Objective', submission.q1_objective || 'N/A'],
    ['Q2: Target Populations', Array.isArray(submission.q2_target_populations) ? submission.q2_target_populations.join(', ') : 'N/A'],
    ['Q3: Communication', submission.q3_communication || 'N/A'],
    ['Q4: Program Flow', submission.q4_program_flow || 'N/A'],
    ['Q5: Roles', submission.q5_roles || 'N/A'],
    ['Q6: Referral', submission.q6_referral || 'N/A'],
    ['Q7: Challenges', submission.q7_challenges || 'N/A'],
    ['Q8: Learnings', submission.q8_learnings || 'N/A'],
    ['Q9: Confidentiality', submission.q9_confidentiality || 'N/A'],
    ['Q10: Refusal', submission.q10_refusal || 'N/A'],
    ['Q11: Contract Renewal', submission.q11_contract_renewal || 'N/A'],
  ];

  autoTable(doc, {
    startY: finalY + 5,
    head: [['Question', 'Response']],
    body: questions,
    theme: 'grid',
    headStyles: { fillColor: [0, 96, 57] },
    styles: { cellWidth: 'auto' },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 140 }
    }
  });

  // Save PDF
  doc.save(`Interview_${submission.full_name.replace(/\s+/g, '_')}.pdf`);
}

function formatTime(seconds) {
  if (!seconds) return 'N/A';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}
