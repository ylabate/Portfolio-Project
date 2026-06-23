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
      try {
        const params = new URLSearchParams({ page, limit: 20 });
        if (search) params.set('search', search);
        if (sort) params.set('sort', sort);
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
      setLoading(false);
      setLoadingMore(false);
    };
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search, sort, page]);

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
            <a href="#store" className="btn btn-secondary">View All</a>
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
              className="search-input"
              placeholder="Search games..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <select className="filter-select" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
              <option value="">Sort: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A–Z</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <Search size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
              <h3>No games found</h3>
              <p>Try a different search or filter</p>
            </div>
          ) : (
            <div className="products-grid">
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
