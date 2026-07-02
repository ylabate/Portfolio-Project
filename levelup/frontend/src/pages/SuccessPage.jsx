import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Loader2, AlertTriangle, PartyPopper } from 'lucide-react';
import api from '../api';

export default function SuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [status, setStatus] = useState('polling'); // polling | success | error

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return; }
    let attempts = 0;
    const poll = async () => {
      try {
        const { data } = await api.get(`/checkout/${sessionId}/status`, { _skipToast: true });
        if (data.success) { setStatus('success'); return; }
      } catch {}
      attempts++;
      if (attempts < 15) setTimeout(poll, 2000);
      else setStatus('error');
    };
    poll();
  }, [sessionId]);

  if (status === 'polling') return (
    <div className="success-page">
      <div>
        <div className="success-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Loader2 size={64} style={{ color: 'var(--purple-light)', animation: 'spin 1.2s linear infinite' }} />
        </div>
        <h2>Processing your order...</h2>
        <p>We're confirming your payment with Stripe. This takes just a moment.</p>
        <div className="polling-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );

  if (status === 'error') return (
    <div className="success-page">
      <div>
        <div className="success-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--warning)', marginBottom: 20 }}>
          <AlertTriangle size={64} />
        </div>
        <h2>Something went wrong</h2>
        <p>Your payment may still be processing. Check your inventory in a few minutes.</p>
        <Link to="/inventory" className="btn btn-primary">Go to Inventory</Link>
      </div>
    </div>
  );

  return (
    <div className="success-page">
      <div>
        <div className="success-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--success)', marginBottom: 20 }}>
          <PartyPopper size={64} />
        </div>
        <h2>Payment successful!</h2>
        <p>Your game keys have been added to your inventory. Ready to play!</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/inventory" className="btn btn-primary">View Inventory</Link>
          <Link to="/" className="btn btn-secondary">Back to Store</Link>
        </div>
      </div>
    </div>
  );
}
