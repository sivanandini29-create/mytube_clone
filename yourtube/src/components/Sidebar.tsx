import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  User,
  FilmIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Channeldialogue from "./channeldialogue";
import { useUser } from "@/lib/AuthContext";

const Sidebar = () => {
  const { user } = useUser();

  const [isdialogeopen, setisdialogeopen] = useState(false);
  return (
    <aside className="w-64 bg-white dark:bg-black text-black dark:text-white border-r border-gray-200 dark:border-neutral-800 min-h-screen p-2">
      <nav className="space-y-1">
        <Link href="/">
          <Button
            variant="ghost" 
            className="w-full justify-start text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <Home className="w-5 h-5 mr-3" />
            Home
          </Button>
        </Link>
        <Link href="/explore">
          <Button
            variant="ghost"
            className="w-full justify-start text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <Compass className="w-5 h-5 mr-3" />
            Explore
          </Button>
        </Link>
        <Link href="/watch-party">
          <Button
            variant="ghost"
            className="w-full justify-start text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <FilmIcon className="w-5 h-5 mr-3" />
            Watch-Party
          </Button>
        </Link>
        <Link href="/subscription">
          <Button
            variant="ghost"
            className="w-full justify-start text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <PlaySquare className="w-5 h-5 mr-3" />
            Subscription
          </Button>
        </Link>

        {user && (
          <>
            <div className="border-t border-gray-200 dark:border-neutral-800 pt-2 mt-2">
              <Link href="/history">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <History className="w-5 h-5 mr-3" />
                  History
                </Button>
              </Link>
              <Link href="/liked">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <ThumbsUp className="w-5 h-5 mr-3" />
                  Liked videos
                </Button>
              </Link>
              <Link href="/watch-later">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <Clock className="w-5 h-5 mr-3" />
                  Watch later
                </Button>
              </Link>
              {user?.channelname ? (
                <Link href={`/channel/${user.id}`}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    <User className="w-5 h-5 mr-3" />
                    Your channel
                  </Button>
                </Link>
              ) : (
                <div className="px-2 py-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full bg-gray-100 dark:bg-neutral-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-700 cursor-pointer"
                    onClick={() => setisdialogeopen(true)}
                  >
                    Create Channel
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </nav>
      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        mode="create"
      />
    </aside>
  );
};

export default Sidebar;
