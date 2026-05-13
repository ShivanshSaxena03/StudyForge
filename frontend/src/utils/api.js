import axios from 'axios' 
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'https://studyforge-g7z7.onrender.com/api', }) 
api.interceptors.request.use(config => { const token = localStorage.getItem('sf_token') 
if (token) { config.headers.Authorization = `Bearer ${token}` } return config }) 
  export default api