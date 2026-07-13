import axios from 'axios'

// Dev stays relative so requests are same-origin and go through the Vite proxy —
// that is what lets a phone on the LAN reach the backend. An absolute
// http://localhost:... would resolve to the phone itself.
// VITE_API_URL is stripped of trailing slashes to avoid a '//api' base in prod.
const apiUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

const baseURL = import.meta.env.PROD ? `${apiUrl}/api` : '/api'

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
