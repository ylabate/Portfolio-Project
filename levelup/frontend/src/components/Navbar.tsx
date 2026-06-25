import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
    const [searchQuery, setSearchQuery] = useState("");
    const [cartCount, setCartCount] = useState(0);
    const [showCart, setShowCart] = useState(false);
    const [token, setToken] = useState(localStorage.getItem("access_token"))

    return (
        <nav className="bg-gradient-to-r from-gray-950 to-gray-900 text-white p-4 border-b border-cyan-500 sticky top-0 z-50 shadow-lg shadow-cyan-500/20">
            <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent hover:from-cyan-300 hover:to-blue-400 transition">
                    ◆ LevelUp
                </Link>

                {/* Right Menu */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setShowCart(!showCart)}
                            className="relative p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition border border-cyan-500/50"
                        >
                            🛒
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        {showCart && (
                            <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-cyan-500 rounded-lg p-4 shadow-lg slide-in-left">
                                <h3 className="font-bold mb-3">Panier</h3>
                                <p className="text-gray-400 text-sm">Panier vide</p>
                            </div>
                        )}
                    </div>
                    <Link
                        to="/admin"
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-cyan-500/50 transition text-sm"
                    >
                        Admin
                    </Link>
                    {token ? (
                        <div className="flex items-center gap-2">
                            <span className="text-cyan-400 text-sm">theo2</span>
                            <button
                                onClick={() => {
                                    localStorage.removeItem("access_token")
                                    setToken(null)
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition text-sm">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;