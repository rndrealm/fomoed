"use client";

import { useEffect } from "react";

export default function CookiesManager() {
  useEffect(() => {
    // Listen for messages from the service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "please-clear-cookies") {
        clearAllCookies();
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  const clearAllCookies = () => {
    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      // Expire the cookie
      document.cookie = `${name}=; Max-Age=0; path=/;`;
    });
    console.log("All cookies cleared!");

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return null; // This component doesn't render anything
}
