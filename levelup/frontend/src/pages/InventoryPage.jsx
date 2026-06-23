import { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../context/ToastContext';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);
  const [keys, setKeys] = useState({});
  const { success } = useToast();

  useEffect(() => {
    api.get('/inventory').then(({ data }) => {
      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleActivate = async (item) => {
    setActivating(item.id);
    try {
      const { data } = await api.get(`/inventory/${item.id}/activate`);
      setKeys((k) => ({ ...k, [item.id]: data.metadata?.activation_code }));
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, state: 'activated' } : i));
      success(`Key activated successfully for ${item.product_details?.product_name ?? 'game'}!`);
    } catch (err) {
      // Handled by global interceptor toast
    }
    setActivating(null);
  };

  if (loading) return <div className="page"><div className="loading-center"><div className="spinner" /></div></div>;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40 }}>
        <h1 className="page-title">My <span>Inventory</span></h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>{items.length} game key{items.length !== 1 ? 's' : ''}</p>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🎒</div>
            <h3>Your inventory is empty</h3>
            <p>Purchase games from the store to see your keys here</p>
          </div>
        ) : (
          <div className="items-list">
            {items.map((item) => {
              const product = item.product_details;
              const thumbnail = product?.product_thumbnail_link;
              return (
                <div key={item.id} className="inventory-card">
                  {thumbnail ? (
                    <img className="inventory-card-img" src={thumbnail} alt={product?.product_name} />
                  ) : (
                    <div className="inventory-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🎮</div>
                  )}
                  <div className="inventory-card-info">
                    <div className="inventory-card-name">{product?.product_name ?? 'Unknown Game'}</div>
                    <span className={`state-badge ${item.state}`}>
                      {item.state === 'in_inventory' ? '● Available' : item.state === 'activated' ? '✓ Activated' : '○ Opened'}
                    </span>
                    {keys[item.id] && (
                      <div className="activation-key">{keys[item.id]}</div>
                    )}
                  </div>
                  {item.state === 'in_inventory' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleActivate(item)}
                      disabled={activating === item.id}
                    >
                      {activating === item.id ? '...' : '🔑 Activate'}
                    </button>
                  )}
                  {item.state === 'activated' && !keys[item.id] && (
                    <button className="btn btn-secondary btn-sm" onClick={() => handleActivate(item)} disabled={activating === item.id}>
                      👁 Show Key
                    </button>
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
