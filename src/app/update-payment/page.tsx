"use client";
import React, { useState } from "react";
import axios from "axios";
import Navbar from "@/components/HomePage/Navbar";
import { generateToken } from "@/lib/jwttoken";
import { useSession } from "next-auth/react";

// Define the CartItemType
type CartItemType = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
  restaurentId: string;
  cartId?: string;
};

export default function CheckoutPage() {
  const session = useSession();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  const [proceedPayment, setProceedPayment] = useState(false);

  const fetchCartItems = async () => {
    if (session.status === "loading") return;
    if (!session.data?.user) {
      setLoading(false);
      return;
    }
    const token = generateToken({ data: session?.data?.user, phone }, 60);

    axios
      .get<{ formattedItems: CartItemType[] }>("/api/order/fetch/latest", {
        headers: {
          access_token: token || "",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
          "X-Requested-With": "XMLHttpRequest",
        },
      })
      .then((res) => {
        setCartItems(res.data.formattedItems || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleUpdatePayment = (method: "UPI" | "CASH" | "CARD" | "WALLET") => {
    setProceedPayment(false);
    if (cartItems.length === 0) {
      alert("No items in cart to proceed with payment.");
      return;
    }

    const cartId = cartItems[0].cartId;
    if (!cartId) {
      alert("Cart ID not found.");
      return;
    }

    setLoading(true);
    if (session.status === "loading") return;
    if (!session.data?.user) {
      setLoading(false);
      return;
    }

    const token = generateToken({ data: session?.data?.user, phone }, 60);
    axios
      .post(
        "/api/order/payment/modify",
        { cartId, payment_method: method },
        {
          headers: {
            access_token: token || "",
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        setCartItems([]);
        setShowSummary(false);
        alert("Payment Updated successful!");
      })
      .catch((error) => {
        console.error("Payment error:", error);
        alert("Failed to Update the payment. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  const handleShowSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length < 10) {
      alert("Please enter a valid phone number.");
      return;
    }
    setShowSummary(true);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-purple-700 mb-8">
            Checkout
          </h2>
          {!showSummary ? (
            <form onSubmit={handleShowSummary}>
              <div className="mb-6">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                  required
                  minLength={10}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
                onClick={() => fetchCartItems()}
              >
                Show Order Summary
              </button>
            </form>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold">{phone}</span>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Order Summary
                </h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <svg
                      className="animate-spin h-6 w-6 text-purple-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                  </div>
                ) : cartItems.length === 0 ? (
                  <p className="text-gray-500 text-center">No items in cart.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item.id} className="flex items-center py-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover mr-4 border"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.category}
                          </div>
                          <div className="text-xs text-gray-400">
                            x{item.quantity}
                          </div>
                        </div>
                        <div className="font-bold text-purple-700 ml-2">
                          ₹{item.price * item.quantity}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {!loading && cartItems.length > 0 && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <span className="font-semibold text-lg text-gray-700">
                      Total
                    </span>
                    <span className="font-bold text-xl text-purple-700">
                      ₹{total}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setProceedPayment(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  Update Payment Method
                </button>
                <button
                  onClick={() => setShowSummary(false)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition mt-2"
                >
                  Change Phone Number
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {proceedPayment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm relative">
            <h3 className="text-xl font-bold mb-6 text-purple-700 text-center">
              Select Payment Method
            </h3>
            <div className="flex flex-col gap-4">
              <button
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition"
                onClick={() => {
                  handleUpdatePayment("UPI");
                }}
              >
                UPI
              </button>
              <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
                onClick={() => {
                  handleUpdatePayment("CARD");
                }}
              >
                Credit / Debit Card
              </button>
              <button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition"
                onClick={() => {
                  handleUpdatePayment("CASH");
                }}
              >
                Cash
              </button>
              <button
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition"
                onClick={() => {
                  handleUpdatePayment("WALLET");
                }}
              >
                Wallet
              </button>
            </div>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setProceedPayment(false)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      <footer className="text-center py-4 bg-gray-100">
        <span>
          &copy; {new Date().getFullYear()} Slooze. All rights reserved.
        </span>
      </footer>
    </>
  );
}
