import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

const GENERATION_OPTIONS = [
  { id: 'summary', label: 'Summary', emoji: '📋', desc: 'Key takeaways & overview' },
  { id: 'key_concepts', label: 'Key Concepts', emoji: '🔑', desc: 'Terms & definitions' },
  { id: 'flowchart', label: 'Process Flows', emoji: '🔄', desc: 'Steps & workflows' },
  { id: 'comparison', label: 'Comparisons', emoji: '⚖️', desc: 'Side-by-side tables' },
  { id: 'qa', label: 'Practice Q&A', emoji: '❓', desc: '10–15 questions' },
  { id: 'timeline', label: 'Timeline', emoji: '📅', desc: 'Sequences & history' },
]

const FILE_ICONS = {
  pdf: '📄',
  docx: '📝',
  audio: '🎙️',
  text: '📃'
}

const FILE_COLORS = {
  pdf: '#EF4444',
  docx: '#3B82F6',
  audio: '#8B5CF6',
  text: '#10B981'
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#F8F7FF',
    display: 'flex',
    flexDirection: 'column',
  },

  nav: {
    background: 'white',
    borderBottom: '1px solid #EEF2FF',
    padding: '0 32px',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },

  backBtn: {
    background: '#F3F0FF',
    color: '#6C63FF',
    border: 'none',
    borderRadius: 8,
    padding: '7px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },

  colorBar: {
    width: 10,
    height: 30,
    borderRadius: 4,
  },

  bookTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 18,
    fontWeight: 800,
    color: '#1A1A2E',
  },

  bookSubject: {
    fontSize: 13,
    fontWeight: 500,
    color: '#6C63FF',
  },

  layout: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },

  sidebar: {
    width: 340,
    background: 'white',
    borderRight: '1px solid #EEF2FF',
    display: 'flex',
    flexDirection: 'column',
  },

  sidebarHeader: {
    padding: 20,
    borderBottom: '1px solid #F3F4F6',
  },

  sidebarTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 16,
  },

  addMenu: {
    display: 'flex',
    gap: 10,
  },

  addBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    border: '1.5px dashed #D1D5DB',
    background: 'white',
    cursor: 'pointer',
    fontWeight: 700,
  },

  contentList: {
    flex: 1,
    overflowY: 'auto',
    padding: 14,
  },

  contentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    background: '#FAFAFA',
    marginBottom: 10,
  },

  contentInfo: {
    flex: 1,
  },

  contentName: {
    fontWeight: 700,
    fontSize: 14,
  },

  contentType: {
    fontSize: 12,
    marginTop: 4,
  },

  deleteBtn: {
    border: 'none',
    background: 'none',
    color: '#EF4444',
    fontSize: 18,
    cursor: 'pointer',
  },

  main: {
    flex: 1,
    padding: 32,
    overflowY: 'auto',
  },

  sectionTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 32,
    fontWeight: 800,
    marginBottom: 8,
  },

  sectionDesc: {
    color: '#6B7280',
    marginBottom: 28,
  },

  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
    marginBottom: 28,
  },

  optionCard: {
    padding: 18,
    borderRadius: 16,
    border: '2px solid #E5E7EB',
    background: 'white',
    cursor: 'pointer',
  },

  titleInput: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    border: '2px solid #E5E7EB',
    marginBottom: 20,
    fontSize: 15,
  },

  generateBtn: {
    width: '100%',
    padding: 18,
    borderRadius: 14,
    border: 'none',
    background: 'linear-gradient(135deg, #6C63FF, #4F46E5)',
    color: 'white',
    fontWeight: 800,
    fontSize: 16,
    cursor: 'pointer',
  },

  generatedBox: {
    marginTop: 30,
    background: 'white',
    borderRadius: 18,
    padding: 24,
    border: '1px solid #E5E7EB',
  },

  generatedTitle: {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 18,
  },

  generatedContent: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.8,
  },
}

export default function BookPage() {

  const { bookId } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [contents, setContents] = useState([])
  const [generatedContent, setGeneratedContent] = useState(null)

  const [selectedOptions, setSelectedOptions] = useState([
    'summary',
    'key_concepts'
  ])

  const [bookletTitle, setBookletTitle] = useState('')
  const [generating, setGenerating] = useState(false)

  const [showText, setShowText] = useState(false)

  const [textForm, setTextForm] = useState({
    title: '',
    content: ''
  })

  const [uploadFile, setUploadFile] = useState(null)

  const fileInputRef = useRef(null)

  useEffect(() => {
    load()
  }, [bookId])

  const load = async () => {

    try {

      const [bookRes, contRes] = await Promise.all([
        api.get(`/books/${bookId}`),
        api.get(`/content/${bookId}/items`)
      ])

      setBook(bookRes.data)
      setContents(contRes.data)

      setBookletTitle(`${bookRes.data.title} Study Notes`)

    } catch {

      toast.error('Failed to load book')

      navigate('/')

    }
  }

  const toggleOption = (id) => {

    setSelectedOptions(prev =>
      prev.includes(id)
        ? prev.filter(o => o !== id)
        : [...prev, id]
    )
  }

  const handleTextAdd = async () => {

    if (!textForm.title || !textForm.content) {
      return toast.error('Fill all fields')
    }

    const formData = new FormData()

    formData.append('title', textForm.title)
    formData.append('text_content', textForm.content)

    try {

      const { data } = await api.post(
        `/content/${bookId}/text`,
        formData
      )

      setContents(prev => [...prev, data])

      setShowText(false)

      setTextForm({
        title: '',
        content: ''
      })

      toast.success('Note added')

    } catch {

      toast.error('Failed to add note')

    }
  }

  const handleFileUpload = async () => {

    if (!uploadFile) {
      return toast.error('Select file')
    }

    const formData = new FormData()

    formData.append('file', uploadFile)

    try {

      const { data } = await api.post(
        `/content/${bookId}/upload`,
        formData
      )

      setContents(prev => [...prev, data])

      setUploadFile(null)

      toast.success('File uploaded')

    } catch {

      toast.error('Upload failed')

    }
  }

  const handleDelete = async (contentId) => {

    try {

      await api.delete(
        `/content/${bookId}/items/${contentId}`
      )

      setContents(prev =>
        prev.filter(c => c.id !== contentId)
      )

      toast.success('Deleted')

    } catch {

      toast.error('Delete failed')

    }
  }

  const handleGenerate = async () => {

    if (contents.length === 0) {
      return toast.error('Add notes first')
    }

    setGenerating(true)

    try {

      const { data } = await api.post(
        '/generate/booklet',
        {
          book_id: parseInt(bookId),
          title: bookletTitle,
          options: selectedOptions,
        }
      )

      setGeneratedContent(data.generated_content)

      toast.success('Generated successfully')

    } catch (err) {

      toast.error(
        err.response?.data?.detail || 'Generation failed'
      )

    } finally {

      setGenerating(false)

    }
  }

  if (!book) {
    return <div>Loading...</div>
  }

  return (
    <div style={s.page}>

      <nav style={s.nav}>

        <button
          style={s.backBtn}
          onClick={() => navigate('/')}
        >
          ← Back
        </button>

        <div
          style={{
            ...s.colorBar,
            background: book.color
          }}
        />

        <div style={s.bookTitle}>
          {book.title}
        </div>

        <div style={s.bookSubject}>
          · {book.subject}
        </div>

      </nav>

      <div style={s.layout}>

        <aside style={s.sidebar}>

          <div style={s.sidebarHeader}>

            <div style={s.sidebarTitle}>
              Study Materials ({contents.length})
            </div>

            <div style={s.addMenu}>

              <button
                style={s.addBtn}
                onClick={() => fileInputRef.current.click()}
              >
                📎 File
              </button>

              <button
                style={s.addBtn}
                onClick={() => setShowText(true)}
              >
                ✏️ Note
              </button>

            </div>

          </div>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={e => {
              setUploadFile(e.target.files[0])
              handleFileUpload()
            }}
          />

          <div style={s.contentList}>

            {contents.map(c => (

              <div
                key={c.id}
                style={s.contentItem}
              >

                <div>
                  {FILE_ICONS[c.content_type]}
                </div>

                <div style={s.contentInfo}>

                  <div style={s.contentName}>
                    {c.title}
                  </div>

                  <div
                    style={{
                      ...s.contentType,
                      color: FILE_COLORS[c.content_type]
                    }}
                  >
                    {c.content_type}
                  </div>

                </div>

                <button
                  style={s.deleteBtn}
                  onClick={() => handleDelete(c.id)}
                >
                  ×
                </button>

              </div>

            ))}

          </div>

        </aside>

        <main style={s.main}>

          <div style={s.sectionTitle}>
            Generate Study Notes
          </div>

          <div style={s.sectionDesc}>
            Select AI features for generation
          </div>

          <div style={s.optionsGrid}>

            {GENERATION_OPTIONS.map(opt => {

              const selected = selectedOptions.includes(opt.id)

              return (

                <div
                  key={opt.id}
                  style={{
                    ...s.optionCard,
                    borderColor: selected
                      ? '#6C63FF'
                      : '#E5E7EB',
                    background: selected
                      ? '#F3F0FF'
                      : 'white'
                  }}
                  onClick={() => toggleOption(opt.id)}
                >

                  <div style={{ fontSize: 28 }}>
                    {opt.emoji}
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      marginTop: 10,
                    }}
                  >
                    {opt.label}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: '#6B7280',
                      marginTop: 6,
                    }}
                  >
                    {opt.desc}
                  </div>

                </div>
              )
            })}

          </div>

          <input
            style={s.titleInput}
            value={bookletTitle}
            onChange={e =>
              setBookletTitle(e.target.value)
            }
          />

          <button
            style={s.generateBtn}
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating
              ? 'Generating...'
              : '✨ Generate Notes'}
          </button>

          {generatedContent && (

            <div style={s.generatedBox}>

              <div style={s.generatedTitle}>
                ✨ Generated Study Notes
              </div>

              <div style={{ marginTop: 24 }}>

  {Object.entries(generatedContent).map(
    ([section, content]) => (

      <div
        key={section}
        style={{
          background: 'white',
          borderRadius: 18,
          padding: 24,
          marginBottom: 22,
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
        }}
      >

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 18,
          }}
        >

          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: '#F3F0FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            {{
              summary: '📋',
              key_concepts: '🔑',
              flowchart: '🔄',
              comparison: '⚖️',
              qa: '❓',
              timeline: '📅'
            }[section] || '✨'}
          </div>

          <div>

            <div
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 22,
                fontWeight: 800,
                color: '#1A1A2E',
                textTransform: 'capitalize',
              }}
            >
              {section.replace('_', ' ')}
            </div>

            <div
              style={{
                fontSize: 13,
                color: '#9CA3AF',
                marginTop: 2,
              }}
            >
              AI Generated Study Material
            </div>

          </div>

        </div>

        <div
          style={{
            lineHeight: 1.9,
            color: '#374151',
            fontSize: 15,
            whiteSpace: 'pre-wrap',
          }}
        >
          {String(content)
            .replace(/\\n/g, '\n')
            .replace(/\*\*/g, '')
          }
        </div>

      </div>
    )
  )}

</div>

            </div>

          )}

        </main>

      </div>

      {showText && (

        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >

          <div
            style={{
              background: 'white',
              borderRadius: 20,
              padding: 30,
              width: 500,
            }}
          >

            <h2>Add Text Note</h2>

            <input
              placeholder="Title"
              value={textForm.title}
              onChange={e =>
                setTextForm(f => ({
                  ...f,
                  title: e.target.value
                }))
              }
              style={{
                width: '100%',
                padding: 12,
                marginBottom: 14,
              }}
            />

            <textarea
              rows={10}
              placeholder="Paste notes..."
              value={textForm.content}
              onChange={e =>
                setTextForm(f => ({
                  ...f,
                  content: e.target.value
                }))
              }
              style={{
                width: '100%',
                padding: 12,
              }}
            />

            <div
              style={{
                display: 'flex',
                gap: 10,
                marginTop: 20,
              }}
            >

              <button
                onClick={() => setShowText(false)}
                style={{
                  flex: 1,
                  padding: 12,
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleTextAdd}
                style={{
                  flex: 2,
                  padding: 12,
                  background: '#6C63FF',
                  color: 'white',
                  border: 'none',
                }}
              >
                Add Note
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}