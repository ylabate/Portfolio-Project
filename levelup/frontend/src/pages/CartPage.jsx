import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

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
            <div className="icon">🛒</div>
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
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                {item.product_thumbnail_link ? (
                  <img className="cart-item-img" src={item.product_thumbnail_link} alt={item.product_name} />
                ) : (
                  <div className="cart-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🎮</div>
                )}
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.product_name}</div>
                  <div className="cart-item-price">€{((item.price ?? 0) * item.quantity).toFixed(2)}</div>
                </div>
                <div className="cart-item-qty">
                  <button className="qty-btn" onClick={() => handleDecreaseQty(item.product_id, item.product_name)}>−</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" style={{ color: 'var(--purple-light)' }}
                    onClick={() => handleIncreaseQty(item.product_id, item.product_name)}>+</button>
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => handleRemoveItem(item.product_id, item.product_name)}>Remove</button>
              </div>
            ))}
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
            <button className="checkout-btn" onClick={handleCheckout} disabled={loading}>
              {loading ? 'Redirecting...' : '🔒 Checkout with Stripe'}
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
