"use client";
import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Restaurants", href: "/restaurants" },
  { name: "Orders", href: "/orders" },
];

const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-[#ff914d] to-[#ff4e50] px-8 py-3 shadow-md flex items-center justify-between font-segoe-ui relative flex-wrap md:flex-nowrap">
      <div className="flex items-center gap-2">
        <img
          src="https://img.icons8.com/color/48/000000/restaurant.png"
          alt="Logo"
          className="w-9 h-9"
        />
        <span className="font-bold text-2xl text-white tracking-wide">
          Slooze Eats
        </span>
      </div>
      <button
        className="flex flex-col justify-center gap-1 bg-none border-none cursor-pointer ml-4 md:hidden absolute right-4 top-4"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="w-6 h-[3px] bg-white rounded block" />
        <span className="w-6 h-[3px] bg-white rounded block" />
        <span className="w-6 h-[3px] bg-white rounded block" />
      </button>
      <ul
        className={`
                flex gap-8 list-none m-0 p-0
                md:flex
                ${
                  menuOpen
                    ? "flex flex-col gap-4 w-full bg-gradient-to-r from-[#ff914d] to-[#ff4e50] absolute top-16 left-0 p-4 z-10"
                    : "hidden"
                }
                md:static md:flex-row md:bg-none md:w-auto md:gap-8 md:p-0
            `}
      >
        {navLinks.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
              className="text-white no-underline font-medium text-lg transition-colors duration-200 hover:text-[#ffe082]"
            >
              {link.name}
            </a>
          </li>
        ))}

        {session?.user.role === "MANAGER" ||
          (session?.user.role === "ADMIN" && (
            <li>
              <a
                href="/checkout"
                className="text-white no-underline font-medium text-lg transition-colors duration-200 hover:text-[#ffe082]"
              >
                Checkout
              </a>
            </li>
          ))}

        {session?.user.role === "ADMIN" && (
          <li>
            <a
              href="/update-payment"
              className="text-white no-underline font-medium text-lg transition-colors duration-200 hover:text-[#ffe082]"
            >
              Modify Payment
            </a>
          </li>
        )}
      </ul>
      <div
        className={`
                flex items-center gap-4
                ${menuOpen ? "w-full justify-start mt-2" : ""}
                md:w-auto md:justify-end md:mt-0
            `}
      >
        <a
          href="/cart"
          className="bg-white text-[#ff4e50] px-5 py-2 rounded-full font-semibold no-underline shadow transition-colors duration-200 hover:bg-[#ffe082] hover:text-[#ff4e50]"
        >
          🛒 Cart
        </a>
        {status === "loading" ? null : session ? (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-white text-[#ff4e50] px-5 py-2 rounded-full font-semibold shadow transition-colors duration-200 hover:bg-[#ffe082] hover:text-[#ff4e50] border-none cursor-pointer"
          >
            Sign out
          </button>
        ) : (
          <button
            onClick={() => signIn()}
            className="bg-white text-[#ff4e50] px-5 py-2 rounded-full font-semibold shadow transition-colors duration-200 hover:bg-[#ffe082] hover:text-[#ff4e50] border-none cursor-pointer"
          >
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
