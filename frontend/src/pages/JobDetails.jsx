import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data);
    } catch (err) {
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!resumeFile) { setError('Please upload your resume'); return; }

    setApplying(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('coverLetter', coverLetter);

      await api.post(`/applications/job/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Application submitted successfully! 🎉');
      setApplied(true);
      setShowApply(false);
      fetchJob();
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div style={styles.loading}><div style={styles.spinner}></div></div>;
  if (!job) return null;

  const postedDays = Math.floor((Date.now() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24));

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back to Jobs</button>

        <div style={styles.layout}>
          {/* Main Content */}
          <div style={styles.main}>
            <div style={styles.jobHeader}>
              <div style={styles.companyAvatar}>{(job.company || 'C')[0].toUpperCase()}</div>
              <div style={styles.jobMeta}>
                <h1 style={styles.jobTitle}>{job.title}</h1>
                <p style={styles.company}>{job.company}</p>
                <div style={styles.tags}>
                  <span style={styles.tag}>📍 {job.location}</span>
                  <span style={{ ...styles.tag, background: '#eef2ff', color: '#4f46e5' }}>{job.type}</span>
                  {job.salary && <span style={{ ...styles.tag, background: '#d1fae5', color: '#065f46' }}>💰 {job.salary}</span>}
                  {job.experience && <span style={{ ...styles.tag, background: '#fef3c7', color: '#92400e' }}>⚡ {job.experience}</span>}
                </div>
              </div>
            </div>

            {success && <div style={styles.successMsg}>{success}</div>}

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>About This Role</h2>
              <p style={styles.description}>{job.description}</p>
            </div>

            {job.requirements?.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Requirements</h2>
                <ul style={styles.list}>
                  {job.requirements.map((req, i) => <li key={i} style={styles.listItem}>✓ {req}</li>)}
                </ul>
              </div>
            )}

            {job.skills?.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Required Skills</h2>
                <div style={styles.skillsWrap}>
                  {job.skills.map((skill, i) => <span key={i} style={styles.skillBadge}>{skill}</span>)}
                </div>
              </div>
            )}

            {/* Apply Form */}
            {showApply && (
              <div style={styles.applyForm}>
                <h2 style={styles.sectionTitle}>Apply for {job.title}</h2>
                {error && <div style={styles.errorMsg}>{error}</div>}
                <form onSubmit={handleApply}>
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Resume (PDF or DOC/DOCX) *</label>
                    <div style={styles.uploadArea}>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        id="resume-upload"
                        style={{ display: 'none' }}
                        onChange={(e) => setResumeFile(e.target.files[0])}
                      />
                      <label htmlFor="resume-upload" style={styles.uploadLabel}>
                        {resumeFile ? (
                          <div>
                            <span style={{ fontSize: '32px' }}>📄</span>
                            <p style={styles.fileName}>{resumeFile.name}</p>
                            <p style={styles.fileSize}>{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        ) : (
                          <div>
                            <span style={{ fontSize: '40px' }}>📤</span>
                            <p style={styles.uploadText}>Click to upload your resume</p>
                            <p style={styles.uploadHint}>PDF, DOC, DOCX — Max 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Cover Letter (Optional)</label>
                    <textarea
                      rows={5}
                      placeholder="Tell the recruiter why you're the perfect fit..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      style={styles.textarea}
                    />
                  </div>

                  <div style={styles.applyActions}>
                    <button type="button" onClick={() => setShowApply(false)} style={styles.cancelBtn}>Cancel</button>
                    <button type="submit" disabled={applying} style={styles.submitBtn}>
                      {applying ? 'Submitting...' : '🚀 Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={styles.sidebar}>
            <div style={styles.sideCard}>
              <div style={styles.sideCardInfo}>
                <div style={styles.infoRow}><span style={styles.infoLabel}>Posted</span><span>{postedDays === 0 ? 'Today' : `${postedDays}d ago`}</span></div>
                <div style={styles.infoRow}><span style={styles.infoLabel}>Applicants</span><span>{job.applicantsCount || 0}</span></div>
                <div style={styles.infoRow}><span style={styles.infoLabel}>Type</span><span>{job.type}</span></div>
                {job.education && <div style={styles.infoRow}><span style={styles.infoLabel}>Education</span><span>{job.education}</span></div>}
                {job.deadline && <div style={styles.infoRow}><span style={styles.infoLabel}>Deadline</span><span>{new Date(job.deadline).toLocaleDateString()}</span></div>}
              </div>

              {!applied && user?.role === 'jobseeker' && !showApply && (
                <button onClick={() => setShowApply(true)} style={styles.applyBtn}>
                  🚀 Apply Now
                </button>
              )}
              {applied && (
                <div style={styles.appliedBadge}>✅ Application Submitted</div>
              )}
              {!user && (
                <button onClick={() => navigate('/login')} style={styles.applyBtn}>
                  Login to Apply
                </button>
              )}
              {user?.role === 'recruiter' && (
                <div style={styles.recruiterNote}>You're viewing as a recruiter</div>
              )}
            </div>

            {job.recruiter && (
              <div style={styles.sideCard}>
                <h3 style={styles.sideCardTitle}>About the Company</h3>
                <div style={styles.companyInfo}>
                  <div style={styles.smallAvatar}>{(job.company || 'C')[0]}</div>
                  <div>
                    <p style={styles.companyName}>{job.company}</p>
                    <p style={styles.recruiterName}>Posted by: {job.recruiter.name}</p>
                  </div>
                </div>
                {job.recruiter.website && (
                  <a href={job.recruiter.website} target="_blank" rel="noreferrer" style={styles.websiteLink}>
                    🌐 Visit Website
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { background: '#f9fafb', minHeight: '100vh', padding: '32px 0', fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
  loading: { display: 'flex', justifyContent: 'center', padding: '100px' },
  spinner: { width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  backBtn: { background: 'none', border: 'none', color: '#6366f1', fontWeight: '600', cursor: 'pointer', fontSize: '15px', marginBottom: '24px', padding: '0' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' },
  main: {},
  jobHeader: { background: '#fff', borderRadius: '16px', padding: '32px', marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  companyAvatar: { width: '72px', height: '72px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', flexShrink: 0 },
  jobMeta: { flex: 1 },
  jobTitle: { fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 6px' },
  company: { fontSize: '16px', color: '#6b7280', margin: '0 0 12px' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tag: { padding: '6px 14px', background: '#f3f4f6', color: '#374151', borderRadius: '20px', fontSize: '13px', fontWeight: '500' },
  section: { background: '#fff', borderRadius: '16px', padding: '28px 32px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 16px' },
  description: { color: '#4b5563', lineHeight: '1.8', fontSize: '15px', whiteSpace: 'pre-line' },
  list: { paddingLeft: '0', listStyle: 'none', margin: 0 },
  listItem: { color: '#4b5563', fontSize: '15px', padding: '8px 0', borderBottom: '1px solid #f3f4f6', lineHeight: '1.6' },
  skillsWrap: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  skillBadge: { padding: '8px 16px', background: '#eef2ff', color: '#4f46e5', borderRadius: '8px', fontSize: '14px', fontWeight: '600' },
  successMsg: { background: '#d1fae5', color: '#065f46', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontWeight: '600', textAlign: 'center' },
  applyForm: { background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  errorMsg: { background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  formField: { marginBottom: '20px' },
  formLabel: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' },
  uploadArea: {},
  uploadLabel: {
    display: 'block',
    border: '3px dashed #c4b5fd',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer',
    background: '#faf5ff',
    transition: 'all 0.2s',
  },
  uploadText: { fontSize: '16px', fontWeight: '600', color: '#4f46e5', margin: '12px 0 4px' },
  uploadHint: { fontSize: '13px', color: '#9ca3af', margin: 0 },
  fileName: { fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '8px 0 4px' },
  fileSize: { fontSize: '12px', color: '#9ca3af', margin: 0 },
  textarea: { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '15px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', color: '#1f2937' },
  applyActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  cancelBtn: { padding: '12px 24px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#6b7280' },
  submitBtn: { padding: '12px 28px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' },
  sidebar: {},
  sideCard: { background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  sideCardInfo: { marginBottom: '20px' },
  sideCardTitle: { fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 16px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: '14px', color: '#374151' },
  infoLabel: { color: '#9ca3af', fontWeight: '500' },
  applyBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' },
  appliedBadge: { width: '100%', padding: '14px', background: '#d1fae5', color: '#065f46', borderRadius: '12px', textAlign: 'center', fontWeight: '700', boxSizing: 'border-box' },
  recruiterNote: { padding: '12px', background: '#fef3c7', color: '#92400e', borderRadius: '8px', fontSize: '13px', textAlign: 'center', fontWeight: '500' },
  companyInfo: { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' },
  smallAvatar: { width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px', flexShrink: 0 },
  companyName: { fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 2px' },
  recruiterName: { fontSize: '13px', color: '#6b7280', margin: 0 },
  websiteLink: { display: 'block', padding: '10px', background: '#eef2ff', color: '#4f46e5', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px', textAlign: 'center' },
};

export default JobDetails;
