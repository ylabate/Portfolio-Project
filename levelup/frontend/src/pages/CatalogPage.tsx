import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { useEffect, useState } from "react";
import api from "../api/client";

interface Product {
    product_id: string;
    product_name: string;
    product_thumbnail_link: string;
}

function CatalogPage() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get("/products");
                setProducts(response.data.products);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <h1 className="text-3xl font-bold">Catalog Page</h1>
                <div className="grid grid-cols-4 gap-4 mt-8">
                    {products.map((product) => (
                        <ProductCard
                            key={product.product_id}
                            product_name={product.product_name}
                            product_thumbnail_link={product.product_thumbnail_link}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

export default CatalogPage;