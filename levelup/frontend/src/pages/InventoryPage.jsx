import { useState, useEffect, useRef } from 'react';
import { Gamepad2, Key, Eye, EyeOff, AlertTriangle, Copy } from 'lucide-react';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { getProductThumbnail } from '../utils/assets';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activating, setActivating] = useState(null);
  const [keys, setKeys] = useState({});
  const [visibleKeys, setVisibleKeys] = useState({});
  const [confirmingActivation, setConfirmingActivation] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { success } = useToast();
  const loaderRef = useRef(null);

  useEffect(() => {
    if (page > 1) setLoadingMore(true);
    api.get(`/inventory?page=${page}&limit=10`).then(({ data }) => {
      const newItems = Array.isArray(data) ? data : [];
      if (page === 1) {
        setItems(newItems);
      } else {
        setItems((prev) => [...prev, ...newItems]);
      }
      setHasMore(newItems.length === 10);
      setLoading(false);
      setLoadingMore(false);
    }).catch(() => {
      setLoading(false);
      setLoadingMore(false);
    });
  }, [page]);

  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loadingMore, loading]);

  const handleActivate = async (item) => {
    setActivating(item.id);
    try {
      const { data } = await api.get(`/inventory/${item.id}/activate`);
      const code = data.metadata?.activation_code;
      setKeys((k) => ({ ...k, [item.id]: code }));
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, state: 'activated' } : i));
      setVisibleKeys((v) => ({ ...v, [item.id]: true }));
      success(`Key activated successfully for ${item.product_details?.product_name ?? 'game'}!`);
    } catch (err) {
      // Handled by global interceptor toast
    }
    setActivating(null);
  };

  const toggleKeyVisibility = (itemId) => {
    setVisibleKeys((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  if (loading) return <div className="page"><div className="loading-center"><div className="spinner" /></div></div>;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40 }}>
        <h1 className="page-title">My <span>Inventory</span></h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>{items.length} game key{items.length !== 1 ? 's' : ''}</p>

        {items.length === 0 ? (
          <div className="empty-state">
            <Gamepad2 size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
            <h3>Your inventory is empty</h3>
            <p>Purchase games from the store to see your keys here</p>
          </div>
        ) : (
          <div className="items-list">
            {items.map((item) => {
              const product = item.product_details;
              const thumbnail = getProductThumbnail(product);
              return (
                <div key={item.id} className="inventory-card-wrapper">
                  <div 
                    className={`inventory-card ${item.state}`}
                    onClick={() => item.state === 'activated' && toggleKeyVisibility(item.id)}
                    style={{ cursor: item.state === 'activated' ? 'pointer' : 'default' }}
                  >
                    {thumbnail ? (
                      <img className="inventory-card-img" src={thumbnail} alt={product?.product_name} />
                    ) : (
                      <div className="inventory-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Gamepad2 size={24} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                    <div className="inventory-card-info">
                      <div className="inventory-card-name">{product?.product_name ?? 'Unknown Game'}</div>
                      <span className={`state-badge ${item.state}`}>
                        {item.state === 'in_inventory' ? '● Available' : item.state === 'activated' ? '✓ Activated' : '○ Opened'}
                      </span>
                    </div>
                    <div className="inventory-card-actions" onClick={(e) => e.stopPropagation()}>
                      {item.state === 'in_inventory' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setConfirmingActivation(item)}
                          disabled={activating === item.id}
                        >
                          {activating === item.id ? (
                            '...'
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <Key size={14} /> Activate
                            </span>
                          )}
                        </button>
                      )}
                      {item.state === 'activated' && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleKeyVisibility(item.id)}
                        >
                          {visibleKeys[item.id] ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><EyeOff size={14} /> Hide Key</span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Eye size={14} /> Show Key</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {item.state === 'activated' && visibleKeys[item.id] && (
                    <div className="activation-key-box">
                      <div className="key-header">
                        <span className="key-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Key size={14} /> Game Activation Key
                        </span>
                        <span className="key-instructions">Redeem this code on your game launcher (Steam, Epic, GOG, etc.)</span>
                      </div>
                      <div className="key-code-wrapper">
                        <code className="key-code">{keys[item.id] ?? item.details?.activation_code ?? 'NO_CODE_FOUND'}</code>
                        <button 
                          className="btn btn-sm btn-cyan copy-btn"
                          onClick={() => {
                            const code = keys[item.id] ?? item.details?.activation_code;
                            if (code) {
                              navigator.clipboard.writeText(code);
                              success('Code copied to clipboard!');
                            }
                          }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Copy size={12} /> Copy</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div ref={loaderRef} style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
            <div className="spinner" style={{ width: 24, height: 24, margin: 0 }} />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmingActivation && (
        <div className="modal-overlay">
          <div className="modal-card warning-glow">
            <div className="modal-icon" style={{ color: 'var(--warning)', display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <AlertTriangle size={48} />
            </div>
            <h2>Confirm Key Activation</h2>
            <p>You are about to activate the game key for:</p>
            <div className="modal-game-title">
              {confirmingActivation.product_details?.product_name}
            </div>
            <p className="modal-warning-text">
              Activating this key will bind a stock code to your inventory. <strong>This action is definitive and permanent.</strong> You will not be able to return or refund this game after activation.
            </p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setConfirmingActivation(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  const item = confirmingActivation;
                  setConfirmingActivation(null);
                  handleActivate(item);
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Key size={14} /> Yes, Activate Key
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
