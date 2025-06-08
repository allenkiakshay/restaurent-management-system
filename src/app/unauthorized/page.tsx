"use client";
import Navbar from "@/components/HomePage/Navbar";
import React from "react";

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center text-center px-4">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-red-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 9l6 6m0-6l-6 6"
            />
          </svg>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Unauthorized
          </h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to access this page.
            <br />
            Please login with the appropriate credentials.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Go Home
          </a>
        </div>
      </main>
      <footer className="bg-gray-100 text-gray-500 text-center py-4 mt-8 border-t">
        &copy; {new Date().getFullYear()} Slooze. All rights reserved.
      </footer>
    </div>
  );
};

export default UnauthorizedPage;
