"use client";
import Navbar from "@/components/HomePage/Navbar";
import { generateToken } from "@/lib/jwttoken";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

type Profile = {
  name: string;
  email: string;
  role: string;
  country: string;
  phoneNumber: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const session = useSession();

  useEffect(() => {
    const token = generateToken({ data: session?.data?.user }, 60);

    fetch("/api/fetch/profile", {
      headers: {
        access_token: token || "",
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
        "X-Requested-With": "XMLHttpRequest",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.user || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-xl mx-auto mt-10 bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-blue-700">Profile</h2>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : profile ? (
          <div className="space-y-5">
            <ProfileField label="Name" value={profile.name} />
            <ProfileField label="Email" value={profile.email} />
            <ProfileField label="Role" value={profile.role} />
            <ProfileField label="Country" value={profile.country} />
            <ProfileField label="Phone Number" value={profile.phoneNumber} />
          </div>
        ) : (
          <ProfileNotFound />
        )}
      </main>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center">
      <span className="w-40 font-medium text-gray-600">{label}:</span>
      <span className="ml-2 text-gray-900">{value}</span>
    </div>
  );
}

function ProfileNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <svg
        className="w-20 h-20 text-gray-300 mb-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.232 15.232a6 6 0 11-6.464 0M12 9v2m0 4h.01"
        />
      </svg>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        Profile Not Found
      </h3>
      <p className="text-gray-500 text-center">
        We couldn't find your profile information.
        <br />
        Please try again later or contact support.
      </p>
    </div>
  );
}
