import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import JobCard from '../components/JobCard';
import api from '../api';

const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    type: ''
  });

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, [currentPage, searchParams]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 9,
        ...(filters.keyword && { keyword: filters.keyword }),
        ...(filters.location && { location: filters.location }),
        ...(filters.type && filters.type !== 'All' && { type: filters.type }),
      });
      const { data } = await api.get(`/jobs?${params}`);
      setJobs(data.jobs);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const handleTypeFilter = (type) => {
    setFilters(f => ({ ...f, type }));
    setCurrentPage(1);
    setTimeout(fetchJobs, 0);
  };

  return (
    <div style={styles.page}>
      {/* Search Header */}
      <div style={styles.searchHeader}>
        <div style={styles.container}>
          <h1 style={styles.title}>Browse All Jobs</h1>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              placeholder="Search jobs, skills, companies..."
              value={filters.keyword}
              onChange={(e) => setFilters(f => ({ ...f, keyword: e.target.value }))}
              style={styles.searchInput}
            />
            <input
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters(f => ({ ...f, location: e.target.value }))}
              style={{ ...styles.searchInput, maxWidth: '200px' }}
            />
            <button type="submit" style={styles.searchBtn}>Search</button>
          </form>

          <div style={styles.typeFilters}>
            {JOB_TYPES.map(type => (
              <button
                key={type}
                style={{ ...styles.filterBtn, ...(filters.type === type || (type === 'All' && !filters.type) ? styles.filterBtnActive : {}) }}
                onClick={() => handleTypeFilter(type === 'All' ? '' : type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.resultsInfo}>
          {loading ? 'Loading...' : `${total} jobs found`}
        </div>

        {loading ? (
          <div style={styles.grid}>
            {[...Array(6)].map((_, i) => <div key={i} style={styles.skeleton}></div>)}
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div style={styles.grid}>
              {jobs.map(job => <JobCard key={job._id} job={job} />)}
            </div>

            {pages > 1 && (
              <div style={styles.pagination}>
                {[...Array(pages)].map((_, i) => (
                  <button
                    key={i}
                    style={{ ...styles.pageBtn, ...(currentPage === i + 1 ? styles.pageBtnActive : {}) }}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={styles.empty}>
            <div style={{ fontSize: '64px' }}>🔍</div>
            <h3>No jobs found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: '#f9fafb', fontFamily: "'Inter', sans-serif" },
  searchHeader: { background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '48px 24px' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },
  title: { color: '#fff', fontSize: '32px', fontWeight: '800', marginBottom: '24px', textAlign: 'center' },
  searchForm: { display: 'flex', gap: '12px', marginBottom: '20px', justifyContent: 'center', flexWrap: 'wrap' },
  searchInput: {
    flex: 1,
    minWidth: '200px',
    padding: '12px 18px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '15px',
    outline: 'none',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  searchBtn: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '15px',
    boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
  },
  typeFilters: { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' },
  filterBtn: {
    padding: '8px 18px',
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '13px',
  },
  filterBtnActive: { background: '#fff', color: '#4f46e5', border: '1px solid #fff' },
  resultsInfo: { padding: '24px 0 16px', color: '#6b7280', fontSize: '15px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px', paddingBottom: '48px' },
  skeleton: { height: '240px', background: 'linear-gradient(90deg, #e5e7eb 25%, #d1d5db 50%, #e5e7eb 75%)', borderRadius: '16px', backgroundSize: '200% 100%' },
  pagination: { display: 'flex', gap: '8px', justifyContent: 'center', paddingBottom: '48px' },
  pageBtn: { padding: '10px 16px', border: '2px solid #e5e7eb', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  pageBtnActive: { background: '#6366f1', color: '#fff', borderColor: '#6366f1' },
  empty: { textAlign: 'center', padding: '80px 20px', color: '#6b7280' },
};

export default Jobs;
