import React from 'react';
import { Link } from 'react-router-dom';

const typeColors = {
  'Full-time': { bg: '#d1fae5', text: '#065f46' },
  'Part-time': { bg: '#fef3c7', text: '#92400e' },
  'Contract': { bg: '#e0e7ff', text: '#3730a3' },
  'Internship': { bg: '#fce7f3', text: '#9d174d' },
  'Remote': { bg: '#dcfce7', text: '#166534' },
};

const JobCard = ({ job }) => {
  const colors = typeColors[job.type] || typeColors['Full-time'];
  const postedDays = Math.floor((Date.now() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24));
  const postedText = postedDays === 0 ? 'Today' : postedDays === 1 ? '1 day ago' : `${postedDays} days ago`;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.companyAvatar}>
          {(job.company || 'C')[0].toUpperCase()}
        </div>
        <div style={styles.meta}>
          <h3 style={styles.title}>{job.title}</h3>
          <p style={styles.company}>{job.company}</p>
        </div>
        <span style={{ ...styles.typeBadge, background: colors.bg, color: colors.text }}>
          {job.type}
        </span>
      </div>

      <div style={styles.details}>
        <span style={styles.detail}>📍 {job.location}</span>
        {job.salary && <span style={styles.detail}>💰 {job.salary}</span>}
        {job.experience && <span style={styles.detail}>⚡ {job.experience}</span>}
      </div>

      {job.skills && job.skills.length > 0 && (
        <div style={styles.skills}>
          {job.skills.slice(0, 4).map((skill, i) => (
            <span key={i} style={styles.skill}>{skill}</span>
          ))}
          {job.skills.length > 4 && <span style={styles.moreSkills}>+{job.skills.length - 4} more</span>}
        </div>
      )}

      <div style={styles.footer}>
        <span style={styles.posted}>{postedText}</span>
        <div style={styles.footerActions}>
          <span style={styles.applicants}>👥 {job.applicantsCount || 0} applicants</span>
          <Link to={`/jobs/${job._id}`} style={styles.viewBtn}>View Job →</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  header: { display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' },
  companyAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    flexShrink: 0,
  },
  meta: { flex: 1 },
  title: { fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 4px' },
  company: { fontSize: '14px', color: '#6b7280', margin: 0 },
  typeBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', flexShrink: 0 },
  details: { display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' },
  detail: { fontSize: '13px', color: '#6b7280' },
  skills: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' },
  skill: { padding: '4px 10px', background: '#f3f4f6', color: '#374151', borderRadius: '6px', fontSize: '12px', fontWeight: '500' },
  moreSkills: { padding: '4px 10px', background: '#e5e7eb', color: '#6b7280', borderRadius: '6px', fontSize: '12px' },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: '16px' },
  posted: { fontSize: '12px', color: '#9ca3af' },
  footerActions: { display: 'flex', alignItems: 'center', gap: '16px' },
  applicants: { fontSize: '12px', color: '#9ca3af' },
  viewBtn: {
    padding: '8px 18px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '600',
  },
};

export default JobCard;
