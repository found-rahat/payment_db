"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { PrismaClient } from "@prisma/client";

interface CartItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string | null;
  category: string;
  quantity: number;
}

const CheckoutPage = () => {
  const { state, dispatch } = useCart();
  const router = useRouter();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: "",
    name: "",
    address: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<string>("cash_on_delivery");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate totals
  const subtotal = state.total;
  const tax = subtotal * 0.05; // 5% tax
  const shipping = 0; // Free shipping
  const total = subtotal + tax + shipping;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!customerInfo.name) {
      newErrors.name = "Full name is required";
    }

    if (!customerInfo.address) {
      newErrors.address = "Shipping address is required";
    }

    if (!customerInfo.phone) {
      newErrors.phone = "Phone number is required";
    } else if (
      !/^\d{10,15}$/.test(customerInfo.phone.replace(/[\s\-\(\)]/g, ""))
    ) {
      newErrors.phone = "Phone number must be 10-15 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (paymentMethod === "instant_payment") {
        // For instant payment, first store the order in the database
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: customerInfo.email,
            name: customerInfo.name,
            address: customerInfo.address,
            phone: customerInfo.phone,
            paymentMethod: paymentMethod,
            cartItems: state.items,
            total: total,
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Redirect to the payment page with customer info, order ID, and total
          const queryString = new URLSearchParams({
            email: customerInfo.email,
            name: customerInfo.name,
            address: customerInfo.address,
            phone: customerInfo.phone,
            order_id: result.orderId,
            total: total.toString(),
          }).toString();
          
          router.push(`/payment?${queryString}`);
        } else {
          console.error("Failed to create order:", result.message);
          alert("Failed to create order: " + result.message);
        }
      } else {
        // For cash on delivery, proceed directly to order placement
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: customerInfo.email,
            name: customerInfo.name,
            address: customerInfo.address,
            phone: customerInfo.phone,
            paymentMethod: paymentMethod,
            cartItems: state.items,
            total: total,
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Clear the cart after successful order placement
          dispatch({ type: "CLEAR_CART" });

          setOrderSuccess(true);
        } else {
          console.error("Failed to place order:", result.message);
          alert("Failed to place order: " + result.message);
        }
      }
    } catch (err) {
      console.error("Error processing checkout:", err);
      alert("An error occurred while processing your order. Please try again.");
    }
  };

  if (orderSuccess) {
    return (
      <div className="flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full mx-4 text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Order Placed!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you! Your order information has been collected. Your order has
            been placed successfully.
          </p>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600">Your cart is empty</p>
        <div className="mt-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-6xl mx-auto">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
            <p className="text-gray-600">
              Provide your information to complete your order
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order summary */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Order Summary
                </h2>
                <div className="border rounded-lg p-4 max-h-[500px] overflow-y-auto">
                  {state.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-16 h-16">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-md w-full h-full flex items-center justify-center">
                              <span className="text-gray-500 text-xs">
                                No Image
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-grow">
                          <h3 className="font-medium text-gray-800">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {item.category}
                          </p>
                          <p className="text-gray-900 font-bold">
                            ৳{item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900 font-bold">
                            ৳{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-black">
                        ৳{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-black">
                        ৳{shipping.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium text-black">
                        ৳{tax.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 mt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-800">Total</span>
                      <span className="font-bold text-gray-900">
                        ৳{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment form */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Contact & Shipping Information
                </h2>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border text-black ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 text-black py-2 border ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Shipping Address *
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={customerInfo.address}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-3 py-2 border text-black ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="123 Main Street, City, Country"
                    ></textarea>
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="123-456-7890"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-800 mb-3">Payment Method</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="cash_on_delivery"
                          name="paymentMethod"
                          value="cash_on_delivery"
                          checked={paymentMethod === "cash_on_delivery"}
                          onChange={() => setPaymentMethod("cash_on_delivery")}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="cash_on_delivery"
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          Cash on Delivery
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="instant_payment"
                          name="paymentMethod"
                          value="instant_payment"
                          checked={paymentMethod === "instant_payment"}
                          onChange={() => setPaymentMethod("instant_payment")}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="instant_payment"
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          Instant Payment (Online)
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full ${
                      paymentMethod === 'instant_payment' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white font-medium py-3 px-4 rounded-md transition-colors duration-300 mt-6`}
                  >
                    {paymentMethod === 'instant_payment' ? 'Continue to Payment' : 'Place Order'} - ৳{total.toFixed(2)}
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/cart"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
