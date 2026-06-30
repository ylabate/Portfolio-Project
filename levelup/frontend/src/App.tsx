import { Routes, Route } from "react-router-dom"
import CatalogPage from "./pages/CatalogPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import AdminPage from "./pages/AdminPage"
import LoginPage from "./pages/LoginPage"
import CartPage from "./pages/CartPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cart" element={<CartPage />} />
    </Routes>
  )
}

export default App