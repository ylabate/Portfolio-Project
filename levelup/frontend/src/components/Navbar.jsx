import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-logo">
          <span className="nav-logo-icon">⚡</span>
          LevelUp
        </Link>

        <div className="nav-links">
          <Link to="/" className={isActive('/')}>Store</Link>
          {user && <Link to="/inventory" className={isActive('/inventory')}>Inventory</Link>}
          {user && <Link to="/orders" className={isActive('/orders')}>Orders</Link>}
        </div>

        <div className="nav-actions">
          {user && (
            <Link to="/cart" className="cart-btn">
              🛒 Cart
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          )}
          {user ? (
            <div className="user-menu">
              <div className="user-avatar">{user.username[0].toUpperCase()}</div>
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
