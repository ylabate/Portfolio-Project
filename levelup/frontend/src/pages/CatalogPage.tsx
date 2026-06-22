import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { useEffect, useState } from "react";
import api from "../api/client";

interface Product {
    product_id: string;
    product_name: string;
    product_thumbnail_link: string;
    price?: number;
}

function CatalogPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState("all");
    const [sortBy, setSortBy] = useState("popular");
    const [searchQuery, setSearchQuery] = useState("");

    const genres = ["all", "Action", "RPG", "Strategy", "Sports", "Indie", "Simulation"];

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await api.get("/products");
                // Mock data with prices and discounts
                const mockProducts = (response.data.products || []).map((p: Product, idx: number) => ({
                    ...p,
                    price: 9.99 + (idx * 2.5),
                    discount: Math.random() > 0.6 ? Math.floor(Math.random() * 50) : 0,
                    genre: genres[Math.floor(Math.random() * (genres.length - 1)) + 1],
                }));
                setProducts(mockProducts);
                setFilteredProducts(mockProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
                // Mock data for testing
                const mockData = [
                    { product_id: "1", product_name: "The Witcher 3", product_thumbnail_link: "https://via.placeholder.com/200x150?text=Witcher3", price: 29.99, discount: 30, genre: "RPG" },
                    { product_id: "2", product_name: "Cyberpunk 2077", product_thumbnail_link: "https://via.placeholder.com/200x150?text=Cyberpunk", price: 49.99, discount: 50, genre: "Action" },
                    { product_id: "3", product_name: "Elden Ring", product_thumbnail_link: "https://via.placeholder.com/200x150?text=EldenRing", price: 39.99, discount: 20, genre: "RPG" },
                    { product_id: "4", product_name: "Starfield", product_thumbnail_link: "https://via.placeholder.com/200x150?text=Starfield", price: 69.99, discount: 0, genre: "Action" },
                    { product_id: "5", product_name: "Baldur's Gate 3", product_thumbnail_link: "https://via.placeholder.com/200x150?text=BG3", price: 59.99, discount: 15, genre: "RPG" },
                    { product_id: "6", product_name: "Total War: Warhammer", product_thumbnail_link: "https://via.placeholder.com/200x150?text=TotalWar", price: 44.99, discount: 25, genre: "Strategy" },
                    { product_id: "7", product_name: "Hogwarts Legacy", product_thumbnail_link: "https://via.placeholder.com/200x150?text=Hogwarts", price: 34.99, discount: 40, genre: "RPG" },
                    { product_id: "8", product_name: "Palworld", product_thumbnail_link: "https://via.placeholder.com/200x150?text=Palworld", price: 29.99, discount: 10, genre: "Indie" },
                ];
                setProducts(mockData);
                setFilteredProducts(mockData);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Filter and sort products
    useEffect(() => {
        let result = [...products];

        // Genre filter
        if (selectedGenre !== "all") {
            result = result.filter((p: any) => p.genre === selectedGenre);
        }

        // Search filter
        if (searchQuery) {
            result = result.filter((p) =>
                p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sorting
        switch (sortBy) {
            case "priceLow":
                result.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
                break;
            case "priceHigh":
                result.sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
                break;
            case "discount":
                result.sort((a: any, b: any) => (b.discount || 0) - (a.discount || 0));
                break;
            default:
                // popular (default order)
                break;
        }

        setFilteredProducts(result);
    }, [products, selectedGenre, sortBy, searchQuery]);

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
                                {genres.map((genre) => (
                                    <option key={genre} value={genre}>
                                        {genre === "all" ? "Tous les genres" : genre}
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
                                    discount={product.discount}
                                    rating={3.5 + Math.random() * 1.5}
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