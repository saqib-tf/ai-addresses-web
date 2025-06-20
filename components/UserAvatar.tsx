"use client";

import React, { useState, useEffect } from "react";
import { IS_PRODUCTION } from "@/lib/constants";
import { LoggedInUserDto } from "@/models/LoggedInUserDto";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UserAvatar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<LoggedInUserDto | null>(null);

  useEffect(() => {
    if (!IS_PRODUCTION) {
      setUser({
        clientPrincipal: {
          identityProvider: "dev",
          userId: "dev-user-id",
          userDetails: "devuser@example.com",
          userRoles: ["authenticated"],
        },
      });
    } else {
      fetch("/.auth/me", { credentials: "same-origin" })
        .then((res) => res.json())
        .then((data: LoggedInUserDto) => {
          setUser(data);
        })
        .catch(() => setUser(null));
    }
  }, []);

  const username = user ? user.clientPrincipal.userDetails.split("@")[0] : "User";

  return (
    <div className="relative flex items-center gap-2">
      {user ? (
        <>
          <div onClick={() => setOpen((v) => !v)} className="cursor-pointer">
            <Avatar className="bg-white">
              <AvatarFallback className="bg-white text-gray-700 border border-gray-300">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          {open && (
            <div className="absolute right-0 top-12 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
              <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                {user ? user.clientPrincipal.userDetails : "No details"}
              </div>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-70"
                onClick={() => {
                  window.location.href = "/.auth/logout";
                  setOpen(false);
                }}
              >
                Logout
              </button>
            </div>
          )}
        </>
      ) : (
        <button
          className="text-gray-700 dark:text-gray-200 hover:underline px-4 py-2 rounded"
          onClick={() => (window.location.href = "/.auth/login/aad")}
        >
          Login
        </button>
      )}
    </div>
  );
}
