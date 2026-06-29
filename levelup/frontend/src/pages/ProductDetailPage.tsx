import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/client";

interface Product {
    product_id: string;
    product_name: string;
    product_thumbnail_link: string;
    product_images?: { id: string, link: string, alt: string }[];
    price?: number;
    discount?: number;
    rating?: number;
    description?: string;
    metadata?: {
        steam_appid?: number;
        initial_price?: number;
        discount_percent?: number;
        pc_requirements_min?: string;
        pc_requirements_rec?: string;
    };
}

function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data.product);
            } catch (error) {
                console.error("Error fetching product:", error);
                // Mock data for testing
                const mockProduct: Product = {
                    product_id: id || "1",
                    product_name: "The Witcher 3: Wild Hunt",
                    product_thumbnail_link: "https://via.placeholder.com/400x300?text=Witcher3",
                    price: 29.99,
                    discount: 30,
                    rating: 4.8,
                    description: "Entrez dans la peau de Geralt de Rivia, un tueur de monstres professionnel, et naviguez à travers les mondes merveilleux mais dangereux de The Witcher.",
                    product_images: [
                        { id: "1", link: "https://via.placeholder.com/400x300?text=Witcher3_1", alt: "Screenshot 1" },
                        { id: "2", link: "https://via.placeholder.com/400x300?text=Witcher3_2", alt: "Screenshot 2" },
                        { id: "3", link: "https://via.placeholder.com/400x300?text=Witcher3_3", alt: "Screenshot 3" },
                    ]
                };
                setProduct(mockProduct);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

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

    if (!product) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white flex items-center justify-center">
                    <p className="text-xl text-gray-400">Produit non trouvé</p>
                </div>
            </>
        );
    }

    const finalPrice = (product.price || 0) * (1 - (product.discount || 0) / 100);
    const renderStars = (rating: number) => {
        const ratingOn5 = rating / 2
        const fullStars = Math.floor(ratingOn5)
        const halfStar = ratingOn5 % 1 >= 0.5
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)
        return (
            <span className="text-yellow-400">
                {'★'.repeat(fullStars)}
                {halfStar ? '½' : ''}
                {'☆'.repeat(emptyStars)}
            </span>
        )
    }
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <button
                        onClick={() => navigate(-1)}
                        className="text-cyan-400 hover:text-cyan-300 mb-4 transition"
                    >
                        ← Retour
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        {/* Images */}
                        <div>
                            <div className="bg-gray-800 rounded-lg overflow-hidden mb-4 h-96 border border-cyan-500/30">
                                <img
                                    src={product.product_images?.[selectedImage]?.link || product.product_thumbnail_link}
                                    alt={product.product_name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Game')}
                                />
                            </div>
                            {product.product_images && product.product_images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {product.product_images.map((img, idx) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`border-2 rounded-lg overflow-hidden transition ${selectedImage === idx ? 'border-cyan-500' : 'border-gray-600 hover:border-cyan-500'
                                                }`}
                                        >
                                            <img src={img.link} alt={img.alt} className="w-full h-20 object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{product.product_name}</h1>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                {product.rating ? renderStars(product.rating) : <span className="text-gray-400">No ratings yet</span>}
                                {product.rating && <span className="text-gray-400">({product.rating}/10)</span>}
                            </div>

                            {/* Price */}
                            <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-cyan-500/30">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl font-bold text-cyan-400">
                                        €{product.price?.toFixed(2)}
                                    </div>
                                    {product.metadata?.discount_percent && product.metadata.discount_percent > 0 && (
                                        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                                            -{product.metadata.discount_percent}%
                                        </span>
                                    )}
                                </div>
                                {product.metadata?.initial_price && product.metadata.initial_price > (product.price || 0) && (
                                    <div className="text-gray-500 line-through mt-1">
                                        €{product.metadata.initial_price.toFixed(2)}
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-gray-300 mb-6 leading-relaxed">
                                {product.description || "Un jeu incroyable à découvrir. Plongez dans une expérience de jeu inoubliable avec une histoire captivante et un gameplay enrichissant."}
                            </p>

                            {/* Quantity and Add to Cart */}
                            <div className="flex gap-4 mb-6">
                                <div className="flex items-center border border-cyan-500 rounded-lg bg-gray-800">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-4 py-2 hover:bg-gray-700 transition"
                                    >
                                        −
                                    </button>
                                    <span className="px-4 py-2 font-bold text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="px-4 py-2 hover:bg-gray-700 transition"
                                    >
                                        +
                                    </button>
                                </div>
                                <button className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 rounded-lg transition transform hover:scale-105">
                                    🛒 Ajouter au panier
                                </button>
                            </div>

                            {/* Additional Info */}
                            <div className="space-y-3 border-t border-gray-700 pt-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Format:</span>
                                    <span className="font-semibold">Clé Steam</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Région:</span>
                                    <span className="font-semibold">Mondial</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Plateforme:</span>
                                    <span className="font-semibold">PC</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Livraison:</span>
                                    <span className="font-semibold text-green-400">Instantanée</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Requirements */}
                    {product.metadata?.pc_requirements_min && (
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500/30">
                                <h3 className="text-xl font-bold mb-4 text-cyan-400">Configuration minimale</h3>
                                <div
                                    className="text-sm text-gray-300"
                                    dangerouslySetInnerHTML={{ __html: product.metadata.pc_requirements_min }}
                                />
                            </div>
                            {product.metadata?.pc_requirements_rec && (
                                <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500/30">
                                    <h3 className="text-xl font-bold mb-4 text-cyan-400">Configuration recommandée</h3>
                                    <div
                                        className="text-sm text-gray-300"
                                        dangerouslySetInnerHTML={{ __html: product.metadata.pc_requirements_rec }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ProductDetailPage;