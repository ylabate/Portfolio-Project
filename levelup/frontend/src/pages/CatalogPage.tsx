import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { useEffect, useState } from "react";
import api from "../api/client";

interface Product {
    product_id: string;
    product_name: string;
    product_thumbnail_link: string;
    price?: number;
    discount_percent?: number;
    initial_price?: number;
    rating?: number;
}

function CatalogPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState("all");
    const [sortBy, setSortBy] = useState("popular");
    const [searchQuery, setSearchQuery] = useState("");
    const [genres, setGenres] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await api.get("/genres")
                setGenres(response.data.genres)
            } catch (error) {
                console.error("Error fetching genres:", error)
            }
        }
        fetchGenres()
    }, [])

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                const params: any = {}
                if (selectedGenre !== "all") params.genre = selectedGenre
                if (searchQuery) params.search = searchQuery
                if (sortBy === "priceLow") params.sort = "price_asc"
                if (sortBy === "priceHigh") params.sort = "price_desc"
                if (sortBy === "name") params.sort = "name"
                const response = await api.get("/products", { params })
                setProducts(response.data.products || [])
                setFilteredProducts(response.data.products || [])
            } catch (error) {
                console.error("Error fetching products:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [selectedGenre, searchQuery, sortBy])


    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8 text-center">
                    <h1 className="text-4xl font-bold mb-2">Bienvenue sur LevelUp 🎮</h1>
                    <p className="text-lg opacity-90">Les meilleurs jeux au meilleur prix</p>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Filters Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Chercher</label>
                            <input
                                type="text"
                                placeholder="Nom du jeu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/50 rounded-lg focus:outline-none focus:border-cyan-300 transition"
                            />
                        </div>

                        {/* Genre Filter */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Genre</label>
                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/50 rounded-lg focus:outline-none focus:border-cyan-300 transition"
                            >
                                <option value="all">Tous les genres</option>
                                {genres.map((genre) => (
                                    <option key={genre.id} value={genre.name}>
                                        {genre.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                            

                        {/* Sort */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">Trier par</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/50 rounded-lg focus:outline-none focus:border-cyan-300 transition"
                            >
                                <option value="popular">Populaire</option>
                                <option value="priceLow">Prix bas</option>
                                <option value="priceHigh">Prix haut</option>
                                <option value="discount">Réductions</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Counter */}
                    <div className="mb-4 text-sm text-gray-400">
                        {filteredProducts.length} jeu{filteredProducts.length !== 1 ? "x" : ""} trouvé{filteredProducts.length !== 1 ? "s" : ""}
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center h-96">
                            <p className="text-xl text-gray-400">Chargement des jeux...</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts.map((product: any) => (
                                <ProductCard
                                    key={product.product_id}
                                    product_id={product.product_id}
                                    product_name={product.product_name}
                                    product_thumbnail_link={product.product_thumbnail_link}
                                    price={product.price}
                                    discount_percent={product.discount_percent}
                                    initial_price={product.initial_price}
                                    rating={product.rating}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-400">Aucun jeu trouvé</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default CatalogPage;