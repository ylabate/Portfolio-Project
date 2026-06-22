import { Link } from "react-router-dom";

interface Props {
    product_id: string
    product_name: string
    product_thumbnail_link: string
    price?: number
    discount?: number
    rating?: number
}

function ProductCard({ product_id, product_name, product_thumbnail_link, price = 19.99, discount = 0, rating = 4.5 }: Props) {
    const finalPrice = price * (1 - discount / 100);
    const isFeatured = Math.random() > 0.7;

    return (
        <Link to={`/product/${product_id}`}>
            <div className={`group bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 cursor-pointer h-full transform hover:scale-105 ${isFeatured ? 'ring-2 ring-cyan-500' : ''}`}>
                {/* Image Container */}
                <div className="relative overflow-hidden bg-gray-950 h-40">
                    <img
                        src={product_thumbnail_link}
                        alt={product_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/200x150?text=Game')}
                    />
                    
                    {/* Discount Badge */}
                    {discount > 0 && (
                        <div className="absolute top-2 right-2 badge badge-discount">
                            -{discount}%
                        </div>
                    )}

                    {/* Featured Badge */}
                    {isFeatured && (
                        <div className="absolute top-2 left-2 badge badge-popular">
                            ⭐ En vedette
                        </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Voir détails
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="text-white font-bold text-sm line-clamp-2 mb-2 group-hover:text-cyan-400 transition">
                        {product_name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3 text-xs">
                        <span className="text-yellow-400">{'⭐'.repeat(Math.floor(rating))}</span>
                        <span className="text-gray-500">({rating})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 justify-between">
                        <div>
                            <span className="text-cyan-400 font-bold text-lg">
                                €{finalPrice.toFixed(2)}
                            </span>
                            {discount > 0 && (
                                <span className="text-gray-500 text-sm line-through ml-2">
                                    €{price.toFixed(2)}
                                </span>
                            )}
                        </div>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm transition">
                            🛒
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;