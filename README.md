# StudyForge AI 📚✨

AI-powered study assistant that transforms raw study material into smart, structured, and interactive notes using Generative AI.

🔗 Live Demo: https://study-forge-phi.vercel.app/

---

# 🚀 Features

- 📄 Upload PDFs and Notes
- 🤖 AI-powered study material generation
- 📝 Smart summaries
- 🧠 Key concept extraction
- 🔄 Flowchart generation
- ⚖️ Comparison tables
- ❓ Practice Questions & Answers
- 📅 Timeline generation
- 📚 Chapter-wise organization
- 🔐 JWT Authentication
- ☁️ Cloud deployment support

---

# 🛠 Tech Stack

## Frontend
- React.js
- Vite
- Zustand
- Axios
- React Router

## Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication

## AI
- Gemini API

## Deployment
- Vercel (Frontend)
- Render (Backend)

---

# 📂 Project Structure

```bash
StudyForge/
│
├── backend/
│   ├── routers/
│   ├── services/
│   ├── uploads/
│   ├── generated/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd StudyForge
```

---

# 🔧 Backend Setup

## Create Virtual Environment

```bash
cd backend

python -m venv venv
```

## Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / Mac

```bash
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Create `.env`

```env
DATABASE_URL=your_postgresql_url
SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

---

## Run Backend

```bash
uvicorn main:app --reload
```

Backend runs on:

```bash
http://localhost:8000
```

---

# 🎨 Frontend Setup

```bash
cd frontend
npm install
```

---

## Create `.env`

```env
VITE_API_URL=http://localhost:8000/api
```

---

## Run Frontend

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 🔑 API Routes

## Auth

| Method | Route |
|---|---|
| POST | `/api/auth/signup` |
| POST | `/api/auth/login` |

---

## Books

| Method | Route |
|---|---|
| GET | `/api/books` |
| POST | `/api/books` |
| DELETE | `/api/books/{id}` |

---

## Content

| Method | Route |
|---|---|
| POST | `/api/content/{book_id}/upload` |
| POST | `/api/content/{book_id}/text` |
| GET | `/api/content/{book_id}/items` |

---

## AI Generation

| Method | Route |
|---|---|
| POST | `/api/generate/booklet` |
| GET | `/api/generate/history/{book_id}` |

---

# ☁️ Deployment

## Frontend Deployment
Deploy using:
- Vercel

## Backend Deployment
Deploy using:
- Render

---

# 🔥 Environment Variables

## Backend

```env
DATABASE_URL=
SECRET_KEY=
GEMINI_API_KEY=
```

## Frontend

```env
VITE_API_URL=
```

---

# 📌 Future Improvements

- 📊 Interactive diagrams
- 🎙 Voice notes support
- 📱 Mobile responsiveness improvements
- ☁️ Cloud file storage
- 🧠 Better AI formatting
- 📈 Analytics dashboard
- 👥 Collaborative study spaces

---

# 👨‍💻 Author

Shivansh Saxena

Built with ❤️ using AI + Full Stack Development.