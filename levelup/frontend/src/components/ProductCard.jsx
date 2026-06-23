import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '../context/ToastContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      await addToCart(product.product_id);
      setAdded(true);
      success(`${product.product_name} added to cart!`);
      setTimeout(() => setAdded(false), 1500);
    } catch {}
    setLoading(false);
  };

  const thumbnail = product.product_thumbnail_link;
  const genres = product.product_genres || [];

  return (
    <div className="product-card" onClick={() => {}}>
      {thumbnail ? (
        <img className="card-thumbnail" src={thumbnail} alt={product.product_name} onError={(e) => { e.target.style.display = 'none'; }} />
      ) : (
        <div className="card-thumbnail-placeholder">🎮</div>
      )}
      <div className="card-body">
        {genres.length > 0 && (
          <div className="card-genres">
            {genres.slice(0, 2).map((g) => (
              <span key={g.id ?? g} className="genre-badge">{g.name ?? g}</span>
            ))}
          </div>
        )}
        <div className="card-name">{product.product_name}</div>
        <div className="card-footer">
          <span className="card-price">
            {product.price_cents !== undefined
              ? `€${(product.price_cents / 100).toFixed(2)}`
              : product.price !== undefined
              ? `€${Number(product.price).toFixed(2)}`
              : '—'}
          </span>
          <button
            className="add-to-cart-btn"
            onClick={handleAdd}
            disabled={loading}
          >
            {added ? '✓ Added' : loading ? '...' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
