import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronDown, ChevronUp, Calendar, ExternalLink, Gamepad2 } from 'lucide-react';
import api from '../api';
import { getProductThumbnail } from '../utils/assets';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    api.get('/orders').then(({ data }) => {
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    setCancellingOrderId(orderId);
    try {
      await api.patch(`/orders/${orderId}`, { payment_status: 'cancelled' });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, payment_status: 'cancelled' } : o));
    } catch (err) {
      import('../context/ToastContext.jsx').then(({ triggerToast }) => {
        triggerToast(err.response?.data?.description ?? 'Unable to cancel the order', 'error');
      });
    } finally {
      setCancellingOrderId(null);
    }
  };

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
            {orders.map((order) => {
              const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
              const isExpanded = expandedOrders[order.id];
              return (
                <div key={order.id} className="order-card-wrapper">
                  <div 
                    className={`order-header-clickable ${isExpanded ? 'active' : ''}`}
                    onClick={() => toggleOrder(order.id)}
                  >
                    <div className="order-meta-info">
                      <div className="order-meta-title">Order #{order.id.slice(0, 8)}...</div>
                      <div className="order-meta-sub">
                        <span className="meta-sub-item">
                          <Calendar size={12} /> {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                        </span>
                        <span className={`order-status-badge order-status-${order.payment_status || 'pending'}`}>
                          {order.payment_status === 'paid' ? 'Paid' : order.payment_status === 'pending' ? 'Pending' : order.payment_status || 'Pending'}
                        </span>
                        {order.payment_status === 'pending' && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelOrder(order.id);
                            }}
                            disabled={cancellingOrderId === order.id}
                          >
                            {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                        <span className="meta-sub-item">• {totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="order-total-block">
                      <span className="order-total-price">€{(order.total ?? order.total_cents / 100).toFixed(2)}</span>
                      <span className="order-chevron-icon">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="order-details-dropdown">
                      <div className="order-full-id">Full Order ID: <code>{order.id}</code></div>
                      <div className="order-items-list-detailed">
                        {(order.items ?? []).map((item) => {
                          const thumbnail = getProductThumbnail(item);
                          return (
                            <div key={item.id} className="order-detail-item-row">
                              {thumbnail ? (
                                <img className="order-item-thumb" src={thumbnail} alt={item.product_name} />
                              ) : (
                              <div className="order-item-thumb-placeholder">
                                <Gamepad2 size={16} />
                              </div>
                            )}
                            <div className="order-item-main-details">
                              <Link 
                                to={`/products/${item.product_id}`} 
                                className="order-item-game-name"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {item.product_name} <ExternalLink size={12} className="external-icon" />
                              </Link>
                              {item.product_genres?.length > 0 && (
                                <div className="order-item-genres">
                                  {item.product_genres.slice(0, 2).map((g) => (
                                    <span key={g.id ?? g} className="genre-pill-sm">{g.name ?? g}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="order-item-pricing">
                              <div className="item-price-unit">€{item.price_at_purchase.toFixed(2)} each</div>
                              <div className="item-price-qty">Qty: {item.quantity}</div>
                              <div className="item-price-total">€{(item.price_at_purchase * item.quantity).toFixed(2)}</div>
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
