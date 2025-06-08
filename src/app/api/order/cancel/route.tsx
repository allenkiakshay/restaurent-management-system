"use server";

import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { extractDataFromToken } from "@/lib/jwttoken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const token = req.headers.get("access_token");
    const body = await req.json();
    const { cartId } = body;

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

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

    const cart = await prisma.cart.findUnique({
      where: { id: cartId, status: "ORDERED" },
    });

    if (!cart) {
      return NextResponse.json(
        { success: false, error: "Cart not found or already processed" },
        { status: 404 }
      );
    }

    // Update the cart status to CANCELLED
    const updatedCart = await prisma.cart.update({
      where: { id: cartId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order cancelled successfully",
        cart: updatedCart,
      },
      { status: 200 }
    );
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
