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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(108,99,255,0.06)',
  },

  brand: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 22,
    fontWeight: 800,
    color: '#6C63FF',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },

  userPill: {
    background: '#F3F0FF',
    color: '#6C63FF',
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
  },

  logoutBtn: {
    background: 'none',
    border: '1px solid #E5E7EB',
    color: '#6B7280',
    padding: '6px 14px',
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
  },

  main: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '40px 20px',
  },

  header: {
    marginBottom: 40,
  },

  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  title: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 36,
    fontWeight: 800,
    color: '#1A1A2E',
  },

  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },

  createBtn: {
    background: '#6C63FF',
    color: 'white',
    padding: '12px 24px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
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
    position: 'relative',
  },

  bookBand: {
    height: 8,
  },

  bookBody: {
    padding: '20px',
  },

  bookTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 18,
    fontWeight: 700,
    color: '#1A1A2E',
    marginBottom: 4,
  },

  bookDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 12,
    lineHeight: 1.5,
  },

  bookMeta: {
    display: 'flex',
    gap: 12,
  },

  metaChip: {
    fontSize: 12,
    fontWeight: 500,
    color: '#6B7280',
    background: '#F9FAFB',
    padding: '3px 10px',
    borderRadius: 20,
  },

  deleteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: '50%',
    border: 'none',
    background: '#FEF2F2',
    color: '#EF4444',
    cursor: 'pointer',
    fontSize: 18,
    fontWeight: 700,
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },

  modal: {
    background: 'white',
    borderRadius: 20,
    padding: 32,
    width: 460,
  },

  fieldGroup: {
    marginBottom: 16,
  },

  label: {
    display: 'block',
    marginBottom: 6,
    fontWeight: 600,
  },

  btnRow: {
    display: 'flex',
    gap: 10,
    marginTop: 20,
  },

  cancelBtn: {
    flex: 1,
    padding: 12,
  },

  submitBtn: {
    flex: 2,
    padding: 12,
    background: '#6C63FF',
    color: 'white',
    border: 'none',
  },
}

export default function DashboardPage() {

  const { user, logout } = useAuthStore()

  const navigate = useNavigate()

  const [books, setBooks] = useState([])

  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    color: '#6C63FF'
  })

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {

    try {

      const { data } = await api.get('/books')

      setBooks(data)

    } catch {

      toast.error('Failed to load books')

    } finally {

      setLoading(false)

    }
  }

  const handleCreate = async (e) => {

    e.preventDefault()

    try {

      const { data } = await api.post('/books', form)

      setBooks(prev => [...prev, data])

      setShowModal(false)

      setForm({
        title: '',
        description: '',
        subject: '',
        color: '#6C63FF'
      })

      toast.success('Book created! 📚')

      navigate(`/book/${data.id}`)

    } catch {

      toast.error('Failed to create book')

    }
  }

  const handleDeleteBook = async (bookId) => {

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this book?'
    )

    if (!confirmDelete) return

    try {

      await api.delete(`/books/${bookId}`)

      setBooks(prev =>
        prev.filter(book => book.id !== bookId)
      )

      toast.success('Book deleted successfully')

    } catch (err) {

      toast.error(
        err.response?.data?.detail || 'Delete failed'
      )
    }
  }

  return (
    <div style={s.page}>

      <nav style={s.nav}>

        <div style={s.brand}>
          ✦ StudyForge
        </div>

        <div style={s.navRight}>

          <span style={s.userPill}>
            👤 {user?.username}
          </span>

          <button
            style={s.logoutBtn}
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            Sign out
          </button>

        </div>

      </nav>

      <main style={s.main}>

        <div style={s.header}>

          <div style={s.titleRow}>

            <div>

              <h1 style={s.title}>
                Your Study Library
              </h1>

              <p style={s.subtitle}>
                {books.length} books in your collection
              </p>

            </div>

            <button
              style={s.createBtn}
              onClick={() => setShowModal(true)}
            >
              + New Book
            </button>

          </div>

        </div>

        <div style={s.grid}>

          {books.map(book => (

            <div
              key={book.id}
              style={s.bookCard}
              onClick={() => navigate(`/book/${book.id}`)}
            >

              <button
                style={s.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteBook(book.id)
                }}
              >
                ×
              </button>

              <div
                style={{
                  ...s.bookBand,
                  background: book.color
                }}
              />

              <div style={s.bookBody}>

                <div style={s.bookTitle}>
                  {book.title}
                </div>

                {book.subject && (
                  <div
                    style={{
                      fontSize: 12,
                      color: book.color,
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    {book.subject}
                  </div>
                )}

                <div style={s.bookDesc}>
                  {book.description || 'No description'}
                </div>

                <div style={s.bookMeta}>

                  <span style={s.metaChip}>
                    📄 {book.content_count} items
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      </main>

    </div>
  )
}