"use server";

import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { extractDataFromToken } from "@/lib/jwttoken";

const prisma = new PrismaClient();

type CartItem = {
  id: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    price: number;
    image: string | null;
  };
};

type Cart = {
  id: string;
  restaurantId: string;
  items: CartItem[];
};

type FormattedItem = {
  id: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  restaurentId: string;
  category: string;
  cartId?: string; // Optional, can be used if needed
};

function formatCartItems(cartData: Cart[]): FormattedItem[] {
  if (!cartData || cartData.length === 0) return [];

  const items = cartData[0].items;

  return items.map((cartItem) => ({
    id: cartItem.item.id,
    name: cartItem.item.name,
    category: "Null", // Replace with real category if available
    image: cartItem.item.image,
    price: cartItem.item.price,
    quantity: cartItem.quantity,
    restaurentId: cartData[0].restaurantId,
    cartId: cartData[0].id, // Assuming you want to include the cart ID
  }));
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get("access_token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Access token is required" },
        { status: 401 }
      );
    }

    const decodedToken = extractDataFromToken(token);
    if (!decodedToken?.data?.id) {
      return NextResponse.json(
        { success: false, error: "Invalid access token" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.data.id },
      select: { id: true, name: true, role: true, country: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "MANAGER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const customer = await prisma.user.findUnique({
      where: { phoneNumber: decodedToken?.phone },
      select: { id: true, name: true, phoneNumber: true },
    });

    const cart = await prisma.cart.findMany({
      where: { userId: customer.id, status: "ORDERED" },
      select: {
        id: true,
        restaurantId: true,
        items: {
          select: {
            id: true,
            quantity: true,
            item: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
    });

    const formattedItems = formatCartItems(cart);

    return NextResponse.json({ formattedItems }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user/cart:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
