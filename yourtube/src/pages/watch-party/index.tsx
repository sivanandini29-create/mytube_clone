import React, { useState } from "react";
import { useRouter } from "next/router";

const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 8);
};

const WatchPartyHome = () => {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");

  const handleCreateParty = () => {
    const newRoomId = generateRoomId();
    router.push(`/watch-party/${newRoomId}`);
  };

  const handleJoinParty = () => {
    const trimmedCode = joinCode.trim();

    if (!trimmedCode) return;

    router.push(`/watch-party/${trimmedCode}`);
  };

  const handleJoinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleJoinParty();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2 text-center">🎬 Watch Party</h1>
        <p className="text-gray-400 text-center mb-8">
          Watch videos together in real-time with friends
        </p>

        <div className="bg-gray-900 rounded-xl p-6 mb-4">
          <h2 className="text-lg font-semibold mb-2">Start a new party</h2>
          <p className="text-sm text-gray-400 mb-4">
            Create a room and share the code with friends
          </p>

          <button
            onClick={handleCreateParty}
            className="w-full px-5 py-3 bg-red-600 rounded-lg hover:bg-red-700 font-medium"
          >
            Create New Party
          </button>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">Join a party</h2>
          <p className="text-sm text-gray-400 mb-4">
            Enter a room code shared by your friend
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={handleJoinKeyDown}
              placeholder="Enter room code..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-500"
            />

            <button
              onClick={handleJoinParty}
              disabled={!joinCode.trim()}
              className="px-5 py-2 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPartyHome;
