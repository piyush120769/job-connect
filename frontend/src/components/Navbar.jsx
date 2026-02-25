import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>💼</span>
          <span style={styles.logoText}>Job<span style={styles.logoAccent}>Connect</span></span>
        </Link>

        <div style={styles.links}>
          <Link to="/" style={{ ...styles.link, ...(isActive('/') ? styles.activeLink : {}) }}>Home</Link>
          <Link to="/jobs" style={{ ...styles.link, ...(isActive('/jobs') ? styles.activeLink : {}) }}>Browse Jobs</Link>
          {user && (
            <Link to="/dashboard" style={{ ...styles.link, ...(isActive('/dashboard') ? styles.activeLink : {}) }}>
              Dashboard
            </Link>
          )}
        </div>

        <div style={styles.actions}>
          {user ? (
            <>
              <span style={styles.greeting}>Hi, {user.name?.split(' ')[0]}</span>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.loginBtn}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Get Started</Link>
            </>
          )}
        </div>

        <button style={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </div>

      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/jobs" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Browse Jobs</Link>
          {user ? (
            <>
              <Link to="/dashboard" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={styles.mobileLinkBtn}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 1px 20px rgba(0,0,0,0.08)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' },
  logoIcon: { fontSize: '24px' },
  logoText: { fontSize: '22px', fontWeight: '800', color: '#1f2937' },
  logoAccent: { color: '#6366f1' },
  links: { display: 'flex', gap: '8px', '@media(max-width:768px)': { display: 'none' } },
  link: {
    padding: '8px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#6b7280',
    fontWeight: '500',
    fontSize: '15px',
    transition: 'all 0.2s',
  },
  activeLink: { color: '#6366f1', background: '#eef2ff' },
  actions: { display: 'flex', alignItems: 'center', gap: '12px' },
  greeting: { fontSize: '14px', color: '#6b7280', fontWeight: '500' },
  loginBtn: {
    padding: '8px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#6366f1',
    fontWeight: '600',
    fontSize: '14px',
    border: '2px solid #6366f1',
    transition: 'all 0.2s',
  },
  registerBtn: {
    padding: '8px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  logoutBtn: {
    padding: '8px 20px',
    borderRadius: '8px',
    background: '#fee2e2',
    color: '#ef4444',
    fontWeight: '600',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
  },
  menuBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: '22px',
    cursor: 'pointer',
    color: '#374151',
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 24px',
    borderTop: '1px solid #e5e7eb',
    background: '#fff',
  },
  mobileLink: {
    padding: '12px 0',
    textDecoration: 'none',
    color: '#374151',
    fontWeight: '500',
    borderBottom: '1px solid #f3f4f6',
  },
  mobileLinkBtn: {
    padding: '12px 0',
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default Navbar;
