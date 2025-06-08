"use server";

import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { extractDataFromToken } from "@/lib/jwttoken";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const access_token = request.headers.get("access_token");
    const body = await request.json();
    const { itemId, restaurantId, type } = body;

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

    if (!itemId || !restaurantId || !type) {
      return NextResponse.json(
        { error: "Item ID and Restaurant ID and Type are required" },
        { status: 400 }
      );
    }

    const existingCart = await prisma.cart.findFirst({
      where: {
        userId: userId,
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingCart?.restaurantId !== restaurantId) {
      return NextResponse.json(
        { error: "Cart already exists for a different restaurant" },
        { status: 400 }
      );
    }

    const item = await prisma.items.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const cart =
      existingCart ||
      (await prisma.cart.create({
        data: {
          userId: userId,
          restaurantId: restaurantId,
          status: "PENDING",
          totalPrice: item.price, // Initialize total price to 0
        },
      }));

    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        itemId: item.id,
      },
    });

    if (existingCartItem) {
      if (type === "increment") {
        // If the item already exists in the cart, update the quantity and price
        await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: existingCartItem.quantity + 1, // Increment quantity
            price: existingCartItem.price + item.price, // Update price if needed
          },
        });

        await prisma.cart.update({
          where: { id: cart.id },
          data: {
            totalPrice: {
              increment: item.price, // Increment total price by item's price
            },
          },
        });

        return NextResponse.json(
          { message: "Item quantity updated in cart" },
          { status: 200 }
        );
      } else if (type === "decrement") {
        await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: existingCartItem.quantity - 1, // Increment quantity
            price: existingCartItem.price - item.price, // Update price if needed
          },
        });

        await prisma.cart.update({
          where: { id: cart.id },
          data: {
            totalPrice: {
              decrement: item.price, // Increment total price by item's price
            },
          },
        });

        if (existingCartItem.quantity <= 1) {
          // If quantity is 0 or less, remove the item from the cart
          await prisma.cartItem.delete({
            where: { id: existingCartItem.id },
          });

          await prisma.cart.update({
            where: { id: cart.id },
            data: {
              totalPrice: {
                decrement: existingCartItem.price, // Decrement total price by item's price
              },
            },
          });

          return NextResponse.json(
            { message: "Item removed from cart" },
            { status: 200 }
          );
        }
        return NextResponse.json(
          { message: "Item quantity decremented in cart" },
          { status: 200 }
        );
      } else if (type === "delete") {
        await prisma.cartItem.delete({
          where: { id: existingCartItem.id },
        });

        await prisma.cart.update({
          where: { id: cart.id },
          data: {
            totalPrice: {
              decrement: existingCartItem.price, // Decrement total price by item's price
            },
          },
        });

        return NextResponse.json(
          { message: "Item removed from cart" },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: "Invalid type. Use 'increment' or 'decrement' or 'delete." },
          { status: 400 }
        );
      }
    }

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        itemId: item.id,
        quantity: 1, // Default quantity to 1
        price: item.price, // Store the item's price
      },
    });

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        totalPrice: {
          increment: item.price, // Increment total price by item's price
        },
      },
    });

    return NextResponse.json(
      { message: "Item added to cart" },
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
