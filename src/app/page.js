"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

const TIME_LIMIT_SECONDS = 30 * 60; // 30 minutes

export default function Home() {
  const [step, setStep] = useState('register'); // 'register', 'quiz', 'success'
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    q1_objective: '',
    q2_target_populations: [],
    q3_communication: '',
    q4_program_flow: '',
    q5_roles: '',
    q6_referral: '',
    q7_challenges: '',
    q8_learnings: '',
    q9_confidentiality: '',
    q10_refusal: '',
    q11_contract_renewal: ''
  });

  const timerRef = useRef(null);

  useEffect(() => {
    if (step === 'quiz') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(null, true); // auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  useEffect(() => {
    // Show warning when exactly 10 minutes (600 seconds) remain
    if (timeLeft === 10 * 60 && step === 'quiz') {
      setShowWarning(true);
      // Auto-hide the toast after 10 seconds
      setTimeout(() => setShowWarning(false), 10000);
    }
  }, [timeLeft, step]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => {
        const currentList = prev[name] || [];
        if (checked) {
          return { ...prev, [name]: [...currentList, value] };
        } else {
          return { ...prev, [name]: currentList.filter(item => item !== value) };
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const startQuiz = (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone_number) {
      setError('Full Name and Phone Number are required.');
      return;
    }
    setError('');
    setStep('quiz');
  };

  const handleSubmit = async (e, isAutoSubmit = false) => {
    if (e) e.preventDefault();
    
    // Custom validation for checkboxes
    if (formData.q2_target_populations.length === 0 && !isAutoSubmit) {
      setError('Please select at least one target population for question 2.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const timeTaken = TIME_LIMIT_SECONDS - timeLeft;
      
      const { error: dbError } = await supabase
        .from('outreach_assessment')
        .insert([{
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone_number,
          q1_objective: formData.q1_objective,
          q2_target_populations: formData.q2_target_populations,
          q3_communication: formData.q3_communication,
          q4_program_flow: formData.q4_program_flow,
          q5_roles: formData.q5_roles,
          q6_referral: formData.q6_referral,
          q7_challenges: formData.q7_challenges,
          q8_learnings: formData.q8_learnings,
          q9_confidentiality: formData.q9_confidentiality,
          q10_refusal: formData.q10_refusal,
          q11_contract_renewal: formData.q11_contract_renewal,
          time_taken_seconds: timeTaken
        }]);

      if (dbError) throw dbError;

      if (timerRef.current) clearInterval(timerRef.current);
      setStep('success');
    } catch (err) {
      console.error(err);
      setError('An error occurred while submitting your assessment. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <header className="header">
        <div className="container header-content">
          <div className="logo-container">
            <img src="/faith-logo-3.png" alt="FAITH Logo" className="logo-img" />
            <span>Training Assessment</span>
          </div>
          {step === 'quiz' && (
            <div className={`timer-badge ${timeLeft <= 300 ? 'danger' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </header>

      <main className="container">
        {step === 'register' && (
          <div className="card">
            <h2 className="card-title">Participant Registration</h2>
            <p className="card-subtitle">Please enter your details to begin the Training Assessment.</p>
            
            <form onSubmit={startQuiz}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  name="full_name"
                  className="form-input" 
                  placeholder="e.g. Ram Bahadur"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input 
                  type="tel" 
                  name="phone_number"
                  className="form-input" 
                  placeholder="e.g. 9841234567"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email (Optional)</label>
                <input 
                  type="email" 
                  name="email"
                  className="form-input" 
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              {error && <div className="error-text" style={{marginBottom: '1rem'}}>{error}</div>}
              <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
                Start Assessment
              </button>
            </form>
          </div>
        )}

        {step === 'quiz' && (
          <form onSubmit={handleSubmit} className="card">
            <h2 className="card-title">Training Assessment (तालिम मूल्याङ्कन)</h2>
            <p className="card-subtitle">Please answer all the questions carefully. Time limit: 30 minutes.</p>
            
            {/* Q1 */}
            <div className="form-group">
              <p className="question-text">
                1. What is the main objective of mental health project?<br/>
                <span style={{fontSize: '0.9em', color: 'var(--color-text-muted)'}}>(मानसिक स्वास्थ्य परियोजनाको मुख्य उद्देश्य के हो?)</span>
              </p>
              <div className="options-group">
                {['a. To provide financial support', 'b. To early identify and provide appropriate psychosocial support and timely referral for the mental well-beings.', 'c. To distribute medicines', 'd. To conduct HIV testing only'].map((opt, i) => (
                  <label key={i} className={`option-label ${formData.q1_objective === opt ? 'selected' : ''}`}>
                    <input type="radio" name="q1_objective" value={opt} checked={formData.q1_objective === opt} onChange={handleInputChange} required />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Q2 */}
            <div className="form-group" style={{marginTop: '2.5rem'}}>
              <p className="question-text">
                2. Which groups are the target populations of this project?<br/>
                <span style={{fontSize: '0.9em', color: 'var(--color-text-muted)'}}>(यस परियोजनाका लक्षित समूहहरू कुन-कुन हुन्?)</span>
              </p>
              <div className="options-group">
                {['Female sex worker', 'School children', 'Female drug user', 'Transgender', 'Women living with HIV'].map((opt, i) => (
                  <label key={i} className={`option-label ${formData.q2_target_populations.includes(opt) ? 'selected' : ''}`}>
                    <input type="checkbox" name="q2_target_populations" value={opt} checked={formData.q2_target_populations.includes(opt)} onChange={handleInputChange} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Q3 */}
            <div className="form-group" style={{marginTop: '2.5rem'}}>
              <p className="question-text">
                3. Which communication skill is most important during counselling?<br/>
                <span style={{fontSize: '0.9em', color: 'var(--color-text-muted)'}}>(परामर्श को क्रममा सबैभन्दा महत्त्वपूर्ण सञ्चार सीप कुन हो?)</span>
              </p>
              <div className="options-group">
                {['a. Active listening', 'b. Arguing', 'c. Judging', 'd. Giving personal opinions'].map((opt, i) => (
                  <label key={i} className={`option-label ${formData.q3_communication === opt ? 'selected' : ''}`}>
                    <input type="radio" name="q3_communication" value={opt} checked={formData.q3_communication === opt} onChange={handleInputChange} required />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Q4 */}
            <div className="form-group" style={{marginTop: '2.5rem'}}>
              <p className="question-text">
                4. Briefly describe the mental health program flow, from what we do at first immediately after training, including the activities conducted immediately after this training, the target population and end line assessment.<br/>
                <span style={{fontSize: '0.9em', color: 'var(--color-text-muted)'}}>(प्रशिक्षण सम्पन्न भएपछि सुरु हुने गतिविधिदेखि अन्तिम मूल्याङ्कन सम्मको सम्पूर्ण मानसिक स्वास्थ्य कार्यक्रमको प्रक्रिया संक्षेपमा वर्णन गर्नुहोस्।)</span>
              </p>
              <textarea name="q4_program_flow" className="form-textarea" rows="4" value={formData.q4_program_flow} onChange={handleInputChange} required></textarea>
            </div>

            {/* Q5 */}
            <div className="form-group" style={{marginTop: '2.5rem'}}>
              <p className="question-text">
                5. What are your key roles and responsibilities as a Peer Outreach Worker in this project?<br/>
                <span style={{fontSize: '0.9em', color: 'var(--color-text-muted)'}}>(यस परियोजनामा Peer Outreach Worker को रूपमा तपाईंका मुख्य भूमिका तथा जिम्मेवारीहरू के-के हुन्?)</span>
              </p>
              <textarea name="q5_roles" className="form-textarea" rows="3" value={formData.q5_roles} onChange={handleInputChange} required></textarea>
            </div>

            {/* Q6 */}
            <div className="form-group" style={{marginTop: '2.5rem'}}>
              <p className="question-text">
                6. Under what circumstances should you immediately inform or refer a participant to the psychologist after screening?<br/>
                <span style={{fontSize: '0.9em', color: 'var(--color-text-muted)'}}>(स्क्रिनिङपछि कुन-कुन अवस्थामा सहभागीलाई तत्काल मनोवैज्ञानिक समक्ष जानकारी गराउन वा सिफारिस गर्नुपर्छ?)</span>
              </p>
              <textarea name="q6_referral" className="form-textarea" rows="3" value={formData.q6_referral} onChange={handleInputChange} required></textarea>
            </div>

            {/* Q7 */}
            <div className="form-group" style={{marginTop: '2.5rem'}}>
              <p className="question-text">
                7. What challenges or risks might you encounter while conducting orientation sessions, mental health screening, and follow-up activities in the field?<br/>
                <span style={{fontSize: '0.9em', color: 'var(--color-text-muted)'}}>(अभिमुखीकरण, मानसिक स्वास्थ्य स्क्रिनिङ तथा फलोअपका क्रममा समुदायमा काम गर्दा तपाईंले सामना गर्न सक्ने चुनौती वा जोखिमहरू के-के हुन सक्छन्?)</span>
              </p>
              <textarea name="q7_challenges" className="form-textarea" rows="3" value={formData.q7_challenges} onChange={handleInputChange} required></textarea>
            </div>

            {/* Q8 */}
            <div className="form-group" style={{marginTop: '2.5rem'}}>
              <p className="question-text">
                8. What are the three most important things you have learned from the training so far, and how will you apply them in your outreach work?<br/>
                <span style={{fontSize: '0.9em', color: 'var(--color-text-muted)'}}>(हालसम्मको प्रशिक्षणबाट तपाईंले सिकेका तीनवटा सबैभन्दा महत्त्वपूर्ण कुरा के-के हुन्? ती कुराहरूलाई तपाईंले आफ्नो Outreach कार्यमा कसरी प्रयोग गर्नुहुन्छ?)</span>
              </p>
              <textarea name="q8_learnings" className="form-textarea" rows="4" value={formData.q8_learnings} onChange={handleInputChange} required></textarea>
            </div>

            {/* Q9 */}
            <div className="form-group" style={{marginTop: '2.5rem'}}>
              <p className="question-text">
                9. How will you ensure confidentiality and ethical conduct while working with beneficiaries?<br/>
                <span style={{fontSize: '0.9em', color: 'var(--color-text-muted)'}}>(लाभग्राहीसँग काम गर्दा गोपनीयता तथा नैतिक आचरण कसरी सुनिश्चित गर्नुहुन्छ?)</span>
              </p>
              <textarea name="q9_confidentiality" className="form-textarea" rows="3" value={formData.q9_confidentiality} onChange={handleInputChange} required></textarea>
            </div>

            {/* Q10 */}
            <div className="form-group" style={{marginTop: '2.5rem'}}>
              <p className="question-text">
                10. What should you do if a beneficiary refuses screening or support services?<br/>
                <span style={{fontSize: '0.9em', color: 'var(--color-text-muted)'}}>(यदि कुनै लाभग्राहीले स्क्रिनिङ वा सहयोग सेवा लिन अस्वीकार गरेमा तपाईंले के गर्नुहुन्छ?)</span>
              </p>
              <textarea name="q10_refusal" className="form-textarea" rows="3" value={formData.q10_refusal} onChange={handleInputChange} required></textarea>
            </div>

            {/* Q11 */}
            <div className="form-group" style={{marginTop: '2.5rem'}}>
              <p className="question-text">
                11. What actions may affect contract renewal according to the Outreach Worker Terms of Reference?<br/>
                <span style={{fontSize: '0.9em', color: 'var(--color-text-muted)'}}>(आउटरीच वर्करको कार्यविवरण अनुसार कुन-कुन कुराले सम्झौता नवीकरणमा असर पार्न सक्छ?)</span>
              </p>
              <textarea name="q11_contract_renewal" className="form-textarea" rows="3" value={formData.q11_contract_renewal} onChange={handleInputChange} required></textarea>
            </div>

            {error && <div className="error-text">{error}</div>}

            <div className="nav-buttons">
              <span className="timer-badge">Ensure all questions are answered</span>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="card success-container">
            <div className="success-icon">✓</div>
            <h2 className="card-title">Assessment Submitted!</h2>
            <p className="card-subtitle" style={{marginBottom: 0}}>
              Thank you, {formData.full_name}. We have successfully recorded your answers.
            </p>
          </div>
        )}

        {/* Warning Toast */}
        {showWarning && (
          <div className="toast-container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--color-error)'}}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>
              <p>20 minutes have passed!</p>
              <span style={{fontSize: '0.875rem', color: 'var(--color-text-muted)'}}>You have a 10-minute grace period to complete the assessment.</span>
            </div>
            <button className="toast-close" onClick={() => setShowWarning(false)}>×</button>
          </div>
        )}
      </main>
    </>
  );
}
