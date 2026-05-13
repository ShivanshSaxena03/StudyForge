import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute', top: '-10%', right: '-5%',
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', bottom: '-10%', left: '-5%',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,101,132,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  left: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px 80px',
    color: 'white',
  },
  right: {
    width: 480,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  card: {
    background: 'white',
    borderRadius: 24,
    padding: '48px 40px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  logo: {
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: '#A5B4FC',
    marginBottom: 32,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: 800,
    fontFamily: 'Syne, sans-serif',
    lineHeight: 1.1,
    marginBottom: 20,
  },
  heroAccent: { color: '#A5B4FC' },
  heroDesc: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 1.7,
    maxWidth: 420,
    marginBottom: 40,
  },
  featureList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 },
  featureItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    fontSize: 15, color: 'rgba(255,255,255,0.8)',
  },
  featureDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#6C63FF', flexShrink: 0,
  },
  cardTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 26, fontWeight: 800,
    color: '#1A1A2E', marginBottom: 6,
  },
  cardSub: { fontSize: 14, color: '#6B7280', marginBottom: 32 },
  fieldGroup: { marginBottom: 18 },
  label: {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: '#374151', marginBottom: 6,
  },
  input: {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #E5E7EB', borderRadius: 10,
    fontSize: 14, color: '#111827',
    background: '#FAFAFA', outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
    transition: 'border-color 0.2s',
  },
  btn: {
    width: '100%', padding: '13px',
    background: '#6C63FF', color: 'white',
    border: 'none', borderRadius: 10,
    fontSize: 15, fontWeight: 600,
    fontFamily: 'Syne, sans-serif',
    cursor: 'pointer',
    marginTop: 8,
    transition: 'all 0.2s',
  },
  switchText: {
    textAlign: 'center', marginTop: 20,
    fontSize: 14, color: '#6B7280',
  },
  link: { color: '#6C63FF', fontWeight: 600 },
  error: {
    background: '#FEF2F2', border: '1px solid #FCA5A5',
    borderRadius: 8, padding: '10px 14px',
    fontSize: 13, color: '#DC2626', marginBottom: 16,
  },
  row: { display: 'flex', gap: 12 },
}

export default function AuthPage({ mode }) {
  const navigate = useNavigate()
  const { login, signup, loading, error, clearError, user } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '', username: '', full_name: '' })

  useEffect(() => { if (user) navigate('/') }, [user])
  useEffect(() => { clearError() }, [mode])

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'login') {
      const ok = await login(form.email, form.password)
      if (ok) { toast.success('Welcome back! 🎉'); navigate('/') }
    } else {
      const ok = await signup(form.email, form.username, form.password, form.full_name)
      if (ok) { toast.success('Account created! Let\'s study 📚'); navigate('/') }
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.left}>
        <div style={styles.logo}>✦ StudyForge</div>
        <h1 style={styles.heroTitle}>
          Turn your notes into<br />
          <span style={styles.heroAccent}>brilliant booklets.</span>
        </h1>
        <p style={styles.heroDesc}>
          Upload PDFs, Word docs, or paste text — and let AI transform them into structured study materials in seconds.
        </p>
        <ul style={styles.featureList}>
          {['Summaries & key concepts', 'Flowcharts & process diagrams', 'Comparison tables', 'Practice Q&A'].map(f => (
            <li key={f} style={styles.featureItem}>
              <span style={styles.featureDot} /> {f}
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p style={styles.cardSub}>{mode === 'login' ? 'Sign in to your workspace' : 'Start your study journey'}</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input style={styles.input} name="full_name" value={form.full_name} onChange={handleChange} placeholder="Your name" />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Username</label>
                  <input style={styles.input} name="username" value={form.username} onChange={handleChange} placeholder="username" required />
                </div>
              </div>
            )}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email</label>
              <input style={styles.input} name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input style={styles.input} name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button
              type="submit"
              style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p style={styles.switchText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Link to={mode === 'login' ? '/signup' : '/login'} style={styles.link}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
