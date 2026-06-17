import { Link } from "react-router-dom";

interface Props {
    product_id: string
    product_name: string
    product_thumbnail_link: string
}

function ProductCard({ product_id, product_name, product_thumbnail_link }: Props) {
    return (
        <Link to={`/product/${product_id}`}>
            <div className="bg-gray-800 rounded-lg p-4">
                <img src={product_thumbnail_link} alt={product_name} className="w-full h-48 object-cover rounded" />
                <h3 className="text-white font-bold mt-2">{product_name}</h3>
            </div>
        </Link>
    )
}

export default ProductCard