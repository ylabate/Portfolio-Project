import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import logo from '../assets/logoSansFond.svg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (itemCount === 0) return;
    setBump(true);
    const timer = setTimeout(() => setBump(false), 300);
    return () => clearTimeout(timer);
  }, [itemCount]);

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-logo">
          <img src={logo} alt="LevelUp Logo" className="nav-logo-img" />
          LevelUp
        </Link>

        <div className="nav-links">
          <Link to="/" className={isActive('/')}>Store</Link>
          {user && <Link to="/inventory" className={isActive('/inventory')}>Inventory</Link>}
          {user && <Link to="/orders" className={isActive('/orders')}>Orders</Link>}
          {user?.is_admin && <Link to="/admin" className={isActive('/admin')}>Admin</Link>}
        </div>

        <div className="nav-actions">
          {user && (
            <Link to="/cart" className="cart-btn">
              <ShoppingCart size={18} /> Cart
              {itemCount > 0 && <span className={`cart-badge ${bump ? 'bump' : ''}`}>{itemCount}</span>}
            </Link>
          )}
          {user ? (
            <div className="user-menu">
              <div className="user-avatar">{user.username?.[0]?.toUpperCase() ?? '?'}</div>
              <span className="user-name">{user.username}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <>
              <button className="auth-btn login" onClick={() => navigate('/login')}>Login</button>
              <button className="auth-btn register" onClick={() => navigate('/register')}>Register</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
