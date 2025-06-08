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
  cartId?: string;
};

function formatCartItems(cart: Cart | null): FormattedItem[] {
  if (!cart || !cart.items || cart.items.length === 0) return [];
  return cart.items.map((cartItem) => ({
    id: cartItem.item.id,
    name: cartItem.item.name,
    category: "Null", // Replace with real category if available
    image: cartItem.item.image,
    price: cartItem.item.price,
    quantity: cartItem.quantity,
    restaurentId: cart.restaurantId,
    cartId: cart.id,
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

    const phone = decodedToken.phone;
    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number not found in token" },
        { status: 400 }
      );
    }

    // Fetch the cart for the user

    const customer = await prisma.user.findUnique({
      where: { phoneNumber: phone },
      select: { id: true },
    });

    // If you want to fetch the cart for the manager/admin themselves, use their id
    // If you want to fetch for a customer, you need to provide the customer id/phone in the request
    // Here, using the manager/admin's own cart
    const cart = await prisma.cart.findFirst({
      where: { userId: customer.id },
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
      orderBy: { updatedAt: "desc" },
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
