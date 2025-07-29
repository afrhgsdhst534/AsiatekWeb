import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
    id: number;
    name: string;
    image: string;
    price: number;
    brand: string;
};

export default function CatalogPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [activeProduct, setActiveProduct] = useState<Product | null>(null);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase.from("products").select("*");
            if (error) {
                console.error("Ошибка при загрузке:", error);
            } else {
                console.log("Загруженные товары:", data);
                setProducts(data || []);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = selectedBrand
        ? products.filter((p) => p.brand === selectedBrand)
        : products;

    const brands = Array.from(new Set(products.map((p) => p.brand)));

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Каталог товаров</h1>

            {/* Фильтр */}
            <div className="mb-4">
                <button
                    onClick={() => setSelectedBrand(null)}
                    className={`mr-2 px-4 py-2 rounded ${selectedBrand === null ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                    Все
                </button>
                {brands.map((brand) => (
                    <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`mr-2 px-4 py-2 rounded ${selectedBrand === brand ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    >
                        {brand}
                    </button>
                ))}
            </div>

            {/* Сетка товаров */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.length === 0 ? (
                    <p>Нет товаров</p>
                ) : (
                    filteredProducts.map((product) => (
                        <div key={product.id} className="border rounded-xl p-4 shadow-sm bg-white">
                            <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded" />
                            <h2 className="text-lg font-semibold mt-2">{product.name}</h2>
                            <p className="text-gray-700 mt-1">{product.price} ₽</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
