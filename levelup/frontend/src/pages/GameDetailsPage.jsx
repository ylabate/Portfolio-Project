import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, ArrowLeft, Star, Gamepad2, 
  Layers, Info, Calendar, MessageSquare, AlertCircle
} from 'lucide-react';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function GameDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { success } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [adding, setAdding] = useState(false);
  const [genresMap, setGenresMap] = useState({});

  useEffect(() => {
    // Fetch genres mapping
    api.get('/genres', { _skipToast: true }).then(({ data }) => {
      const mapping = {};
      (data.genres ?? []).forEach((g) => {
        mapping[g.id] = g.name;
      });
      setGenresMap(mapping);
    }).catch(() => {});

    // Fetch product details and reviews
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const prodRes = await api.get(`/products/${id}`);
        const prodData = prodRes.data.product;
        setProduct(prodData);
        setActiveImage(prodData.product_thumbnail_link || '');

        const reviewsRes = await api.get(`/products/${id}/reviews`, { _skipToast: true });
        setReviews(reviewsRes.data.reviews ?? []);
      } catch (err) {
        // Axios interceptor will show the error toast
      }
      setLoading(false);
    };

    fetchDetails();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(product.product_id);
      success(`${product.product_name} added to cart!`);
    } catch {}
    setAdding(false);
  };

  if (loading) return <div className="page"><div className="loading-center"><div className="spinner" /></div></div>;
  if (!product) return (
    <div className="page">
      <div className="container">
        <div className="empty-state">
          <AlertCircle size={48} className="text-danger" style={{ marginBottom: 16 }} />
          <h3>Game Not Found</h3>
          <p>The product you are looking for does not exist or was removed.</p>
          <Link to="/" className="btn btn-primary">Back to Store</Link>
        </div>
      </div>
    </div>
  );

  // Filter out duplicate image links (since thumbnail is also returned inside product_images)
  const images = [];
  const seenLinks = new Set();
  if (product.product_thumbnail_link) {
    images.push({ link: product.product_thumbnail_link, alt: 'thumbnail' });
    seenLinks.add(product.product_thumbnail_link);
  }
  (product.product_images ?? []).forEach((img) => {
    if (img.link && !seenLinks.has(img.link)) {
      images.push(img);
      seenLinks.add(img.link);
    }
  });

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 30 }}>
        <Link to="/" className="nav-back-link">
          <ArrowLeft size={16} /> Back to Store
        </Link>

        <div className="game-details-layout">
          {/* Left Column: Image Gallery */}
          <div className="game-gallery">
            <div className="main-display-wrapper">
              {activeImage ? (
                <img className="main-display-img" src={activeImage} alt={product.product_name} />
              ) : (
                <div className="main-display-placeholder"><Gamepad2 size={64} /></div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="thumbnails-grid">
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    className={`thumbnail-btn ${activeImage === img.link ? 'active' : ''}`}
                    onClick={() => setActiveImage(img.link)}
                  >
                    <img src={img.link} alt={img.alt || 'screenshot'} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Game Info */}
          <div className="game-info-block">
            <div className="game-header-row">
              <span className="type-badge-large">{product.type === 'key' ? '🔑 Steam Key' : '📦 Crate'}</span>
              <h1 className="game-title-text">{product.product_name}</h1>
            </div>

            <div className="game-price-tag">
              €{(product.price ?? 0).toFixed(2)}
            </div>

            {product.product_genres?.length > 0 && (
              <div className="game-genres-list">
                {product.product_genres.map((gId) => (
                  <span key={gId} className="genre-pill">
                    <Layers size={12} /> {genresMap[gId] ?? gId}
                  </span>
                ))}
              </div>
            )}

            <div className="game-description-box">
              <h3>Description</h3>
              <p>{product.description || 'No description available for this game.'}</p>
            </div>

            <button 
              className="btn btn-primary add-to-cart-large" 
              onClick={handleAddToCart}
              disabled={adding}
            >
              <ShoppingCart size={20} /> {adding ? 'Adding...' : 'Add to Cart'}
            </button>

            <div className="delivery-info">
              <Info size={16} />
              <span>Instant digital delivery upon successful checkout. Check your inventory page.</span>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="reviews-section">
          <h2>
            <MessageSquare size={20} /> User Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="empty-reviews">
              <Star size={36} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
              <p>No reviews yet. Be the first to buy and share your opinion!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((rev) => (
                <div key={rev.id} className="review-card">
                  <div className="review-header">
                    <span className="reviewer-name">{rev.user_username || 'Anonymous User'}</span>
                    <div className="review-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          fill={i < rev.rating ? 'var(--cyan)' : 'none'} 
                          color={i < rev.rating ? 'var(--cyan)' : 'var(--text-muted)'} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="review-content">{rev.comment || 'No comment provided.'}</p>
                  <span className="review-date">
                    <Calendar size={12} /> {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
