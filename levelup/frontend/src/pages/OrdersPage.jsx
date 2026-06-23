import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import api from '../api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(({ data }) => {
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="loading-center"><div className="spinner" /></div></div>;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40 }}>
        <h1 className="page-title">Order <span>History</span></h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>

        {orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
            <h3>No orders yet</h3>
            <p>Your purchase history will appear here</p>
          </div>
        ) : (
          <div className="items-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <div className="order-id">#{order.id}</div>
                    <div className="order-date">{order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</div>
                  </div>
                  <div className="order-total">€{(order.total ?? order.total_cents / 100).toFixed(2)}</div>
                </div>
                <div className="order-items-list">
                  {(order.items ?? []).map((item) => (
                    <div key={item.id} className="order-item-row">
                      <span className="order-item-name">{item.product_name}</span>
                      <span className="order-item-qty">× {item.quantity}</span>
                      <span className="order-item-price">€{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
