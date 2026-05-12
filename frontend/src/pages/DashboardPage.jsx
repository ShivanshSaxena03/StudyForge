import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'

const BOOK_COLORS = [
  '#6C63FF', '#FF6584', '#10B981', '#F59E0B',
  '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899'
]

const s = {
  page: { minHeight: '100vh', background: '#F8F7FF' },
  nav: {
    background: 'white',
    borderBottom: '1px solid #EEF2FF',
    padding: '0 40px',
    height: 64,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 2px 12px rgba(108,99,255,0.06)',
  },
  brand: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 22, fontWeight: 800,
    color: '#6C63FF',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  navRight: { display: 'flex', alignItems: 'center', gap: 16 },
  userPill: {
    background: '#F3F0FF', color: '#6C63FF',
    padding: '6px 14px', borderRadius: 20,
    fontSize: 13, fontWeight: 600,
  },
  logoutBtn: {
    background: 'none', border: '1px solid #E5E7EB',
    color: '#6B7280', padding: '6px 14px', borderRadius: 8,
    fontSize: 13, cursor: 'pointer',
  },
  main: { maxWidth: 1100, margin: '0 auto', padding: '40px 20px' },
  header: { marginBottom: 40 },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, color: '#1A1A2E' },
  subtitle: { fontSize: 15, color: '#6B7280', marginTop: 4 },
  createBtn: {
    background: '#6C63FF', color: 'white',
    padding: '12px 24px', borderRadius: 12,
    fontSize: 14, fontWeight: 600,
    fontFamily: 'Syne, sans-serif',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 8,
    boxShadow: '0 4px 14px rgba(108,99,255,0.3)',
    transition: 'all 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20,
  },
  bookCard: {
    background: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    transition: 'all 0.2s',
    border: '1px solid #F0F0F0',
  },
  bookBand: { height: 8 },
  bookBody: { padding: '20px 20px 16px' },
  bookTitle: { fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#1A1A2E', marginBottom: 4 },
  bookDesc: { fontSize: 13, color: '#9CA3AF', marginBottom: 12, lineHeight: 1.5 },
  bookMeta: { display: 'flex', gap: 12 },
  metaChip: {
    fontSize: 12, fontWeight: 500, color: '#6B7280',
    background: '#F9FAFB', padding: '3px 10px', borderRadius: 20,
    border: '1px solid #F0F0F0',
  },
  emptyState: {
    textAlign: 'center', padding: '80px 20px',
    gridColumn: '1 / -1',
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#6B7280' },
  // Modal
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white', borderRadius: 20,
    padding: '36px 32px', width: 460,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalTitle: { fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 4, color: '#1A1A2E' },
  modalSub: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  fieldGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  colorPicker: { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 },
  colorDot: {
    width: 28, height: 28, borderRadius: '50%',
    cursor: 'pointer', border: '3px solid transparent',
    transition: 'all 0.15s',
  },
  btnRow: { display: 'flex', gap: 10, marginTop: 24 },
  cancelBtn: {
    flex: 1, padding: '12px', borderRadius: 10,
    border: '1.5px solid #E5E7EB', background: 'white',
    color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  submitBtn: {
    flex: 2, padding: '12px', borderRadius: 10,
    border: 'none', background: '#6C63FF', color: 'white',
    fontSize: 14, fontWeight: 700,
    fontFamily: 'Syne, sans-serif', cursor: 'pointer',
  },
}

export default function DashboardPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', subject: '', color: '#6C63FF' })

  const loadBooks = async () => {
    try {
      const { data } = await api.get('/books')
      setBooks(data)
    } catch (e) {
      toast.error('Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBooks() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/books', form)
      setBooks(b => [...b, data])
      setShowModal(false)
      setForm({ title: '', description: '', subject: '', color: '#6C63FF' })
      toast.success('Book created! 📚')
      navigate(`/book/${data.id}`)
    } catch {
      toast.error('Failed to create book')
    }
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.brand}>
          <span>✦</span> StudyForge
        </div>
        <div style={s.navRight}>
          <span style={s.userPill}>👤 {user?.username}</span>
          <button style={s.logoutBtn} onClick={() => { logout(); navigate('/login') }}>Sign out</button>
        </div>
      </nav>

      <main style={s.main}>
        <div style={s.header}>
          <div style={s.titleRow}>
            <div>
              <h1 style={s.title}>Your Study Library</h1>
              <p style={s.subtitle}>
                {books.length > 0 ? `${books.length} book${books.length !== 1 ? 's' : ''} in your collection` : 'Create your first study book'}
              </p>
            </div>
            <button style={s.createBtn} onClick={() => setShowModal(true)}>
              + New Book
            </button>
          </div>
        </div>

        <div style={s.grid}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ ...s.bookCard, height: 140, opacity: 0.4, background: '#F3F4F6' }} />
            ))
          ) : books.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>📚</div>
              <h2 style={s.emptyTitle}>No books yet</h2>
              <p style={s.emptyDesc}>Create your first study book to get started</p>
            </div>
          ) : (
            books.map(book => (
              <div
                key={book.id}
                style={s.bookCard}
                onClick={() => navigate(`/book/${book.id}`)}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)' }}
                onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                <div style={{ ...s.bookBand, background: book.color }} />
                <div style={s.bookBody}>
                  <div style={s.bookTitle}>{book.title}</div>
                  {book.subject && <div style={{ fontSize: 12, color: book.color, fontWeight: 600, marginBottom: 6 }}>{book.subject}</div>}
                  <div style={s.bookDesc}>{book.description || 'No description'}</div>
                  <div style={s.bookMeta}>
                    <span style={s.metaChip}>📄 {book.content_count} items</span>
                    <span style={s.metaChip}>✨ {book.booklet_count} booklets</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {showModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>New Study Book</h2>
            <p style={s.modalSub}>Organize your study materials in one place</p>
            <form onSubmit={handleCreate}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Biology Chapter 5" required />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Subject</label>
                <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Biology, Computer Science" />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What will you study?" rows={2} style={{ resize: 'vertical' }} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Color</label>
                <div style={s.colorPicker}>
                  {BOOK_COLORS.map(c => (
                    <div
                      key={c}
                      style={{
                        ...s.colorDot,
                        background: c,
                        borderColor: form.color === c ? '#1A1A2E' : 'transparent',
                        transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                      }}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                    />
                  ))}
                </div>
              </div>
              <div style={s.btnRow}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={s.submitBtn}>Create Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
