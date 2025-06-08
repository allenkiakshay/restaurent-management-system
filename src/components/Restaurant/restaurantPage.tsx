import React, { useEffect, useState } from "react";
import axios from "axios";
import RestaurentCard from "./restaurentCard";
import { useSession } from "next-auth/react";
import { generateToken } from "@/lib/jwttoken";

interface RestaurentData {
  id: number;
  name: string;
  image: string;
  address: string;
  rating: number;
  cuisine: string;
  description: string;
  pricelevel: string;
}

const RestaurentComp: React.FC = () => {
  const [restaurants, setRestaurants] = useState<RestaurentData[]>([]);
  const [loading, setLoading] = useState(true);
  const session = useSession();

  useEffect(() => {
    if (session.status === "loading") return; // Wait for session to load
    if (!session.data?.user) {
      setLoading(false);
      return;
    }
    const token = generateToken({ data: session?.data?.user }, 60);

    axios
      .get<RestaurentData[]>("/api/fetch/restaurants", {
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
        if (!res.data.formatted || res.data.formatted.length === 0) {
          setRestaurants([]);
          setLoading(false);
          return;
        }
        setRestaurants(res.data.formatted || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-xl font-semibold">Loading...</span>
      </div>
    );
  }

  if (!restaurants.length) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <img
          src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
          alt="No Restaurants"
          className="w-32 h-32 mb-6 opacity-80"
        />
        <span className="text-2xl font-bold text-gray-700 mb-2">
          No Restaurants Found
        </span>
        <p className="text-gray-500 text-center max-w-md">
          Sorry, we couldn't find any restaurant data at the moment. Please try
          again later or check your connection.
        </p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-8 bg-white rounded-xl shadow-2xl mt-12">
      <h1 className="text-3xl font-bold mb-10 text-center">Restaurants</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {restaurants.map((restaurant) => (
          <RestaurentCard key={restaurant.id} data={restaurant} />
        ))}
      </div>
    </main>
  );
};

export default RestaurentComp;
