import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { UserProvider, useUser } from "../lib/AuthContext";
import "../styles/globals.css";

function AppContent({ Component, pageProps, router }: AppProps) {
  const { theme, toggleTheme } = useUser();

  return (
    <div
      className={
        theme === "dark"
          ? "dark min-h-screen bg-black text-white"
          : "min-h-screen bg-white text-black"
      }
    >
      <Header />
      <Toaster />

      <div className="flex">
        <Sidebar />

        <main className="flex-1">
          <Component {...pageProps} />
        </main>
      </div>

      <button
        onClick={toggleTheme}
        className="fixed bottom-5 right-5 z-50 rounded-full bg-orange-500 px-4 py-2 text-white shadow-lg font-medium hover:bg-orange-600 transition-colors flex items-center gap-1.5 cursor-pointer"
        title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
      >
        <span>{theme === "light" ? "🌙 Dark" : "☀️ Light"}</span>
      </button>
    </div>
  );
}

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <UserProvider>
      <AppContent Component={Component} pageProps={pageProps} router={router} />
    </UserProvider>
  );
}
