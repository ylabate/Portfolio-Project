import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/client";

interface Product {
    product_id: string;
    product_name: string;
    product_thumbnail_link: string;
    product_images: { id: string, link: string, alt: string }[];
}

function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data.product);
            } catch (error) {
                console.error("Error fetching product:", error);
            }
        };

        fetchProduct();
    }, [id]);

    if (!product)
        return <p className="text-white">Loading...</p>;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <h1 className="text-3xl font-bold">{product.product_name}</h1>
                <img src={product.product_thumbnail_link} alt={product.product_name} className="w-64 mt-4 rounded" />
            </div>
        </>
    )
}


export default ProductDetailPage;