import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Zap } from 'lucide-react';
import api from '../api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || password.length < 8) {
      error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      success('Password reset successfully. You can now sign in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.description ?? err.response?.data?.message ?? 'Unable to reset password';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo" style={{ color: 'var(--cyan)' }}>
            <Zap size={32} fill="currentColor" style={{ stroke: 'none' }} />
          </div>
          <h1 className="auth-title">Invalid reset link</h1>
          <p className="auth-sub">The password reset token is missing or invalid.</p>
          <Link to="/login" className="form-submit" style={{ textAlign: 'center', display: 'block' }}>
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" style={{ color: 'var(--cyan)' }}>
          <Zap size={32} fill="currentColor" style={{ stroke: 'none' }} />
        </div>
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-sub">Choose a new password for your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="form-submit" type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
        <p className="form-alt">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
