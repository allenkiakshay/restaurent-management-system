'use server';
import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { extractDataFromToken } from "@/lib/jwttoken";

const prisma = new PrismaClient();

function formatRestaurants(restaurants: any[]) {
    return restaurants.map((r) => ({
        id: r.id,
        name: r.name,
        address: r.location,
        cuisine: r.cuisine,
        rating: r.rating,
        image: r.image,
        pricelevel: r.priceLevel
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

        const user = await prisma.user.findUnique({
            where: { id: decodedToken?.data?.id },
            select: { id: true, name: true, role: true, country: true },
        });

        let restaurants;
        if (user?.role === "ADMIN") {
            restaurants = await prisma.restaurant.findMany({
                select: {
                    id: true,
                    name: true,
                    location: true,
                    cuisine: true,
                    rating: true,
                    image: true,
                    priceLevel:true
                },
            });
        } else {
            restaurants = await prisma.restaurant.findMany({
                where: { country: user?.country },
                select: {
                    id: true,
                    name: true,
                    location: true,
                    cuisine: true,
                    rating: true,
                    image: true,
                    priceLevel:true
                },
            });
        }

        return NextResponse.json({ formatted: formatRestaurants(restaurants) });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Failed to fetch restaurants" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
