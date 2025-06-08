"use server";

import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { extractDataFromToken } from "@/lib/jwttoken";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const access_token = request.headers.get("access_token");
    const body = await request.json();
    const { cartId, payment_method } = body;

    if (!cartId) {
      return NextResponse.json(
        { error: "Cart ID is required" },
        { status: 400 }
      );
    }

    if (!payment_method) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    if (!access_token) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    const dataextracted = extractDataFromToken(access_token);

    const userId = dataextracted?.data?.id;
    const phone = dataextracted?.phone;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in token" },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number not found in token" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const customer = await prisma.user.findUnique({
      where: { phoneNumber: phone },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: {
        id: cartId,
        status: "COMPLETED",
      },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found or not in COMPLETED status" },
        { status: 404 }
      );
    }

    if (cart.userId !== customer.id) {
      return NextResponse.json(
        { error: "Cart does not belong to the specified customer" },
        { status: 403 }
      );
    }

    await prisma.cart.update({
      where: { id: cartId },
      data: {
        paymentMethod: payment_method,
      },
    });

    return NextResponse.json(
      { message: "Payment modified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in payment route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
