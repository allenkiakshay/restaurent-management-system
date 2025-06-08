"use server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { extractDataFromToken } from "@/lib/jwttoken";

const prisma = new PrismaClient();

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  restaurantName: string;
  imageUrl?: string;
}

function mapItemsToMenu(items: any[]): MenuItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    restaurantName: item.restaurant?.name ?? "",
    imageUrl: item.image ?? undefined,
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
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, error: "Invalid access token" },
        { status: 401 }
      );
    }

    const userId = decodedToken.data?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID not found in token" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        country: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 400 }
      );
    }

    const restaurantId = decodedToken?.restaurantId;

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: "Restaurant ID not found in token" },
        { status: 401 }
      );
    }

    const isRestaurentAvailable = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!isRestaurentAvailable) {
      return NextResponse.json(
        { success: false, error: "Restaurant not found" },
        { status: 400 }
      );
    }

    if (user.role !== "ADMIN") {
      const items = await prisma.items.findMany({
        where: {
          restaurantId: restaurantId,
          restaurant: { country: user.country },
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          image: true,
          restaurant: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!items || items.length === 0) {
        return NextResponse.json(
          { success: false, error: "No items found for this restaurant" },
          { status: 400 }
        );
      }

      return NextResponse.json(mapItemsToMenu(items), { status: 200 });
    }

    // If the user is an admin, fetch all items for the restaurant
    const items = await prisma.items.findMany({
      where: { restaurantId: restaurantId },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        restaurant: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No items found for this restaurant" },
        { status: 400 }
      );
    }

    return NextResponse.json(mapItemsToMenu(items), { status: 200 });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch items" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
