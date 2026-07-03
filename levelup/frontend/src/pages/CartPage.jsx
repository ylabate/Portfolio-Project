import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, Lock, Gamepad2 } from 'lucide-react';
import { getProductThumbnail } from '../utils/assets';

export default function CartPage() {
  const { cart, addToCart, removeFromCart, checkout } = useCart();
  const navigate = useNavigate();
  const { success } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = cart?.items ?? [];
  const total = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);

  const handleCheckout = async () => {
    setLoading(true); setError('');
    try {
      const { checkout_url } = await checkout();
      window.location.href = checkout_url;
    } catch (err) {
      setError(err.response?.data?.description ?? 'Checkout failed. Try again.');
    }
    setLoading(false);
  };

  const handleRemoveItem = async (productId, productName) => {
    try {
      await removeFromCart(productId);
      success(`${productName} removed from cart`);
    } catch {}
  };

  const handleDecreaseQty = async (productId, productName) => {
    try {
      await removeFromCart(productId, 1);
      success(`Decreased quantity of ${productName}`);
    } catch {}
  };

  const handleIncreaseQty = async (productId, productName) => {
    try {
      await addToCart(productId, 1);
      success(`Increased quantity of ${productName}`);
    } catch {}
  };

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: 120 }}>
            <ShoppingCart size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
            <h3>Your cart is empty</h3>
            <p>Add some games to get started!</p>
            <Link to="/" className="btn btn-primary">Browse Store</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 40 }}>
        <h1 className="page-title">Your <span>Cart</span></h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>{items.length} item{items.length !== 1 ? 's' : ''}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="cart-layout">
            <div className="cart-items">
            {items.map((item) => {
              const isOverStock = item.quantity > (item.stock ?? 0);
              const thumbnail = getProductThumbnail(item);
              return (
                <div key={item.id} className={`cart-item ${isOverStock ? 'overstock-warning' : ''}`} style={isOverStock ? { border: '1px solid var(--text-danger)' } : {}}>
                  {thumbnail ? (
                    <img className="cart-item-img" src={thumbnail} alt={item.product_name} />
                  ) : (
                    <div className="cart-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Gamepad2 size={24} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.product_name}</div>
                    <div className="cart-item-price">€{((item.price ?? 0) * item.quantity).toFixed(2)}</div>
                    <div style={{ fontSize: '0.8rem', color: isOverStock ? 'var(--text-danger)' : 'var(--text-secondary)', marginTop: 4 }}>
                      Stock: {item.stock ?? 0}
                    </div>
                  </div>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => handleDecreaseQty(item.product_id, item.product_name)}>−</button>
                    <span className="qty-value" style={isOverStock ? { color: 'var(--text-danger)', fontWeight: 'bold' } : {}}>{item.quantity}</span>
                    <button className="qty-btn" style={{ color: 'var(--purple-light)' }}
                      onClick={() => handleIncreaseQty(item.product_id, item.product_name)}
                      disabled={item.quantity >= (item.stock ?? 0)}>+</button>
                  </div>
                  <button className="btn btn-sm btn-danger" onClick={() => handleRemoveItem(item.product_id, item.product_name)}>Remove</button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            {items.map((item) => (
              <div key={item.id} className="summary-row">
                <span>{item.product_name} × {item.quantity}</span>
                <span>€{((item.price ?? 0) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-total">
              <span>Total</span>
              <span>€{total.toFixed(2)}</span>
            </div>
            {items.some(i => i.quantity > (i.stock ?? 0)) && (
              <div className="alert alert-error" style={{ fontSize: '0.85rem', padding: '8px 12px', marginBottom: 12 }}>
                Some items exceed available stock. Please adjust quantities.
              </div>
            )}
            <button 
              className="checkout-btn" 
              onClick={handleCheckout} 
              disabled={loading || items.some(i => i.quantity > (i.stock ?? 0))}
            >
              {loading ? (
                'Redirecting...'
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <Lock size={16} /> Checkout with Stripe
                </span>
              )}
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
              Secured by Stripe · Keys delivered instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
