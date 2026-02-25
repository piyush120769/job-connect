import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const InterviewRoom = () => {
  const { id } = useParams(); // application id
  const { user } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inRoom, setInRoom] = useState(false);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchApplication();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [id]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchApplication = async () => {
    try {
      const { data } = await api.get(`/applications/${id}`);
      setApplication(data);
    } catch (err) {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setInRoom(true);
      addSystemMessage('You joined the interview room');
    } catch (err) {
      setError('Could not access camera/microphone. Please check permissions.');
    }
  };

  const leaveRoom = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setInRoom(false);
    addSystemMessage('You left the room');
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setMicOn(prev => !prev);
    }
  };

  const toggleCam = () => {
    if (stream) {
      stream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      setCamOn(prev => !prev);
    }
  };

  const addSystemMessage = (text) => {
    setMessages(prev => [...prev, { type: 'system', text, time: new Date().toLocaleTimeString() }]);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    setMessages(prev => [...prev, { type: 'user', sender: user.name, text: msgInput.trim(), time: new Date().toLocaleTimeString() }]);
    setMsgInput('');
  };

  if (loading) return <div style={styles.loading}><div style={styles.spinner}></div></div>;
  if (!application) return null;

  const interview = application.interview;
  const isRecruiter = user?._id === application.recruiter?._id || user?.role === 'recruiter';
  const otherParty = isRecruiter ? application.applicant?.name : application.recruiter?.company || 'Recruiter';

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back</button>
          <div>
            <h2 style={styles.roomTitle}>Interview Room</h2>
            <p style={styles.roomSubtitle}>{application.job?.title} · {application.job?.company}</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          {interview?.scheduledAt && (
            <div style={styles.scheduleInfo}>
              📅 {new Date(interview.scheduledAt).toLocaleString()} · {interview.duration} min
            </div>
          )}
          <div style={styles.statusDot}></div>
          <span style={styles.statusText}>{inRoom ? 'Live' : 'Waiting'}</span>
        </div>
      </div>

      {error && <div style={styles.errorMsg}>{error}</div>}

      {!inRoom ? (
        // Pre-join screen
        <div style={styles.prejoin}>
          <div style={styles.prejoinCard}>
            <div style={styles.prejoinIcon}>🎥</div>
            <h2 style={styles.prejoinTitle}>Ready to Join?</h2>
            <p style={styles.prejoinSub}>Interview with <strong>{otherParty}</strong></p>

            {interview && (
              <div style={styles.interviewDetails}>
                <div style={styles.detailRow}>
                  <span>📅 Scheduled</span>
                  <span>{new Date(interview.scheduledAt).toLocaleString()}</span>
                </div>
                <div style={styles.detailRow}>
                  <span>⏱ Duration</span>
                  <span>{interview.duration} minutes</span>
                </div>
                <div style={styles.detailRow}>
                  <span>🎙 Type</span>
                  <span style={{ textTransform: 'capitalize' }}>{interview.type}</span>
                </div>
                {interview.notes && (
                  <div style={styles.notesBox}>
                    <strong>📌 Notes:</strong> {interview.notes}
                  </div>
                )}
              </div>
            )}

            <div style={styles.prejoinActions}>
              <button onClick={joinRoom} style={styles.joinBtn}>🎥 Join Interview Room</button>
              <button onClick={() => navigate('/dashboard')} style={styles.declineBtn}>← Back to Dashboard</button>
            </div>
          </div>
        </div>
      ) : (
        // In-room interface
        <div style={styles.room}>
          {/* Video Area */}
          <div style={styles.videoArea}>
            <div style={styles.mainVideo}>
              <video ref={videoRef} autoPlay muted playsInline style={styles.videoEl} />
              <div style={styles.videoLabel}>You ({user?.name})</div>
              {!camOn && (
                <div style={styles.camOffOverlay}>
                  <div style={styles.camOffAvatar}>{(user?.name || 'U')[0]}</div>
                  <p style={styles.camOffText}>Camera is off</p>
                </div>
              )}
            </div>
            <div style={styles.remoteVideo}>
              <div style={styles.waitingIndicator}>
                <div style={styles.waitingAvatar}>{(otherParty || 'O')[0]}</div>
                <p style={styles.waitingName}>{otherParty}</p>
                <p style={styles.waitingStatus}>Waiting to join...</p>
                <p style={styles.waitingNote}>(Share the interview link to invite them)</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={styles.controls}>
            <button onClick={toggleMic} style={{ ...styles.controlBtn, ...(micOn ? {} : styles.controlBtnOff) }}>
              {micOn ? '🎙 Mic On' : '🔇 Mic Off'}
            </button>
            <button onClick={toggleCam} style={{ ...styles.controlBtn, ...(camOn ? {} : styles.controlBtnOff) }}>
              {camOn ? '📷 Cam On' : '📷 Cam Off'}
            </button>
            <button onClick={leaveRoom} style={styles.leaveBtn}>🔴 Leave Room</button>
          </div>

          {/* Chat */}
          <div style={styles.chatPanel}>
            <h3 style={styles.chatTitle}>💬 Chat</h3>
            <div style={styles.chatMessages}>
              {messages.length === 0 && <p style={styles.chatEmpty}>No messages yet. Say hello! 👋</p>}
              {messages.map((msg, i) => (
                <div key={i} style={{ ...styles.chatMsg, ...(msg.type === 'system' ? styles.systemMsg : {}) }}>
                  {msg.type !== 'system' && <strong style={styles.msgSender}>{msg.sender}: </strong>}
                  <span style={styles.msgText}>{msg.text}</span>
                  <span style={styles.msgTime}>{msg.time}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} style={styles.chatInput}>
              <input
                type="text"
                placeholder="Type a message..."
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                style={styles.chatField}
              />
              <button type="submit" style={styles.sendBtn}>Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { background: '#0f172a', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#f1f5f9' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  spinner: { width: '48px', height: '48px', border: '4px solid #334155', borderTop: '4px solid #6366f1', borderRadius: '50%' },
  header: {
    background: '#1e293b',
    padding: '16px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #334155',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerLeft: { display: 'flex', gap: '16px', alignItems: 'center' },
  backBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  roomTitle: { fontSize: '18px', fontWeight: '700', margin: '0 0 2px', color: '#f1f5f9' },
  roomSubtitle: { fontSize: '13px', color: '#64748b', margin: 0 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  scheduleInfo: { fontSize: '13px', color: '#94a3b8', background: '#334155', padding: '6px 12px', borderRadius: '8px' },
  statusDot: { width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' },
  statusText: { fontSize: '13px', fontWeight: '600', color: '#22c55e' },
  errorMsg: { background: '#7f1d1d', color: '#fca5a5', padding: '12px 24px', fontSize: '14px' },
  // Pre-join
  prejoin: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 24px' },
  prejoinCard: { background: '#1e293b', borderRadius: '20px', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center', border: '1px solid #334155' },
  prejoinIcon: { fontSize: '64px', marginBottom: '16px' },
  prejoinTitle: { fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 8px' },
  prejoinSub: { fontSize: '16px', color: '#94a3b8', marginBottom: '28px' },
  interviewDetails: { background: '#0f172a', borderRadius: '12px', padding: '20px', marginBottom: '28px', textAlign: 'left' },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e293b', fontSize: '14px', color: '#94a3b8' },
  notesBox: { marginTop: '12px', padding: '10px', background: '#1e3a5f', borderRadius: '8px', fontSize: '13px', color: '#93c5fd', lineHeight: '1.6' },
  prejoinActions: { display: 'flex', flexDirection: 'column', gap: '12px' },
  joinBtn: { padding: '16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' },
  declineBtn: { padding: '12px', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  // Room
  room: { padding: '24px', display: 'grid', gridTemplateColumns: '1fr', gap: '20px', maxWidth: '1200px', margin: '0 auto' },
  videoArea: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', height: '420px' },
  mainVideo: { background: '#1e293b', borderRadius: '16px', position: 'relative', overflow: 'hidden', border: '2px solid #6366f1' },
  videoEl: { width: '100%', height: '100%', objectFit: 'cover' },
  videoLabel: { position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  camOffOverlay: { position: 'absolute', inset: 0, background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  camOffAvatar: { width: '80px', height: '80px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '700', marginBottom: '8px' },
  camOffText: { color: '#64748b', fontSize: '14px' },
  remoteVideo: { background: '#1e293b', borderRadius: '16px', border: '2px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  waitingIndicator: { textAlign: 'center', padding: '20px' },
  waitingAvatar: { width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', margin: '0 auto 12px', color: '#fff' },
  waitingName: { fontSize: '16px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 4px' },
  waitingStatus: { fontSize: '13px', color: '#64748b', margin: '0 0 6px' },
  waitingNote: { fontSize: '11px', color: '#475569', margin: 0 },
  controls: { display: 'flex', gap: '12px', justifyContent: 'center' },
  controlBtn: { padding: '12px 24px', background: '#334155', color: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  controlBtnOff: { background: '#7f1d1d', color: '#fca5a5' },
  leaveBtn: { padding: '12px 24px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' },
  chatPanel: { background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' },
  chatTitle: { padding: '16px 20px', borderBottom: '1px solid #334155', margin: 0, fontSize: '15px', fontWeight: '700' },
  chatMessages: { padding: '16px', height: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  chatEmpty: { color: '#475569', fontSize: '14px', textAlign: 'center', marginTop: '60px' },
  chatMsg: { background: '#0f172a', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.5' },
  systemMsg: { background: 'transparent', color: '#475569', textAlign: 'center', fontSize: '12px', fontStyle: 'italic' },
  msgSender: { color: '#818cf8' },
  msgText: { color: '#e2e8f0' },
  msgTime: { fontSize: '11px', color: '#475569', marginLeft: '8px' },
  chatInput: { display: 'flex', padding: '12px', borderTop: '1px solid #334155', gap: '8px' },
  chatField: { flex: 1, padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' },
  sendBtn: { padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
};

export default InterviewRoom;
