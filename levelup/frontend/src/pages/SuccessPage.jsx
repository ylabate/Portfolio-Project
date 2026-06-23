import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
        const { data } = await api.get(`/checkout/${sessionId}/status`);
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
        <div className="success-icon">⏳</div>
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
        <div className="success-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p>Your payment may still be processing. Check your inventory in a few minutes.</p>
        <Link to="/inventory" className="btn btn-primary">Go to Inventory</Link>
      </div>
    </div>
  );

  return (
    <div className="success-page">
      <div>
        <div className="success-icon">🎉</div>
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
