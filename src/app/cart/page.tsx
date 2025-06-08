"use client";
import Navbar from "@/components/HomePage/Navbar";
import { generateToken } from "@/lib/jwttoken";
import axios from "axios";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

type CartItemType = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
  restaurentId: string;
};

const CartItem: React.FC<{
  item: CartItemType;
  onAddQuantity: (id: string, restaurentId: string, type: string) => void;
}> = ({ item, onAddQuantity }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
      <div className="flex items-center gap-4">
        <img
          src={item.image}
          alt={item.name}
          className="w-20 h-20 object-cover rounded-lg"
        />
        <div className="flex-1">
          <div className="font-semibold text-lg">{item.name}</div>
          <div className="text-gray-500 text-sm">{item.category}</div>
          <div className="flex items-center mt-3">
            <button
              className="border rounded px-2 py-1 text-lg"
              onClick={() =>
                onAddQuantity(item.id, item.restaurentId, "decrement")
              }
            >
              -
            </button>
            <span className="mx-4 text-lg">{item.quantity}</span>
            <button
              className="border rounded px-2 py-1 text-lg"
              onClick={() =>
                onAddQuantity(item.id, item.restaurentId, "increment")
              }
            >
              +
            </button>
          </div>
        </div>
        <div className="text-xl font-semibold">
          ₹{(item.price * item.quantity).toFixed(2)}
        </div>
        <button
          className="flex items-center text-gray-500 hover:text-red-500 ml-6"
          onClick={() => onAddQuantity(item.id, item.restaurentId, "delete")}
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a3 3 0 016 0v2"
            />
          </svg>
          Remove
        </button>
      </div>
    </div>
  );
};

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const session = useSession();
  const [CustomerPhoneNumber, setCustomerPhoneNumber] = useState<
    string | null | undefined
  >();

  useEffect(() => {
    if (session.status === "loading") return; // Wait for session to load
    if (!session.data?.user) {
      setLoading(false);
      return;
    }
    const token = generateToken({ data: session?.data?.user }, 60);

    axios
      .get<CartItemType[]>("/api/cart/fetch", {
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
        if (!res.data.formattedItems || res.data.formattedItems.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }
        setCartItems(res.data.formattedItems || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  const handleQuantityChange = async (
    id: string,
    restaurentId: string,
    type: string
  ) => {
    if (session.status === "loading") return;

    if (!session.data?.user) {
      setLoading(false);
      return;
    }

    try {
      const token = generateToken(
        {
          data: session.data.user,
        },
        60
      );

      const res = await axios.post(
        "/api/cart/add",
        { itemId: id, restaurantId: restaurentId, type: type },
        {
          headers: {
            access_token: token || "",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      if (res.status === 200) {
        window.alert(res.data.message || "Item added to cart successfully!");

        if (type === "increment") {
          setCartItems((prevItems) =>
            prevItems.map((item) =>
              item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            )
          );
        } else if (type === "decrement") {
          setCartItems((prevItems) =>
            prevItems.map((item) =>
              item.id === id
                ? {
                    ...item,
                    quantity: Math.max(item.quantity - 1, 0),
                  }
                : item
            )
          );
        } else if (type === "delete") {
          setCartItems((prevItems) =>
            prevItems.filter((item) => item.id !== id)
          );
        }
      } else {
        window.alert("Failed to add item to cart");
      }
    } catch (e: any) {
      window.alert(e.response.data.error || "Failed to add item to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (phoneNumber: string | null | undefined) => {
    if (session.status === "loading") return;
    if (!session.data?.user) {
      setLoading(false);
      return;
    }

    try {
      const token = generateToken(
        {
          data: session.data.user,
        },
        60
      );

      const res = await axios.post(
        "/api/order/create",
        { phoneNo: phoneNumber }, // Replace with actual cart ID and phone number
        {
          headers: {
            access_token: token || "",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      if (res.status === 200) {
        window.alert(res.data.message || "Order created successfully!");

        setCustomerPhoneNumber(null); // Reset phone number input
      } else {
        window.alert("Failed to create order");
        setCustomerPhoneNumber(null); // Reset phone number input
      }
    } catch (e: any) {
      window.alert(e.response.data.error || "Failed to create order");
      setCustomerPhoneNumber(null); // Reset phone number input
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <span className="text-xl font-semibold">Loading...</span>
        </div>
        <footer className="text-center py-4 bg-gray-100">
          <span>
            &copy; {new Date().getFullYear()} Slooze. All rights reserved.
          </span>
        </footer>
      </>
    );
  }

  if (!cartItems.length) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <span className="text-xl font-semibold">No items in cart</span>
        </div>
        <footer className="text-center py-4 bg-gray-100">
          <span>
            &copy; {new Date().getFullYear()} Slooze. All rights reserved.
          </span>
        </footer>
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Your Cart</h1>
        <p className="text-gray-500 mb-8">
          You have {totalQuantity} items in your cart
        </p>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onAddQuantity={handleQuantityChange}
              />
            ))}
            <button className="flex items-center px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Continue Shopping
            </button>
          </div>
          {/* Order Summary */}
          <div className="w-full lg:w-96">
            <div className="bg-yellow-50 rounded-xl p-6 mb-6 border">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="flex justify-between text-gray-700 mb-2">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-500 mb-4">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
              <hr className="mb-4" />
              <div className="flex justify-between font-semibold text-lg mb-4">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>

              {session.data?.user.role === "USER" ? (
                <button
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-white py-3 rounded-md font-semibold text-lg flex items-center justify-center"
                  onClick={() => handleCreateOrder(null)}
                >
                  Create Order
                </button>
              ) : (
                <div className="flex flex-col gap-3 text-center">
                  <button
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-white py-3 rounded-md font-semibold text-lg flex items-center justify-center"
                    onClick={() => handleCreateOrder(null)}
                  >
                    Create Order for Self
                  </button>

                  <p> OR </p>

                  <input
                    type="text"
                    placeholder="Enter Customer Phone Number"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 mr-2"
                    value={CustomerPhoneNumber || ""}
                    onChange={(e) => setCustomerPhoneNumber(e.target.value)}
                  />
                  <button
                    className="w-full bg-white border border-yellow-400 text-yellow-500 hover:bg-yellow-50 py-3 rounded-md font-semibold text-lg flex items-center justify-center"
                    onClick={(e) => handleCreateOrder(CustomerPhoneNumber)}
                  >
                    Create Order for Customer
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-3">
                By checking out, you agree to our{" "}
                <a href="#" className="underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
            <div className="bg-white border rounded-xl p-6">
              <h3 className="font-semibold mb-3">We Accept</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded text-gray-700 text-sm">
                  Visa
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded text-gray-700 text-sm">
                  Mastercard
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded text-gray-700 text-sm">
                  American Express
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded text-gray-700 text-sm">
                  PayPal
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center py-4 bg-gray-100">
        <span>
          &copy; {new Date().getFullYear()} Slooze. All rights reserved.
        </span>
      </footer>
    </div>
  );
};

export default CartPage;
