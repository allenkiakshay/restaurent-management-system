"use client";
import MainContent from "@/components/HomePage/main";
import Navbar from "@/components/HomePage/Navbar";
import React from "react";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <MainContent />
      {/* Other page content goes here */}
    </>
  );
}
