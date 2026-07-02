import { useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { getProductThumbnail } from '../utils/assets';

export default function ProductCard({ product, genresMap = {} }) {
  const navigate = useNavigate();

  const thumbnail = getProductThumbnail(product);
  const genres = product.product_genres || [];

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product.product_id}`)}>
      {thumbnail ? (
        <img 
          className="card-thumbnail" 
          src={thumbnail} 
          alt={product.product_name} 
          onError={(e) => { 
            if (product.steam_appid && product.product_thumbnail_link && e.target.src !== product.product_thumbnail_link) {
              e.target.src = product.product_thumbnail_link;
            } else {
              e.target.style.display = 'none';
            }
          }} 
        />
      ) : (
        <div className="card-thumbnail-placeholder">
          <Gamepad2 size={40} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
      <div className="card-body">
        {genres.length > 0 && (
          <div className="card-genres">
            {genres.slice(0, 2).map((g) => (
              <span key={g} className="genre-badge">{genresMap[g] ?? g}</span>
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
          <span className={`card-stock-badge ${product.stock === 0 ? 'out-of-stock' : 'in-stock'}`}>
            {product.stock === 0 ? 'Rupture' : product.stock > 9 ? 'En stock' : `${product.stock} en stock`}
          </span>
        </div>
      </div>
    </div>
  );
}
