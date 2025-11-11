// frontend/pages/index.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

// นี่คือ Component ของการ์ดสินค้า (เราจะใช้ Tailwind)
function ProductCard({ product }) {
  return (
    <div className="border rounded-lg shadow-lg overflow-hidden">
      <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-bold">{product.name}</h3>
        <p className="text-gray-600 mt-2 truncate">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold text-green-600">${product.price}</span>
          {/* ลิงก์ไปหน้าสินค้านั้นๆ */}
          <Link href={`/product/${product.id}`}>
            <a className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              ดูรายละเอียด
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

// นี่คือหน้า Home
export default function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // ดึงข้อมูลสินค้าจาก Backend ที่เราสร้างไว้
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/products');
        setProducts(res.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center my-8">Whey Protein Store</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}