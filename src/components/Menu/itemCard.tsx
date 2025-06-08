import { generateToken } from "@/lib/jwttoken";
import axios from "axios";
import { useSession } from "next-auth/react";
import React from "react";

interface ItemProps {
  id: string;
  name: string;
  description: string;
  price: number;
  restaurantName: string;
  imageUrl?: string;
}

interface ItemCardProps {
  data: ItemProps;
  menu: string | null;
}

const ItemCard: React.FC<ItemCardProps> = ({ data, menu }) => {
  const session = useSession();
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleAddToCart = async (id: string) => {
    if (session.status === "loading") return;

    if (!session.data?.user) {
      setLoading(false);
      return;
    }

    setLoading(true); // Start loading when the call begins

    try {
      const token = generateToken(
        {
          data: session.data.user,
        },
        60
      );

      const res = await axios.post(
        "/api/cart/add",
        { itemId: id, restaurantId: menu, type: "increment" }, // ✅ POST body
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
      } else {
        window.alert("Failed to add item to cart");
      }
    } catch (e: any) {
      window.alert(e.response.data.error || "Failed to add item to cart");
    } finally {
      setLoading(false);
    }
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-gray-500 text-center">
        <p>No item data available</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-3 max-w-xs w-full shadow bg-white mx-auto my-4 transition hover:shadow-lg">
      {data.imageUrl && (
        <div className="w-full h-32 mb-2 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
          <img
            src={data.imageUrl}
            alt={data.name}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          />
        </div>
      )}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-bold text-gray-800">{data.name}</h2>
        <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium">
          {data.restaurantName}
        </span>
      </div>
      <p className="text-gray-600 mb-2 text-sm min-h-[32px]">
        {data.description}
      </p>
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-base text-teal-700">
          ₹{data.price.toFixed(2)}
        </span>
      </div>
      {loading ? (
        <div className="flex justify-center mb-2">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <button
          onClick={() => handleAddToCart(data.id)}
          className="w-full py-2 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-md font-semibold text-sm shadow hover:from-teal-600 hover:to-teal-800 transition"
        >
          Add to Cart
        </button>
      )}
    </div>
  );
};

export default ItemCard;
