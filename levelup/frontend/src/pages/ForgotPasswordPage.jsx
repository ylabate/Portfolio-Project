import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Zap } from 'lucide-react';
import api from '../api';

export default function ForgotPasswordPage() {
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      success('If this email exists, a reset link has been sent');
    } catch (err) {
      const msg = err.response?.data?.description ?? err.response?.data?.message ?? 'Unable to send reset link';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" style={{ color: 'var(--cyan)' }}>
          <Zap size={32} fill="currentColor" style={{ stroke: 'none' }} />
        </div>
        <h1 className="auth-title">Forgot password?</h1>
        <p className="auth-sub">Enter your email and we'll send you a reset link</p>

        {sent ? (
          <div className="alert alert-success">
            If this email exists, a reset link has been sent. Please check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button className="form-submit" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="form-alt">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
