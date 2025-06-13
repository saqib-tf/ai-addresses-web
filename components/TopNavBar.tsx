import React from "react";
import Link from "next/link";

export default function TopNavBar() {
  return (
    <nav className="w-full h-16 flex items-center justify-between px-8 bg-gray-100 dark:bg-gray-900 shadow">
      <div className="text-xl font-bold text-gray-900 dark:text-white">AI Addresses</div>
      <div className="flex gap-6">
        <Link href="/" className="text-gray-700 dark:text-gray-200 hover:underline">
          Home
        </Link>
        <Link href="/settings" className="text-gray-700 dark:text-gray-200 hover:underline">
          Settings
        </Link>
        <Link href="/about" className="text-gray-700 dark:text-gray-200 hover:underline">
          About
        </Link>
      </div>
    </nav>
  );
}
