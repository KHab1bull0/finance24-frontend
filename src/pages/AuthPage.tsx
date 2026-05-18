import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import api from '@/api/axios'
import { useAuth } from '@/contexts/AuthContext'

type Mode = 'login' | 'register'

interface ApiError {
  response?: { data?: { message?: string | string[] } }
}

function extractMessage(err: unknown): string {
  const e = err as ApiError
  const msg = e?.response?.data?.message
  if (Array.isArray(msg)) return msg[0]
  return msg ?? 'Something went wrong'
}

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const { data } = await api.post<{ access_token: string }>(endpoint, { username, password })
      login(data.access_token)
      navigate('/', { replace: true })
    } catch (err) {
      setError(extractMessage(err))
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setMode((m) => (m === 'login' ? 'register' : 'login'))
    setError('')
  }

  const isLogin = mode === 'login'

  return (
    <div className="ft-auth-page">
      <div className="ft-auth-brand">
        <div className="ft-logo-mark">
          <Wallet size={18} />
        </div>
        <span className="ft-auth-brand-name">Finance Tracker</span>
      </div>

      <div className="ft-card ft-auth-card">
        <h1 className="ft-auth-title">{isLogin ? 'Welcome back' : 'Create account'}</h1>
        <p className="ft-auth-sub">
          {isLogin ? 'Sign in to your account' : 'Choose a username and password to get started'}
        </p>

        {/* Mode tabs */}
        <div className="ft-tabs" style={{ marginBottom: 24, width: '100%' }}>
          <button
            className={`ft-tab ${isLogin ? 'is-active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => { setMode('login'); setError('') }}
          >
            Sign in
          </button>
          <button
            className={`ft-tab ${!isLogin ? 'is-active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => { setMode('register'); setError('') }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ft-auth-form">
          <label className="ft-field">
            <span className="ft-field-label">Username</span>
            <div className="ft-input-wrap">
              <input
                className="ft-input"
                placeholder={isLogin ? 'Your username' : 'Pick a username (3–50 chars)'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete={isLogin ? 'username' : 'username'}
                required
                minLength={3}
              />
            </div>
          </label>

          <label className="ft-field">
            <span className="ft-field-label">Password</span>
            <div className="ft-input-wrap">
              <input
                className="ft-input"
                type="password"
                placeholder={isLogin ? 'Your password' : 'At least 8 characters'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                minLength={isLogin ? 1 : 8}
              />
            </div>
          </label>

          {error && <div className="ft-auth-error">{error}</div>}

          <button
            type="submit"
            className="ft-btn ft-btn-primary ft-btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="ft-auth-switch">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" onClick={switchMode}>
            {isLogin ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
