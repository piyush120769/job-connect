import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import JobCard from '../components/JobCard';
import api from '../api';

const STATS = [
  { number: '10K+', label: 'Active Jobs' },
  { number: '5K+', label: 'Companies' },
  { number: '50K+', label: 'Job Seekers' },
  { number: '8K+', label: 'Placements' },
];

const CATEGORIES = [
  { icon: '💻', name: 'Technology', count: '2.4k jobs' },
  { icon: '🎨', name: 'Design', count: '1.2k jobs' },
  { icon: '📊', name: 'Marketing', count: '980 jobs' },
  { icon: '💼', name: 'Finance', count: '1.5k jobs' },
  { icon: '🏥', name: 'Healthcare', count: '2.1k jobs' },
  { icon: '📚', name: 'Education', count: '750 jobs' },
  { icon: '⚖️', name: 'Legal', count: '430 jobs' },
  { icon: '🔧', name: 'Engineering', count: '1.8k jobs' },
];

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs?limit=6');
      setJobs(data.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?keyword=${keyword}&location=${location}`);
  };

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>🚀 #1 Job Portal Platform</div>
          <h1 style={styles.heroTitle}>
            Find Your <span style={styles.heroAccent}>Dream Job</span><br />
            Or Perfect Candidate
          </h1>
          <p style={styles.heroSubtitle}>
            Connect with top companies and talented professionals. 
            Your next opportunity is just a click away.
          </p>

          <form onSubmit={handleSearch} style={styles.searchForm}>
            <div style={styles.searchBox}>
              <input
                type="text"
                placeholder="Job title, skills, or company..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={styles.searchInput}
              />
              <span style={styles.searchDivider}></span>
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ ...styles.searchInput, borderLeft: 'none' }}
              />
              <button type="submit" style={styles.searchBtn}>🔍 Search Jobs</button>
            </div>
          </form>

          <div style={styles.quickLinks}>
            <span style={styles.popular}>Popular:</span>
            {['React Developer', 'Python', 'UI/UX', 'Data Science', 'Remote'].map(tag => (
              <button key={tag} onClick={() => navigate(`/jobs?keyword=${tag}`)} style={styles.tag}>{tag}</button>
            ))}
          </div>
        </div>

        <div style={styles.heroStats}>
          {STATS.map((stat, i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.statNumber}>{stat.number}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Browse by Category</h2>
            <p style={styles.sectionSubtitle}>Explore opportunities across different fields</p>
          </div>
          <div style={styles.categoryGrid}>
            {CATEGORIES.map((cat, i) => (
              <button key={i} style={styles.categoryCard} onClick={() => navigate(`/jobs?keyword=${cat.name}`)}>
                <span style={styles.catIcon}>{cat.icon}</span>
                <span style={styles.catName}>{cat.name}</span>
                <span style={styles.catCount}>{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section style={{ ...styles.section, background: '#f9fafb' }}>
        <div style={styles.container}>
          <div style={{ ...styles.sectionHeader, ...styles.sectionHeaderFlex }}>
            <div>
              <h2 style={styles.sectionTitle}>Latest Job Openings</h2>
              <p style={styles.sectionSubtitle}>Fresh opportunities added daily</p>
            </div>
            <Link to="/jobs" style={styles.viewAllBtn}>View All Jobs →</Link>
          </div>

          {loading ? (
            <div style={styles.loadingGrid}>
              {[...Array(6)].map((_, i) => <div key={i} style={styles.skeleton}></div>)}
            </div>
          ) : jobs.length > 0 ? (
            <div style={styles.jobsGrid}>
              {jobs.map(job => <JobCard key={job._id} job={job} />)}
            </div>
          ) : (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>📋</div>
              <h3 style={styles.emptyTitle}>No jobs posted yet</h3>
              <p style={styles.emptyText}>Be the first to post a job listing!</p>
              <Link to="/register" style={styles.emptyBtn}>Post a Job</Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.container}>
          <div style={styles.ctaGrid}>
            <div style={styles.ctaCard}>
              <div style={styles.ctaIcon}>🎯</div>
              <h3 style={styles.ctaTitle}>Looking for a Job?</h3>
              <p style={styles.ctaText}>Create your profile, upload your resume, and start applying to hundreds of jobs.</p>
              <Link to="/register" style={styles.ctaBtnPrimary}>Create Job Seeker Account</Link>
            </div>
            <div style={{ ...styles.ctaCard, background: 'linear-gradient(135deg, #1f2937, #374151)' }}>
              <div style={styles.ctaIcon}>🏢</div>
              <h3 style={styles.ctaTitle}>Hiring Talent?</h3>
              <p style={styles.ctaText}>Post jobs, review applications, screen resumes, and schedule video interviews all in one place.</p>
              <Link to="/register" style={styles.ctaBtnSecondary}>Post Jobs as Recruiter</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  page: { fontFamily: "'Inter', sans-serif" },
  hero: {
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
    padding: '80px 24px 60px',
    color: '#fff',
  },
  heroContent: { maxWidth: '800px', margin: '0 auto', textAlign: 'center' },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
    padding: '8px 20px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '24px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  heroTitle: { fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '800', lineHeight: '1.1', margin: '0 0 20px' },
  heroAccent: { color: '#a5b4fc' },
  heroSubtitle: { fontSize: '18px', color: 'rgba(255,255,255,0.8)', marginBottom: '40px', lineHeight: '1.6' },
  searchForm: { marginBottom: '24px' },
  searchBox: {
    display: 'flex',
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxWidth: '700px',
    margin: '0 auto',
  },
  searchInput: {
    flex: 1,
    padding: '18px 20px',
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    color: '#1f2937',
  },
  searchDivider: { width: '1px', background: '#e5e7eb', margin: '12px 0' },
  searchBtn: {
    padding: '18px 28px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '15px',
    whiteSpace: 'nowrap',
  },
  quickLinks: { display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', alignItems: 'center' },
  popular: { fontSize: '14px', color: 'rgba(255,255,255,0.6)' },
  tag: {
    padding: '6px 14px',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
  },
  heroStats: {
    maxWidth: '800px',
    margin: '48px auto 0',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  statNumber: { fontSize: '28px', fontWeight: '800', color: '#a5b4fc' },
  statLabel: { fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' },
  section: { padding: '80px 0' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },
  sectionHeader: { textAlign: 'center', marginBottom: '48px' },
  sectionHeaderFlex: { textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  sectionTitle: { fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 8px' },
  sectionSubtitle: { fontSize: '16px', color: '#6b7280', margin: 0 },
  viewAllBtn: {
    padding: '10px 24px',
    background: '#f3f4f6',
    color: '#374151',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' },
  categoryCard: {
    background: '#fff',
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    padding: '24px 16px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  catIcon: { fontSize: '32px' },
  catName: { fontSize: '14px', fontWeight: '700', color: '#1f2937' },
  catCount: { fontSize: '12px', color: '#6b7280' },
  jobsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' },
  loadingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' },
  skeleton: { height: '240px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', borderRadius: '16px', backgroundSize: '200% 100%' },
  empty: { textAlign: 'center', padding: '80px 20px' },
  emptyIcon: { fontSize: '64px', marginBottom: '16px' },
  emptyTitle: { fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' },
  emptyText: { color: '#6b7280', marginBottom: '24px' },
  emptyBtn: { padding: '12px 28px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '600' },
  ctaSection: { padding: '80px 0', background: '#f0f4ff' },
  ctaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' },
  ctaCard: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    borderRadius: '24px',
    padding: '48px 40px',
    color: '#fff',
  },
  ctaIcon: { fontSize: '48px', marginBottom: '24px' },
  ctaTitle: { fontSize: '24px', fontWeight: '800', marginBottom: '16px' },
  ctaText: { fontSize: '16px', opacity: '0.85', lineHeight: '1.7', marginBottom: '32px' },
  ctaBtnPrimary: {
    display: 'inline-block',
    padding: '14px 28px',
    background: '#fff',
    color: '#4f46e5',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '15px',
  },
  ctaBtnSecondary: {
    display: 'inline-block',
    padding: '14px 28px',
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '15px',
    border: '2px solid rgba(255,255,255,0.3)',
  },
};

export default Home;
