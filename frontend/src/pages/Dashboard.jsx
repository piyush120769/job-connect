import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const STATUS_COLORS = {
  'Applied': { bg: '#e0e7ff', text: '#3730a3' },
  'Reviewing': { bg: '#fef3c7', text: '#92400e' },
  'Shortlisted': { bg: '#d1fae5', text: '#065f46' },
  'Interview Scheduled': { bg: '#ecfdf5', text: '#047857', border: '2px solid #10b981' },
  'Rejected': { bg: '#fee2e2', text: '#dc2626' },
  'Hired': { bg: '#d1fae5', text: '#065f46' },
};

// ==== JOB SEEKER DASHBOARD ====
const JobSeekerDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/applications/my');
      setApplications(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}><div style={styles.statNum}>{applications.length}</div><div style={styles.statLbl}>Total Applications</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: '#10b981' }}>{statusCounts['Shortlisted'] || 0}</div><div style={styles.statLbl}>Shortlisted</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: '#6366f1' }}>{statusCounts['Interview Scheduled'] || 0}</div><div style={styles.statLbl}>Interviews</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: '#f59e0b' }}>{statusCounts['Reviewing'] || 0}</div><div style={styles.statLbl}>Under Review</div></div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>My Applications</h2>
          <Link to="/jobs" style={styles.actionBtn}>Browse More Jobs →</Link>
        </div>

        {loading ? <p style={{ color: '#6b7280' }}>Loading...</p> : applications.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: '48px' }}>📋</div>
            <h3 style={{ color: '#111827' }}>No applications yet</h3>
            <p style={{ color: '#6b7280' }}>Start applying to jobs that match your skills!</p>
            <Link to="/jobs" style={styles.primaryBtn}>Browse Jobs</Link>
          </div>
        ) : (
          <div style={styles.appList}>
            {applications.map(app => {
              const colors = STATUS_COLORS[app.status] || STATUS_COLORS['Applied'];
              return (
                <div key={app._id} style={styles.appCard}>
                  <div style={styles.appMain}>
                    <div style={styles.appAvatar}>{(app.job?.company || 'C')[0]}</div>
                    <div style={styles.appInfo}>
                      <h3 style={styles.appTitle}>{app.job?.title}</h3>
                      <p style={styles.appCompany}>{app.job?.company} · {app.job?.location}</p>
                      <p style={styles.appDate}>Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div style={styles.appRight}>
                    <span style={{ ...styles.statusBadge, background: colors.bg, color: colors.text, ...(colors.border && { border: colors.border }) }}>
                      {app.status}
                    </span>
                    {app.status === 'Interview Scheduled' && app.interview && (
                      <div style={styles.interviewCard}>
                        <div style={styles.interviewHeader}>📅 Interview Scheduled</div>
                        <p style={styles.interviewDetail}>📆 {new Date(app.interview.scheduledAt).toLocaleString()}</p>
                        <p style={styles.interviewDetail}>⏱ {app.interview.duration} minutes · {app.interview.type}</p>
                        {app.interview.meetingLink && (
                          <a href={app.interview.meetingLink} style={styles.joinBtn}>🎥 Join Interview</a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ==== RECRUITER DASHBOARD ====
const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobApps, setJobApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [showJobForm, setShowJobForm] = useState(false);
  const [showSchedule, setShowSchedule] = useState(null);
  const [jobForm, setJobForm] = useState({ title: '', location: '', type: 'Full-time', salary: '', description: '', skills: '', requirements: '', experience: '' });
  const [scheduleForm, setScheduleForm] = useState({ scheduledAt: '', duration: 30, type: 'video', notes: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/jobs/my-jobs'),
        api.get('/applications/recruiter')
      ]);
      setJobs(jobsRes.data);
      setApplications(appsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchJobApps = async (jobId) => {
    try {
      const { data } = await api.get(`/applications/job/${jobId}`);
      setJobApps(data);
      setSelectedJob(jobs.find(j => j._id === jobId));
    } catch (err) { console.error(err); }
  };

  const createJob = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...jobForm,
        skills: jobForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        requirements: jobForm.requirements.split('\n').filter(Boolean),
      };
      await api.post('/jobs', payload);
      setShowJobForm(false);
      setJobForm({ title: '', location: '', type: 'Full-time', salary: '', description: '', skills: '', requirements: '', experience: '' });
      setMsg('Job posted successfully!');
      fetchData();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to post job'); }
    finally { setSaving(false); }
  };

  const updateStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setJobApps(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
    } catch (err) { console.error(err); }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      if (selectedJob?._id === jobId) { setSelectedJob(null); setJobApps([]); }
    } catch (err) { console.error(err); }
  };

  const scheduleInterview = async (appId) => {
    setSaving(true);
    try {
      await api.put(`/applications/${appId}/interview`, scheduleForm);
      setShowSchedule(null);
      setMsg('Interview scheduled!');
      if (selectedJob) fetchJobApps(selectedJob._id);
      fetchData();
    } catch (err) { setMsg('Failed to schedule interview'); }
    finally { setSaving(false); }
  };

  const downloadResume = async (appId, fileName) => {
    try {
      const response = await api.get(`/applications/${appId}/resume`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { alert('Failed to download resume'); }
  };

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}><div style={styles.statNum}>{jobs.length}</div><div style={styles.statLbl}>Active Jobs</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: '#6366f1' }}>{applications.length}</div><div style={styles.statLbl}>Total Applications</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: '#10b981' }}>{statusCounts['Shortlisted'] || 0}</div><div style={styles.statLbl}>Shortlisted</div></div>
        <div style={styles.statCard}><div style={{ ...styles.statNum, color: '#f59e0b' }}>{statusCounts['Interview Scheduled'] || 0}</div><div style={styles.statLbl}>Interviews</div></div>
      </div>

      {msg && <div style={{ ...styles.msgBox, background: msg.includes('fail') || msg.includes('Failed') ? '#fee2e2' : '#d1fae5', color: msg.includes('fail') || msg.includes('Failed') ? '#dc2626' : '#065f46' }}>{msg}</div>}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(activeTab === 'jobs' ? styles.tabActive : {}) }} onClick={() => setActiveTab('jobs')}>My Job Listings</button>
        <button style={{ ...styles.tab, ...(activeTab === 'applications' ? styles.tabActive : {}) }} onClick={() => setActiveTab('applications')}>All Applications</button>
        {selectedJob && <button style={{ ...styles.tab, ...(activeTab === 'jobapps' ? styles.tabActive : {}) }} onClick={() => setActiveTab('jobapps')}>📋 {selectedJob.title}</button>}
      </div>

      {/* Job Listings Tab */}
      {activeTab === 'jobs' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Job Listings</h2>
            <button onClick={() => setShowJobForm(!showJobForm)} style={styles.primaryBtn}>
              {showJobForm ? '✕ Cancel' : '+ Post New Job'}
            </button>
          </div>

          {showJobForm && (
            <div style={styles.formCard}>
              <h3 style={{ margin: '0 0 20px', color: '#111827' }}>Create Job Listing</h3>
              <form onSubmit={createJob}>
                <div style={styles.formGrid}>
                  <div style={styles.formField}><label style={styles.formLabel}>Job Title *</label><input required value={jobForm.title} onChange={e => setJobForm(f => ({ ...f, title: e.target.value }))} style={styles.formInput} placeholder="e.g. Senior React Developer" /></div>
                  <div style={styles.formField}><label style={styles.formLabel}>Location *</label><input required value={jobForm.location} onChange={e => setJobForm(f => ({ ...f, location: e.target.value }))} style={styles.formInput} placeholder="e.g. New York, NY" /></div>
                  <div style={styles.formField}><label style={styles.formLabel}>Job Type</label><select value={jobForm.type} onChange={e => setJobForm(f => ({ ...f, type: e.target.value }))} style={styles.formInput}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Remote</option></select></div>
                  <div style={styles.formField}><label style={styles.formLabel}>Salary</label><input value={jobForm.salary} onChange={e => setJobForm(f => ({ ...f, salary: e.target.value }))} style={styles.formInput} placeholder="e.g. $80k - $120k" /></div>
                  <div style={styles.formField}><label style={styles.formLabel}>Experience</label><input value={jobForm.experience} onChange={e => setJobForm(f => ({ ...f, experience: e.target.value }))} style={styles.formInput} placeholder="e.g. 3-5 years" /></div>
                  <div style={styles.formField}><label style={styles.formLabel}>Skills (comma-separated)</label><input value={jobForm.skills} onChange={e => setJobForm(f => ({ ...f, skills: e.target.value }))} style={styles.formInput} placeholder="React, Node.js, MongoDB" /></div>
                </div>
                <div style={styles.formField}><label style={styles.formLabel}>Job Description *</label><textarea required rows={5} value={jobForm.description} onChange={e => setJobForm(f => ({ ...f, description: e.target.value }))} style={{ ...styles.formInput, resize: 'vertical' }} placeholder="Describe the role, responsibilities..." /></div>
                <div style={styles.formField}><label style={styles.formLabel}>Requirements (one per line)</label><textarea rows={4} value={jobForm.requirements} onChange={e => setJobForm(f => ({ ...f, requirements: e.target.value }))} style={{ ...styles.formInput, resize: 'vertical' }} placeholder="Bachelor's degree&#10;3+ years experience..." /></div>
                <button type="submit" disabled={saving} style={styles.primaryBtn}>{saving ? 'Posting...' : '🚀 Post Job'}</button>
              </form>
            </div>
          )}

          <div style={styles.jobsList}>
            {jobs.length === 0 ? (
              <div style={styles.empty}><div style={{ fontSize: '48px' }}>📋</div><h3>No jobs posted yet</h3><p>Post your first job to start receiving applications!</p></div>
            ) : jobs.map(job => (
              <div key={job._id} style={styles.jobRow}>
                <div style={styles.jobRowMain}>
                  <h3 style={styles.jobRowTitle}>{job.title}</h3>
                  <p style={styles.jobRowMeta}>{job.location} · {job.type} · {job.applicantsCount || 0} applicants</p>
                  <span style={{ fontSize: '12px', color: job.status === 'active' ? '#10b981' : '#ef4444', fontWeight: '600' }}>{job.status.toUpperCase()}</span>
                </div>
                <div style={styles.jobRowActions}>
                  <button onClick={() => { fetchJobApps(job._id); setActiveTab('jobapps'); }} style={styles.viewAppsBtn}>View Applications</button>
                  <button onClick={() => deleteJob(job._id)} style={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Applications Tab */}
      {activeTab === 'applications' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>All Applications</h2>
          {applications.length === 0 ? <div style={styles.empty}><div style={{ fontSize: '48px' }}>📭</div><h3>No applications yet</h3></div> : (
            <div style={styles.appList}>
              {applications.map(app => {
                const colors = STATUS_COLORS[app.status] || STATUS_COLORS['Applied'];
                return (
                  <div key={app._id} style={styles.appCard}>
                    <div style={styles.appMain}>
                      <div style={styles.appAvatar}>{(app.applicant?.name || 'U')[0]}</div>
                      <div style={styles.appInfo}>
                        <h3 style={styles.appTitle}>{app.applicant?.name}</h3>
                        <p style={styles.appCompany}>{app.job?.title} · {app.job?.company}</p>
                        <p style={styles.appDate}>{new Date(app.appliedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span style={{ ...styles.statusBadge, background: colors.bg, color: colors.text }}>{app.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Job Applications Detail Tab */}
      {activeTab === 'jobapps' && selectedJob && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Applications for: {selectedJob.title}</h2>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>{jobApps.length} application(s)</span>
          </div>

          {jobApps.length === 0 ? (
            <div style={styles.empty}><div style={{ fontSize: '48px' }}>📭</div><h3>No applications yet for this job</h3></div>
          ) : jobApps.map(app => {
            const colors = STATUS_COLORS[app.status] || STATUS_COLORS['Applied'];
            return (
              <div key={app._id} style={styles.candidateCard}>
                <div style={styles.candidateTop}>
                  <div style={styles.candidateHeader}>
                    <div style={styles.candidateAvatar}>{(app.applicant?.name || 'U')[0]}</div>
                    <div>
                      <h3 style={styles.candidateName}>{app.applicant?.name}</h3>
                      <p style={styles.candidateEmail}>{app.applicant?.email} {app.applicant?.location && `· ${app.applicant.location}`}</p>
                    </div>
                  </div>
                  <div style={styles.candidateActions}>
                    <span style={{ ...styles.statusBadge, background: colors.bg, color: colors.text }}>{app.status}</span>
                    {app.resume && (
                      <button onClick={() => downloadResume(app._id, app.resume.originalName)} style={styles.downloadBtn}>
                        ⬇ Download Resume
                      </button>
                    )}
                  </div>
                </div>

                {app.applicant?.skills?.length > 0 && (
                  <div style={styles.skillsRow}>
                    {app.applicant.skills.slice(0, 6).map((s, i) => <span key={i} style={styles.skillChip}>{s}</span>)}
                  </div>
                )}

                {app.coverLetter && (
                  <div style={styles.coverLetterBox}>
                    <strong style={{ fontSize: '13px', color: '#374151' }}>Cover Letter:</strong>
                    <p style={styles.coverLetterText}>{app.coverLetter}</p>
                  </div>
                )}

                {/* Status Actions */}
                <div style={styles.statusActions}>
                  <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Update Status:</span>
                  {['Reviewing', 'Shortlisted', 'Rejected', 'Hired'].map(s => (
                    <button key={s} onClick={() => updateStatus(app._id, s)} style={{ ...styles.statusBtn, opacity: app.status === s ? 0.5 : 1 }}>{s}</button>
                  ))}
                  <button onClick={() => setShowSchedule(showSchedule === app._id ? null : app._id)} style={{ ...styles.statusBtn, background: '#6366f1', color: '#fff' }}>
                    📅 Schedule Interview
                  </button>
                </div>

                {/* Schedule Interview Form */}
                {showSchedule === app._id && (
                  <div style={styles.scheduleForm}>
                    <h4 style={{ margin: '0 0 16px', color: '#111827' }}>Schedule Interview</h4>
                    <div style={styles.scheduleGrid}>
                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Date & Time</label>
                        <input type="datetime-local" value={scheduleForm.scheduledAt} onChange={e => setScheduleForm(f => ({ ...f, scheduledAt: e.target.value }))} style={styles.formInput} />
                      </div>
                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Duration (min)</label>
                        <select value={scheduleForm.duration} onChange={e => setScheduleForm(f => ({ ...f, duration: Number(e.target.value) }))} style={styles.formInput}>
                          <option value={15}>15 min</option>
                          <option value={30}>30 min</option>
                          <option value={45}>45 min</option>
                          <option value={60}>60 min</option>
                          <option value={90}>90 min</option>
                        </select>
                      </div>
                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Interview Type</label>
                        <select value={scheduleForm.type} onChange={e => setScheduleForm(f => ({ ...f, type: e.target.value }))} style={styles.formInput}>
                          <option value="video">Video Call</option>
                          <option value="phone">Phone Call</option>
                          <option value="in-person">In-Person</option>
                        </select>
                      </div>
                    </div>
                    <div style={styles.formField}>
                      <label style={styles.formLabel}>Notes for Candidate</label>
                      <textarea rows={2} value={scheduleForm.notes} onChange={e => setScheduleForm(f => ({ ...f, notes: e.target.value }))} style={{ ...styles.formInput, resize: 'vertical' }} placeholder="Instructions, things to prepare..." />
                    </div>
                    <div style={styles.scheduleActions}>
                      <button onClick={() => setShowSchedule(null)} style={styles.cancelBtn}>Cancel</button>
                      <button onClick={() => scheduleInterview(app._id)} disabled={!scheduleForm.scheduledAt || saving} style={styles.primaryBtn}>
                        {saving ? 'Scheduling...' : '📅 Confirm Interview'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Scheduled Interview Display */}
                {app.status === 'Interview Scheduled' && app.interview && (
                  <div style={styles.scheduledBox}>
                    <div style={styles.scheduledHeader}>✅ Interview Scheduled</div>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}>📆 {new Date(app.interview.scheduledAt).toLocaleString()}</p>
                    <p style={{ margin: '4px 0', fontSize: '14px' }}>⏱ {app.interview.duration} min · {app.interview.type}</p>
                    {app.interview.notes && <p style={{ margin: '8px 0 4px', fontSize: '13px', color: '#374151' }}><strong>Notes:</strong> {app.interview.notes}</p>}
                    {app.interview.meetingLink && (
                      <a href={app.interview.meetingLink} target="_blank" rel="noreferrer" style={styles.meetingLink}>
                        🎥 Join Interview Room
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ==== MAIN DASHBOARD ====
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.welcomeBar}>
          <div>
            <h1 style={styles.welcomeTitle}>Welcome back, {user.name?.split(' ')[0]}! 👋</h1>
            <p style={styles.welcomeSub}>{user.role === 'recruiter' ? `Managing jobs for ${user.company}` : 'Track your job applications'}</p>
          </div>
          <div style={styles.userBadge}>
            <span style={styles.badgeAvatar}>{(user.name || 'U')[0]}</span>
            <div>
              <div style={styles.badgeName}>{user.name}</div>
              <div style={styles.badgeRole}>{user.role === 'recruiter' ? '🏢 Recruiter' : '🎯 Job Seeker'}</div>
            </div>
          </div>
        </div>

        {user.role === 'recruiter' ? <RecruiterDashboard /> : <JobSeekerDashboard />}
      </div>
    </div>
  );
};

const styles = {
  page: { background: '#f9fafb', minHeight: '100vh', padding: '32px 0', fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
  welcomeBar: { background: '#fff', borderRadius: '16px', padding: '28px 32px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: '16px' },
  welcomeTitle: { fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 4px' },
  welcomeSub: { fontSize: '15px', color: '#6b7280', margin: 0 },
  userBadge: { display: 'flex', gap: '12px', alignItems: 'center' },
  badgeAvatar: { width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700' },
  badgeName: { fontSize: '15px', fontWeight: '700', color: '#111827' },
  badgeRole: { fontSize: '13px', color: '#6b7280' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' },
  statCard: { background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', textAlign: 'center' },
  statNum: { fontSize: '36px', fontWeight: '800', color: '#111827', lineHeight: '1' },
  statLbl: { fontSize: '13px', color: '#9ca3af', marginTop: '6px', fontWeight: '500' },
  section: { background: '#fff', borderRadius: '16px', padding: '28px 32px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  tab: { padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#6b7280' },
  tabActive: { background: '#eef2ff', color: '#4f46e5', borderBottom: '2px solid #6366f1' },
  appList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  appCard: { border: '2px solid #e5e7eb', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' },
  appMain: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  appAvatar: { width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px', flexShrink: 0 },
  appInfo: {},
  appTitle: { fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 4px' },
  appCompany: { fontSize: '14px', color: '#6b7280', margin: '0 0 4px' },
  appDate: { fontSize: '12px', color: '#9ca3af', margin: 0 },
  appRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' },
  statusBadge: { padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  interviewCard: { background: '#ecfdf5', border: '2px solid #10b981', borderRadius: '10px', padding: '12px 16px', maxWidth: '280px' },
  interviewHeader: { fontSize: '13px', fontWeight: '700', color: '#047857', marginBottom: '8px' },
  interviewDetail: { fontSize: '13px', color: '#374151', margin: '4px 0' },
  joinBtn: { display: 'inline-block', marginTop: '10px', padding: '8px 16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '13px' },
  empty: { textAlign: 'center', padding: '48px', color: '#6b7280' },
  primaryBtn: { padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', textDecoration: 'none' },
  actionBtn: { padding: '10px 20px', background: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', textDecoration: 'none' },
  formCard: { background: '#f9fafb', border: '2px solid #e5e7eb', borderRadius: '16px', padding: '28px', marginBottom: '24px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '0' },
  formField: { marginBottom: '16px' },
  formLabel: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  formInput: { width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1f2937', background: '#fff' },
  jobsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  jobRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', border: '2px solid #e5e7eb', borderRadius: '12px', flexWrap: 'wrap', gap: '12px' },
  jobRowMain: {},
  jobRowTitle: { fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 4px' },
  jobRowMeta: { fontSize: '13px', color: '#6b7280', margin: '0 0 4px' },
  jobRowActions: { display: 'flex', gap: '10px' },
  viewAppsBtn: { padding: '8px 16px', background: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  deleteBtn: { padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  candidateCard: { border: '2px solid #e5e7eb', borderRadius: '16px', padding: '24px', marginBottom: '16px' },
  candidateTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
  candidateHeader: { display: 'flex', gap: '14px', alignItems: 'center' },
  candidateAvatar: { width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '22px', flexShrink: 0 },
  candidateName: { fontSize: '17px', fontWeight: '700', color: '#111827', margin: '0 0 4px' },
  candidateEmail: { fontSize: '13px', color: '#6b7280', margin: 0 },
  candidateActions: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  downloadBtn: { padding: '8px 16px', background: '#f0fdf4', color: '#16a34a', border: '2px solid #86efac', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' },
  skillsRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' },
  skillChip: { padding: '4px 10px', background: '#e0e7ff', color: '#3730a3', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  coverLetterBox: { background: '#f9fafb', borderRadius: '8px', padding: '12px', marginBottom: '12px', border: '1px solid #e5e7eb' },
  coverLetterText: { fontSize: '13px', color: '#374151', margin: '6px 0 0', lineHeight: '1.6', maxHeight: '80px', overflow: 'hidden' },
  statusActions: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #f3f4f6', marginTop: '8px' },
  statusBtn: { padding: '6px 14px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
  scheduleForm: { background: '#f0f4ff', borderRadius: '12px', padding: '20px', marginTop: '12px', border: '2px solid #c7d2fe' },
  scheduleGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' },
  scheduleActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' },
  cancelBtn: { padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#6b7280' },
  scheduledBox: { background: '#ecfdf5', border: '2px solid #10b981', borderRadius: '10px', padding: '16px', marginTop: '12px' },
  scheduledHeader: { fontSize: '14px', fontWeight: '700', color: '#047857', marginBottom: '8px' },
  meetingLink: { display: 'inline-block', marginTop: '10px', padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '14px' },
  msgBox: { padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' },
};

export default Dashboard;
