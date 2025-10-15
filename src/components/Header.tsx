'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

const Header = () => {
  const { state } = useCart();

  return (
    <div className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Online Payment system</h1>
        <div className="flex space-x-3">
          <Link 
            href="/cart" 
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 relative"
          >
            Cart
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {state.itemCount}
            </span>
          </Link>
          <Link 
            href="/add-product" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
          >
            Add Product
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;