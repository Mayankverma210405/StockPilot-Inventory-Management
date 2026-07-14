import { useState, type FormEvent } from 'react'
import { ArrowRight, Boxes, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function LoginPage() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('mayank.admin@stockpilot.demo')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  const selectDemo = (role: 'admin' | 'manager') => {
    setEmail(role === 'admin' ? 'mayank.admin@stockpilot.demo' : 'mayank.manager@stockpilot.demo')
    setPassword(role === 'admin' ? 'admin123' : 'manager123')
    setError('')
  }

  return (
    <main className="login-page">
      <section className="login-showcase">
        <div className="showcase-grid" />
        <div className="login-brand"><div className="brand-mark light"><Boxes size={23} /></div><strong>StockPilot</strong></div>
        <div className="showcase-copy">
          <span className="showcase-pill"><ShieldCheck size={15} /> Enterprise inventory control</span>
          <h1>Every item.<br />Every location.<br /><em>Always in view.</em></h1>
          <p>A single source of truth for stock levels, warehouse operations, and inventory decisions.</p>
          <div className="login-proof">
            <div><strong>3</strong><span>Warehouse locations</span></div>
            <div><strong>2</strong><span>Role-based accounts</span></div>
            <div><strong>CSV</strong><span>Report exports</span></div>
          </div>
        </div>
        <div className="showcase-footer"><CheckCircle2 size={17} /> Trusted workflows for modern operations teams</div>
      </section>
      <section className="login-panel">
        <div className="login-form-wrap">
          <div className="mobile-login-brand"><div className="brand-mark"><Boxes size={22} /></div><strong>StockPilot</strong></div>
          <div className="login-heading"><span>Welcome back</span><h2>Sign in to your workspace</h2><p>Enter your credentials to access the inventory console.</p></div>
          <form onSubmit={submit}>
            <label className="field-label">Work email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" required autoFocus /></label>
            <label className="field-label">Password<div className="password-input"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword((show) => !show)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
            <div className="login-options"><label className="checkbox-label"><input type="checkbox" defaultChecked /> Remember me</label><button type="button" className="text-button" onClick={() => setError('Contact your workspace administrator to reset your password.')}>Forgot password?</button></div>
            {error && <div className="form-error">{error}</div>}
            <button className="button primary login-submit" disabled={loading}>{loading ? 'Signing in…' : <>Sign in <ArrowRight size={18} /></>}</button>
          </form>
          <div className="demo-divider"><span>Portfolio demo accounts</span></div>
          <div className="demo-buttons"><button onClick={() => selectDemo('admin')} className={email.startsWith('admin') ? 'selected' : ''}><ShieldCheck size={18} /><span><strong>Administrator</strong><small>Full system access</small></span></button><button onClick={() => selectDemo('manager')} className={email.startsWith('manager') ? 'selected' : ''}><LockKeyhole size={18} /><span><strong>Inventory manager</strong><small>Operations access</small></span></button></div>
          <p className="login-legal">Frontend portfolio demo with simulated role-based access. Demo data is stored in your browser.</p>
        </div>
      </section>
    </main>
  )
}
