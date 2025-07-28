import { useState } from "react";

type Product = {
    id: number;
    name: string;
    image: string;
    price: number;
    brand: string;
};

const mockProducts: Product[] = [
    {
        id: 1,
        name: "Стартер Ford Focus 2",
        image: "https://via.placeholder.com/150",
        price: 4500,
        brand: "Ford",
    },
    {
        id: 2,
        name: "Генератор Toyota Camry",
        image: "https://via.placeholder.com/150",
        price: 8700,
        brand: "Toyota",
    },
    {
        id: 3,
        name: "Амортизатор BMW E60",
        image: "https://via.placeholder.com/150",
        price: 3100,
        brand: "BMW",
    },
];

export default function CatalogPage() {
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [products] = useState(mockProducts);
    const [activeProduct, setActiveProduct] = useState<Product | null>(null);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const filteredProducts = selectedBrand
        ? products.filter((p) => p.brand === selectedBrand)
        : products;

    const brands = Array.from(new Set(products.map((p) => p.brand)));

    const handleSend = async () => {
        const text = `🛒 *Новая заявка!*\n\n📦 *Товар:* ${activeProduct?.name}\n👤 *Имя:* ${name}\n📞 *Телефон:* ${phone}`;

        try {
            const response = await fetch(
                                        //Замена
                `https://api.telegram.org/bot7951084803:AAEOmkHZq9CM1VJcRb_Giu6J9gsQKCfJJ08/sendMessage`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        //Замена
                        chat_id: 1442609301,
                        text: text,
                        parse_mode: "Markdown",
                    }),
                }
            );

            const data = await response.json();
            if (data.ok) {
                alert("✅ Заявка успешно отправлена в Telegram!");
            } else {
                alert("❌ Ошибка при отправке: " + data.description);
            }
        } catch (error) {
            alert("❌ Ошибка подключения к Telegram.");
            console.error(error);
        }

        setActiveProduct(null);
        setName("");
        setPhone("");
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Каталог товаров</h1>

            <div className="mb-4">
                <button
                    onClick={() => setSelectedBrand(null)}
                    className={`mr-2 px-4 py-2 rounded ${selectedBrand === null ? "bg-blue-600 text-white" : "bg-gray-200"
                        }`}
                >
                    Все
                </button>
                {brands.map((brand) => (
                    <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`mr-2 px-4 py-2 rounded ${selectedBrand === brand
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200"
                            }`}
                    >
                        {brand}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="border rounded-xl p-4 shadow-sm bg-white"
                    >
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-40 object-cover rounded"
                        />
                        <h2 className="text-lg font-semibold mt-2">{product.name}</h2>
                        <p className="text-gray-700 mt-1">{product.price} ₽</p>
                        <button
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={() => setActiveProduct(product)}
                        >
                            Оставить заявку
                        </button>
                    </div>
                ))}
            </div>

            {/* Модалка */}
            {activeProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-bold mb-2">
                            Заявка на {activeProduct.name}
                        </h2>
                        <input
                            type="text"
                            placeholder="Ваше имя"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mb-3 p-2 border rounded"
                        />
                        <input
                            type="tel"
                            placeholder="Ваш телефон"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full mb-4 p-2 border rounded"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setActiveProduct(null)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleSend}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Отправить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
