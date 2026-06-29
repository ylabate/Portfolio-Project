import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/client";

interface CartItem {
    id: string;
    product_id: string;
    product_name: string;
    product_thumbnail_link: string;
    price: number;
    quantity: number;
}

interface Cart {
    id: string;
    user_id: string;
    items: CartItem[];
}

function CartPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("access_token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        const fetchCart = async () => {
            try {
                const response = await api.get("/cart", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCart(response.data);
            } catch (error) {
                console.error("Erreur chargement panier:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, []);

    const handleRemove = async (product_id: string) => {
        try {
            const response = await api.delete(`/cart/items/${product_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(response.data);
        } catch (error) {
            console.error("Erreur suppression:", error);
        }
    };

    const total = cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white flex items-center justify-center">
                    <p className="text-xl text-gray-400">Chargement...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-8">🛒 Mon Panier</h1>

                    {cart?.items.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-400 mb-4">Votre panier est vide</p>
                            <button
                                onClick={() => navigate("/")}
                                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition"
                            >
                                Voir les jeux
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart?.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg border border-cyan-500/30">
                                    <img
                                        src={item.product_thumbnail_link}
                                        alt={item.product_name}
                                        className="w-24 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-bold">{item.product_name}</h3>
                                        <p className="text-cyan-400">€{item.price.toFixed(2)}</p>
                                        <p className="text-gray-400 text-sm">Quantité : {item.quantity}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(item.product_id)}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition text-sm"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            ))}

                            <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500/30 mt-8">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xl font-bold">Total</span>
                                    <span className="text-2xl font-bold text-cyan-400">€{total.toFixed(2)}</span>
                                </div>
                                <button className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg transition">
                                    Procéder au paiement
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default CartPage;