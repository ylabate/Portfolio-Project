import { useState, useEffect } from 'react';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 20 });
        if (search) params.set('search', search);
        if (sort) params.set('sort', sort);
        const { data } = await api.get(`/products?${params}`);
        setProducts(Array.isArray(data) ? data : data.products ?? []);
      } catch {
        setProducts([]);
      }
      setLoading(false);
    };
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search, sort, page]);

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <span className="hero-eyebrow">⚡ Game Key Store</span>
          <h1>
            <span className="gradient-text">Level Up</span> Your Gaming
          </h1>
          <p>Discover, buy &amp; activate thousands of game keys instantly. Best prices guaranteed.</p>
          <div className="hero-cta">
            <a href="#store" className="btn btn-primary">🎮 Explore Games</a>
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
              placeholder="🔍  Search games..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <select className="filter-select" value={sort} onChange={(e) => setSort(e.target.value)}>
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
              <div className="icon">🔍</div>
              <h3>No games found</h3>
              <p>Try a different search or filter</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          )}

          {products.length === 20 && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button className="btn btn-secondary" onClick={() => setPage((p) => p + 1)}>Load more</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
