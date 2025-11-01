"use client";

import { createPayPosPayment, getCustomerByOrderId } from "./action";
import React, { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Inner component that uses client-side hooks
function PaymentPageContent() {
  const { state } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("order_id");
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!orderId) return;
      const customer = await getCustomerByOrderId(Number(orderId));
      if (customer) setCustomerInfo(customer);
    };
    fetchCustomer();
  }, [orderId]);

  if (!customerInfo) {
    return <div className="p-6 text-center">Loading customer info...</div>;
  }

  const subtotal = state.total;
  const tax = subtotal * 0.05;
  const shipping = 0;
  const total = subtotal + tax + shipping;

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600">Your cart is empty</p>
        <div className="mt-6">
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-6xl mx-auto">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">
              Payment Details
            </h1>
            <p className="text-gray-600">
              Review your order and complete the payment
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

              {/* Customer and Payment Info */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Customer Information
                </h2>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Full Name
                    </p>
                    <p className="text-gray-900">{customerInfo.name}</p>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-900">{customerInfo.email}</p>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-gray-900">{customerInfo.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Address</p>
                    <p className="text-gray-900">{customerInfo.address}</p>
                  </div>
                </div>

                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Payment Information
                </h2>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Payment Method
                      </p>
                      <p className="text-gray-900 font-medium">
                        Instant Payment (Online)
                      </p>
                      {orderId && (
                        <p className="text-sm text-gray-600">
                          Order ID: {orderId}
                        </p>
                      )}
                    </div>
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                      Pending Payment
                    </div>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    try {
                      const resPayPosUrl = await createPayPosPayment(
                        customerInfo.id,
                        total,
                        window.location.host,
                        window.location.protocol
                      );
                      if (resPayPosUrl) window.open(resPayPosUrl, "_blank");
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-300"
                >
                  Pay Now - ৳{total.toFixed(2)}
                </button>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => router.back()}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ← Back to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component with suspense boundary
export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading payment details...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
