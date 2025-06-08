"use client";
import React, { useEffect, useState } from "react";
import ItemCard from "./itemCard";
import { useSession } from "next-auth/react";
import { generateToken } from "@/lib/jwttoken";
import axios from "axios";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  restaurantName: string;
  imageUrl?: string;
}

const MenuPage = ({ menu }: { menu: string | null }) => {
  const [items, setItems] = useState<MenuItem[] | null>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();

  useEffect(() => {
    if (session.status === "loading") return; // Wait for session to load
    if (!session.data?.user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }
    const token = generateToken(
      { data: session?.data?.user, restaurantId: menu },
      60
    );

    axios
      .get<MenuItem[]>("/api/fetch/menu", {
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
        if (!res.data || res.data.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }

        setItems(res.data || []);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false), setError(e.message);
      });
  }, [session]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <span className="text-lg text-gray-700 font-medium">
          Loading menu...
        </span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-2xl font-semibold mb-2">Error</div>
        <div className="text-gray-600">{error}</div>
      </div>
    );

  if (!items || items.length === 0)
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh]">
        <svg
          className="w-24 h-24 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 48 48"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 20v-2a8 8 0 0116 0v2m-8 8v4m0 4h.01M6 20h36M10 36h28a2 2 0 002-2V22a2 2 0 00-2-2H10a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          No Items Found
        </h2>
        <p className="text-gray-500 text-center max-w-md">
          Sorry, there are currently no menu items available. Please check back
          later!
        </p>
      </section>
    );

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Menu Items
      </h2>
      <div className="flex flex-wrap gap-6 justify-center">
        {items.map((item) => (
          <ItemCard key={item.id} data={item} menu={menu} />
        ))}
      </div>
    </section>
  );
};

export default MenuPage;
