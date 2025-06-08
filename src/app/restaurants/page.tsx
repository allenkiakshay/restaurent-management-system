"use client";
import Navbar from "@/components/HomePage/Navbar";
import RestaurentComp from "@/components/Restaurant/restaurantPage";
import React from "react";

const RestaurantsPage = () => (
  <>
    <Navbar />
    <main>
      <RestaurentComp />
    </main>
    <footer className="text-center py-4 bg-gray-100">
      <span>
      &copy; {new Date().getFullYear()} Slooze. All rights reserved.
      </span>
    </footer>
  </>
);

export default RestaurantsPage;
