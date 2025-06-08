"use server";

import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { extractDataFromToken } from "@/lib/jwttoken";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const access_token = request.headers.get("access_token");
    const body = await request.json();
    const { phoneNo } = body;

    if (!access_token) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 401 }
      );
    }

    const dataextracted = extractDataFromToken(access_token);

    const userId = dataextracted?.data?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in token" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "USER" || phoneNo === null) {
      const cart = await prisma.cart.findFirst({
        where: {
          status: "PENDING",
          userId: userId,
        },
      });

      if (!cart) {
        return NextResponse.json({ error: "Cart not found" }, { status: 404 });
      }

      // Update the cart status to COMPLETED
      await prisma.cart.update({
        where: { id: cart.id, userId: userId, status: "PENDING" },
        data: { status: "ORDERED" },
      });

      return NextResponse.json(
        { message: "Order Placed Sucessfully." },
        { status: 200 }
      );
    }

    const client = await prisma.user.findUnique({
      where: { phoneNumber: phoneNo },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found with the provided phone number" },
        { status: 404 }
      );
    }

    const cart = await prisma.cart.findFirst({
      where: {
        status: "PENDING",
        userId: userId,
      },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Update the cart status to COMPLETED
    await prisma.cart.update({
      where: { id: cart.id, userId: userId, status: "PENDING" },
      data: { status: "ORDERED", userId: client.id },
    });

    return NextResponse.json(
      { message: "Order Created Sucessfully." },
      { status: 200 }
    );
  } catch (e) {
    console.error("Error in add to cart route:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
