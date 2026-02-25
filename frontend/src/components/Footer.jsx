import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={styles.footer}>
    <div style={styles.container}>
      <div style={styles.grid}>
        <div>
          <div style={styles.logo}>💼 <strong>Job<span style={{ color: '#818cf8' }}>Connect</span></strong></div>
          <p style={styles.tagline}>Connecting talent with opportunity. Find your dream job or the perfect candidate today.</p>
        </div>
        <div>
          <h4 style={styles.heading}>For Job Seekers</h4>
          <Link to="/jobs" style={styles.link}>Browse Jobs</Link>
          <Link to="/register" style={styles.link}>Create Account</Link>
          <Link to="/dashboard" style={styles.link}>My Applications</Link>
        </div>
        <div>
          <h4 style={styles.heading}>For Recruiters</h4>
          <Link to="/register" style={styles.link}>Post a Job</Link>
          <Link to="/dashboard" style={styles.link}>Manage Listings</Link>
          <Link to="/dashboard" style={styles.link}>View Applications</Link>
        </div>
        <div>
          <h4 style={styles.heading}>Company</h4>
          <span style={styles.link}>About Us</span>
          <span style={styles.link}>Privacy Policy</span>
          <span style={styles.link}>Terms of Service</span>
        </div>
      </div>
      <div style={styles.bottom}>
        <p style={styles.copy}>© 2025 JobConnect. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const styles = {
  footer: { background: '#1f2937', color: '#9ca3af', marginTop: 'auto' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '40px' },
  logo: { fontSize: '20px', color: '#f9fafb', marginBottom: '12px' },
  tagline: { fontSize: '14px', lineHeight: '1.6', color: '#9ca3af' },
  heading: { color: '#f9fafb', marginBottom: '16px', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  link: { display: 'block', color: '#9ca3af', textDecoration: 'none', marginBottom: '8px', fontSize: '14px', cursor: 'pointer' },
  bottom: { borderTop: '1px solid #374151', paddingTop: '24px', textAlign: 'center' },
  copy: { fontSize: '14px', color: '#6b7280' },
};

export default Footer;
