import { useState } from "react";
import { Link } from "react-router-dom";

function parseJwtPayload(token: string) {
    try {
        const payload = token.split(".")[1]
        if (!payload) {
            return null
        }

        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
        const json = atob(base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "="))
        return JSON.parse(json) as { is_admin?: boolean }
    } catch {
        return null
    }
}

function Navbar() {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token")
    const isAdmin = Boolean(token && parseJwtPayload(token)?.is_admin)
    const [currentToken, setCurrentToken] = useState(token)

    return (
        <nav className="bg-gradient-to-r from-gray-950 to-gray-900 text-white p-4 border-b border-cyan-500 sticky top-0 z-50 shadow-lg shadow-cyan-500/20">
            <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent hover:from-cyan-300 hover:to-blue-400 transition">
                    ◆ LevelUp
                </Link>

                {/* Right Menu */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/cart"
                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition border border-cyan-500/50"
                    >
                        🛒
                    </Link>
                    {isAdmin && (
                        <Link
                            to="/admin"
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-cyan-500/50 transition text-sm"
                        >
                            Admin
                        </Link>
                    )}
                    {currentToken ? (
                        <div className="flex items-center gap-2">
                            <span className="text-cyan-400 text-sm">theo2</span>
                            <button
                                onClick={() => {
                                    localStorage.removeItem("access_token")
                                    localStorage.removeItem("token")
                                    localStorage.removeItem("refresh_token")
                                    localStorage.removeItem("user")
                                    setCurrentToken(null)
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