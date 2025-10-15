"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface CartItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string | null;
  category: string;
  quantity: number;
}

const CartPage = () => {
  const { state, dispatch } = useCart();

  // Calculate total price
  const subtotal = state.total;
  const tax = subtotal * 0.05; // 5% tax
  const shipping = 0; // Free shipping
  const total = subtotal + tax + shipping;

  // Update item quantity
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return; // Don't allow quantities less than 1
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  // Remove item from cart
  const removeItem = (id: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Your Shopping Cart
        </h1>

        {state.items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {state.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-6 flex flex-col sm:flex-row"
                    >
                      <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-md w-24 h-24 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">
                              No Image
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {item.name}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {item.category}
                            </p>
                            <p className="text-gray-900 font-bold mt-1">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>

                          <div className="mt-4 md:mt-0 flex items-center">
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md"
                              >
                                -
                              </button>
                              <span className="px-3 py-1 text-gray-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="ml-4 text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="text-gray-600 text-sm">
                            Subtotal: ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-800"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-black">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-black">
                      ৳{shipping.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-black">
                      ৳{tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="font-bold text-gray-900">
                      ৳{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-300 block text-center"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/"
                  className="w-full mt-3 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-md transition-colors duration-300 block"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
