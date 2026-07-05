import { useState, useEffect, useRef } from 'react';
import { Zap, Gamepad2, Search } from 'lucide-react';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [genre, setGenre] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [genresMap, setGenresMap] = useState({});
  const loaderRef = useRef(null);

  useEffect(() => {
    api.get('/genres', { _skipToast: true }).then(({ data }) => {
      const mapping = {};
      (data.genres ?? []).forEach((g) => {
        mapping[g.id] = g.name;
      });
      setGenresMap(mapping);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      const startTime = Date.now();
      try {
        const params = new URLSearchParams({ page, limit: 20 });
        if (search) params.set('search', search);
        if (sort) params.set('sort', sort);
        if (genre) params.set('genre', genre);
        if (priceMin) params.set('price_min', priceMin);
        if (priceMax) params.set('price_max', priceMax);
        const { data } = await api.get(`/products?${params}`);
        const list = Array.isArray(data) ? data : data.products ?? [];
        if (page === 1) {
          setProducts(list);
        } else {
          setProducts((prev) => [...prev, ...list]);
        }
        setHasMore(list.length === 20);
      } catch {
        if (page === 1) setProducts([]);
      }
      const elapsed = Date.now() - startTime;
      if (page === 1 && elapsed < 300) {
        await new Promise((resolve) => setTimeout(resolve, 300 - elapsed));
      }
      setLoading(false);
      setLoadingMore(false);
    };

    if (page === 1) {
      const timer = setTimeout(fetchProducts, 300);
      return () => clearTimeout(timer);
    } else {
      fetchProducts();
    }
  }, [search, sort, genre, priceMin, priceMax, page]);

  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;

    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const totalHeight = document.documentElement.scrollHeight;
      const threshold = 600; // Trigger fetch when 600px from the bottom

      if (totalHeight - scrollPosition < threshold) {
        // Prevent double trigger during same scroll tick by checking loading states
        setPage((p) => p + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loading]);

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const sortRef = useRef(null);
  const genreRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
      if (genreRef.current && !genreRef.current.contains(event.target)) {
        setIsGenreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <span className="hero-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Zap size={12} fill="currentColor" style={{ stroke: 'none' }} /> Game Key Store
          </span>
          <h1>
            <span className="gradient-text">Level Up</span> Your Gaming
          </h1>
          <p>Discover, buy &amp; activate thousands of game keys instantly. Best prices guaranteed.</p>
          <div className="hero-cta">
              <a href="#store" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Gamepad2 size={16} /> Explore Games
              </a>
            </div>
        </div>
      </section>

      {/* Store */}
      <section className="section" id="store">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">All Games</h2>
              <p className="section-subtitle">{products.length} keys available</p>
            </div>
          </div>

          <div className="filters">
            <input
              id="search-input"
              name="search"
              className="search-input"
              placeholder="Search games..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ flex: 2, minWidth: '150px' }}
            />
            
            {/* Custom Sort Dropdown */}
            <div className="custom-dropdown" ref={sortRef}>
              <button 
                type="button"
                className="dropdown-trigger"
                onClick={() => { setIsSortOpen(!isSortOpen); setIsGenreOpen(false); }}
              >
                {sort === 'price_asc' ? 'Price: Low to High' : sort === 'price_desc' ? 'Price: High to Low' : sort === 'name' ? 'Name: A–Z' : 'Sort: Default'}
                <span className="dropdown-arrow">▼</span>
              </button>
              {isSortOpen && (
                <div className="dropdown-menu animate-fade-in">
                  <div className="dropdown-item" onClick={() => { setSort(''); setPage(1); setIsSortOpen(false); }}>Sort: Default</div>
                  <div className="dropdown-item" onClick={() => { setSort('price_asc'); setPage(1); setIsSortOpen(false); }}>Price: Low to High</div>
                  <div className="dropdown-item" onClick={() => { setSort('price_desc'); setPage(1); setIsSortOpen(false); }}>Price: High to Low</div>
                  <div className="dropdown-item" onClick={() => { setSort('name'); setPage(1); setIsSortOpen(false); }}>Name: A–Z</div>
                </div>
              )}
            </div>

            {/* Custom Genre Dropdown */}
            <div className="custom-dropdown" ref={genreRef}>
              <button 
                type="button"
                className="dropdown-trigger"
                onClick={() => { setIsGenreOpen(!isGenreOpen); setIsSortOpen(false); }}
              >
                {genre || 'All Genres'}
                <span className="dropdown-arrow">▼</span>
              </button>
              {isGenreOpen && (
                <div className="dropdown-menu animate-fade-in">
                  <div className="dropdown-item" onClick={() => { setGenre(''); setPage(1); setIsGenreOpen(false); }}>All Genres</div>
                  {Object.entries(genresMap).map(([id, name]) => (
                    <div 
                      key={id} 
                      className="dropdown-item" 
                      onClick={() => { setGenre(String(name)); setPage(1); setIsGenreOpen(false); }}
                    >
                      {String(name)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Double range slider container */}
            <div style={{ flex: 1, minWidth: '180px', maxWidth: '200px', padding: '0 8px', alignSelf: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                <span>Price:</span>
                <span style={{ color: 'var(--cyan)', fontWeight: 'bold' }}>
                  €{priceMin || 0}—{Number(priceMax || 100) >= 100 ? '99+ €' : `€${priceMax}`}
                </span>
              </div>
              <div style={{ position: 'relative', height: '5px', background: 'var(--border)', borderRadius: '3px' }}>
                <div style={{
                  position: 'absolute',
                  height: '100%',
                  left: `${(Number(priceMin || 0) / 100) * 100}%`,
                  right: `${100 - (Number(priceMax || 100) / 100) * 100}%`,
                  background: 'var(--cyan)',
                  borderRadius: '3px'
                }} />
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceMin || 0}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), Number(priceMax || 100));
                    setPriceMin(val);
                    setPage(1);
                  }}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    background: 'none',
                    pointerEvents: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    margin: 0,
                    top: '-5px',
                    left: 0
                  }}
                  className="price-range-slider-input"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceMax || 100}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), Number(priceMin || 0));
                    setPriceMax(val);
                    setPage(1);
                  }}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    background: 'none',
                    pointerEvents: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    margin: 0,
                    top: '-5px',
                    left: 0
                  }}
                  className="price-range-slider-input"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="products-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="product-card skeleton-card">
                  <div className="skeleton-thumbnail skeleton-pulse" />
                  <div className="card-body">
                    <div className="skeleton-genres">
                      <span className="skeleton-genre-badge skeleton-pulse" />
                      <span className="skeleton-genre-badge skeleton-pulse" />
                    </div>
                    <div className="skeleton-title skeleton-pulse" />
                    <div className="card-footer">
                      <span className="skeleton-price skeleton-pulse" />
                      <span className="skeleton-stock skeleton-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <Search size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
              <h3>No games found</h3>
              <p>Try a different search or filter</p>
            </div>
          ) : (
            <div className="products-grid animate-fade-in">
              {products.map((p) => (
                <ProductCard key={p.product_id} product={p} genresMap={genresMap} />
              ))}
            </div>
          )}

          {hasMore && (
            <div ref={loaderRef} style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <div className="spinner" style={{ width: 24, height: 24, margin: 0 }} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}