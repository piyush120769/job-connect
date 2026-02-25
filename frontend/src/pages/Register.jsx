import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'jobseeker', company: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/users/register', form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>🚀</div>
          <h1 style={styles.title}>Join JobConnect</h1>
          <p style={styles.subtitle}>Create your account to get started</p>
        </div>

        <div style={styles.roleToggle}>
          <button
            type="button"
            style={{ ...styles.roleBtn, ...(form.role === 'jobseeker' ? styles.roleBtnActive : {}) }}
            onClick={() => setForm({ ...form, role: 'jobseeker', company: '' })}
          >
            🎯 Job Seeker
          </button>
          <button
            type="button"
            style={{ ...styles.roleBtn, ...(form.role === 'recruiter' ? styles.roleBtnActive : {}) }}
            onClick={() => setForm({ ...form, role: 'recruiter' })}
          >
            🏢 Recruiter
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={styles.input}
            />
          </div>
          {form.role === 'recruiter' && (
            <div style={styles.field}>
              <label style={styles.label}>Company Name</label>
              <input
                type="text"
                required
                placeholder="Your Company Ltd."
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                style={styles.input}
              />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating Account...' : `Create ${form.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'} Account`}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
  },
  header: { textAlign: 'center', marginBottom: '28px' },
  icon: { fontSize: '48px', marginBottom: '16px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 8px' },
  subtitle: { fontSize: '15px', color: '#6b7280', margin: 0 },
  roleToggle: { display: 'flex', gap: '12px', marginBottom: '24px' },
  roleBtn: {
    flex: 1,
    padding: '12px',
    background: '#f3f4f6',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  roleBtnActive: { background: '#eef2ff', color: '#6366f1', borderColor: '#6366f1' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#374151' },
  input: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    color: '#1f2937',
  },
  btn: {
    padding: '14px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
  },
  footer: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' },
  link: { color: '#6366f1', fontWeight: '600', textDecoration: 'none' },
};

export default Register;
