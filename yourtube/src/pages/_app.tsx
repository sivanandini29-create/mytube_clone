import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { UserProvider } from "../lib/AuthContext";
import "../styles/globals.css";

function AppContent({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const currentHour = new Date().getHours();
    const currentMinutes = new Date().getMinutes();
    const currentTime = currentHour * 60 + currentMinutes;

    const startTime = 10 * 60;
    const endTime = 12 * 60;

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    } else if (currentTime >= startTime && currentTime <= endTime) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div
      className={
        theme === "dark"
          ? " dark min-h-screen bg-black text-white"
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
        className="fixed bottom-5 right-5 z-50 rounded-full bg-orange-500 px-4 py-2 text-white shadow-lg"
      >
        {theme === "light" ? "Dark" : "Light"}
      </button>
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </UserProvider>
  );
}
