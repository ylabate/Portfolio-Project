import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import Navbar from "../components/Navbar";

function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleLogin = async () => {
        try {
            const response = await api.post("/auth/login", { email, password })
            localStorage.setItem("access_token", response.data.access_token)
            navigate("/")
        } catch (err) {
            setError("Invalid email or password")
        }
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
                    <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <div className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="bg-gray-700 p-3 rounded text-white"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="bg-gray-700 p-3 rounded text-white"
                        />
                        <button
                            onClick={handleLogin}
                            className="bg-blue-600 hover:bg-blue-500 p-3 rounded font-bold"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginPage
