import { useState, useEffect } from "react"
import api from "../api/client"
import Navbar from "../components/Navbar"

interface Product {
    product_id: string
    product_name: string
    product_thumbnail_link: string
    price?: number
}

function AdminPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        product_name: "",
        product_thumbnail_link: "",
        type: "key",
        price: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                const response = await api.get("/products")
                const mockProducts = (response.data.products || []).map((p: Product, idx: number) => ({
                    ...p,
                    price: 19.99 + (idx * 2.5)
                }))
                setProducts(mockProducts.length > 0 ? mockProducts : [
                    { product_id: "1", product_name: "The Witcher 3", product_thumbnail_link: "https://via.placeholder.com/150x100?text=Witcher3", price: 29.99 },
                    { product_id: "2", product_name: "Cyberpunk 2077", product_thumbnail_link: "https://via.placeholder.com/150x100?text=Cyberpunk", price: 49.99 },
                ])
            } catch (error) {
                console.error("Error fetching products:", error)
                setProducts([
                    { product_id: "1", product_name: "The Witcher 3", product_thumbnail_link: "https://via.placeholder.com/150x100?text=Witcher3", price: 29.99 },
                    { product_id: "2", product_name: "Cyberpunk 2077", product_thumbnail_link: "https://via.placeholder.com/150x100?text=Cyberpunk", price: 49.99 },
                ])
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    const handleDelete = async (product_id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit?")) {
            try {
                await api.delete(`/products/${product_id}`)
                setProducts(products.filter(product => product.product_id !== product_id))
            } catch (error) {
                console.error("Error deleting product:", error)
                alert("Erreur lors de la suppression")
            }
        }
    }

    const handleCreate = async () => {
        if (!formData.product_name.trim() || !formData.product_thumbnail_link.trim()) {
            alert("Veuillez remplir tous les champs")
            return
        }
        try {
            if (editingId) {
                await api.patch(`/products/${editingId}`, formData)
                setProducts(products.map(p => p.product_id === editingId ? { ...p, ...formData } : p))
            } else {
                await api.post("/products", formData)
            }
            const response = await api.get("/products")
            const mockProducts = (response.data.products || []).map((p: Product, idx: number) => ({
                ...p,
                price: 19.99 + (idx * 2.5)
            }))
            setProducts(mockProducts.length > 0 ? mockProducts : products)
            setShowForm(false)
            setEditingId(null)
            setFormData({ product_name: "", product_thumbnail_link: "", type: "key", price: 0 })
        } catch (error) {
            console.error("Error saving product:", error)
            alert("Erreur lors de la sauvegarde")
        }
    }

    const handleEdit = (product: Product) => {
        setFormData({
            product_name: product.product_name,
            product_thumbnail_link: product.product_thumbnail_link,
            type: "key",
            price: product.price || 0,
        })
        setEditingId(product.product_id)
        setShowForm(true)
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">🎮 Panel Admin</h1>
                            <p className="text-gray-400">Gérez vos produits de jeux</p>
                        </div>
                        <button
                            onClick={() => {
                                setShowForm(!showForm)
                                setEditingId(null)
                                setFormData({ product_name: "", product_thumbnail_link: "", type: "key", price: 0 })
                            }}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2 px-6 rounded-lg transition transform hover:scale-105"
                        >
                            {showForm ? "❌ Annuler" : "+ Ajouter un produit"}
                        </button>
                    </div>

                    {/* Form */}
                    {showForm && (
                        <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-cyan-500/30 fade-in">
                            <h2 className="text-2xl font-bold mb-4 text-cyan-400">{editingId ? "Modifier" : "Créer"} un produit</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Nom du produit</label>
                                    <input
                                        type="text"
                                        value={formData.product_name}
                                        onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                                        placeholder="Ex: The Witcher 3"
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Lien de l'image</label>
                                    <input
                                        type="text"
                                        value={formData.product_thumbnail_link}
                                        onChange={(e) => setFormData({ ...formData, product_thumbnail_link: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Prix (€)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        placeholder="29.99"
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 transition"
                                    >
                                        <option value="key">Clé</option>
                                        <option value="crate">Crate</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-6">
                                <button
                                    onClick={handleCreate}
                                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition"
                                >
                                    ✓ {editingId ? "Modifier" : "Créer"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gray-800 p-4 rounded-lg border border-cyan-500/30">
                            <p className="text-gray-400 text-sm">Total de produits</p>
                            <p className="text-3xl font-bold text-cyan-400">{products.length}</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg border border-cyan-500/30">
                            <p className="text-gray-400 text-sm">Valeur totale</p>
                            <p className="text-3xl font-bold text-cyan-400">€{(products.reduce((acc, p) => acc + (p.price || 0), 0)).toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg border border-cyan-500/30">
                            <p className="text-gray-400 text-sm">Prix moyen</p>
                            <p className="text-3xl font-bold text-cyan-400">€{(products.length > 0 ? (products.reduce((acc, p) => acc + (p.price || 0), 0) / products.length).toFixed(2) : 0)}</p>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-gray-800 rounded-lg border border-cyan-500/30 overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-400">Chargement...</div>
                        ) : products.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-700 bg-gray-900">
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Image</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Nom</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Prix</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-cyan-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product.product_id} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                                                <td className="px-6 py-4">
                                                    <img src={product.product_thumbnail_link} alt={product.product_name} className="w-12 h-12 rounded object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/50?text=Game')} />
                                                </td>
                                                <td className="px-6 py-4 text-sm">{product.product_name}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-cyan-400">€{product.price?.toFixed(2) || "0.00"}</td>
                                                <td className="px-6 py-4 flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1 rounded text-sm transition"
                                                    >
                                                        ✎ Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.product_id)}
                                                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-1 rounded text-sm transition"
                                                    >
                                                        🗑 Supprimer
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-400">Aucun produit pour le moment</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminPage