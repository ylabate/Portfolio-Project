import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);

  const fetchCart = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch {
      setCart(null);
    }
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/items', { product_id: productId, quantity });
    setCart(data);
    return data;
  };

  const removeFromCart = async (productId, quantity = null) => {
    const params = quantity ? `?quantity=${quantity}` : '';
    const { data } = await api.delete(`/cart/items/${productId}${params}`);
    setCart(data);
    return data;
  };

  const checkout = async () => {
    const { data } = await api.post('/cart/checkout');
    return data;
  };

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, addToCart, removeFromCart, checkout, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
