import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

interface ChatMessage {
  message: string;
  user?: {
    name?: string;
  };
  socketId?: string;
}

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const WatchParty = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const socketRef = useRef<Socket | null>(null);
  const mySocketIdRef = useRef<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [connected, setConnected] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [showParticipants, setShowParticipants] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteSocketIdRef = useRef<string | null>(null);
  const isRemoteAction = useRef(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setCameraOn(true);
      setMicOn(true);

      console.log("Camera + Mic started");

      socketRef.current?.emit("ready-for-call", { roomId });
    } catch (error) {
      console.error("Camera/Mic permission error:", error);
    }
  };

  const toggleCamera = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraOn(videoTrack.enabled);
    }
  };

  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  };

  const leaveCall = () => {
    // Stop local camera/mic tracks
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    // Close peer connection
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    remoteSocketIdRef.current = null;

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setMicOn(false);

    console.log("Left the call");
  };

  const currentUser = {
    name: "Guest",
  };

  const createPeerConnection = (targetSocketId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current!);
    });

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
          to: targetSocketId,
        });
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  useEffect(() => {
    if (!router.isReady || !roomId) return;

    const socket = io(SOCKET_URL);

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Watch Party Socket connected:", socket.id);
      mySocketIdRef.current = socket.id ?? null;

      setConnected(true);

      socket.emit("join-watch-party", {
        partyId: roomId,
        user: currentUser,
      });
    });

    socket.on("participants-update", ({ count }) => {
      console.log("Participants:", count);
      setParticipantCount(count);
    });

    socket.on("video-play", ({ currentTime }) => {
      const video = videoRef.current;

      if (!video) return;

      isRemoteAction.current = true;

      video.currentTime = currentTime;

      video
        .play()
        .catch((error) => {
          console.log("Remote play blocked:", error);
        })
        .finally(() => {
          setTimeout(() => {
            isRemoteAction.current = false;
          }, 100);
        });
    });

    socket.on("video-pause", ({ currentTime }) => {
      const video = videoRef.current;

      if (!video) return;

      isRemoteAction.current = true;

      video.currentTime = currentTime;
      video.pause();

      setTimeout(() => {
        isRemoteAction.current = false;
      }, 100);
    });

    socket.on("video-seek", ({ currentTime }) => {
      const video = videoRef.current;

      if (!video) return;

      isRemoteAction.current = true;

      video.currentTime = currentTime;

      setTimeout(() => {
        isRemoteAction.current = false;
      }, 100);
    });

    socket.on("party-message", (data: ChatMessage) => {
      console.log("Chat message:", data);

      setMessages((prev) => [...prev, data]);
    });

    socket.on("user-joined", ({ user }) => {
      console.log(`${user?.name || "User"} joined the party`);
    });

    socket.on("user-left", ({ user }) => {
      console.log(`${user?.name || "User"} left the party`);
    });

    socket.on("disconnect", () => {
      console.log("Watch Party Socket disconnected");
      setConnected(false);
    });
    socket.on("user-ready", async ({ socketId }: { socketId: string }) => {
      console.log("🔵 user-ready received from:", socketId);

      if (peerConnectionRef.current) {
        console.log("⚠️ Already have a peer connection, skipping");
        return;
      }

      remoteSocketIdRef.current = socketId;

      const myId = mySocketIdRef.current;

      if (myId && myId < socketId) {
        const pc = createPeerConnection(socketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { roomId, offer, to: socketId });
      } else {
        console.log("⏳ Waiting for offer from other peer...");
      }
    });

    socket.on(
      "offer",
      async ({
        offer,
        from,
      }: {
        offer: RTCSessionDescriptionInit;
        from: string;
      }) => {
        console.log("🟢 offer received from:", from);

        remoteSocketIdRef.current = from;
        const pc = createPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer, to: from });
      },
    );

    socket.on(
      "answer",
      async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
        console.log("🟡 answer received");

        await peerConnectionRef.current?.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
      },
    );

    socket.on(
      "ice-candidate",
      async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        try {
          await peerConnectionRef.current?.addIceCandidate(
            new RTCIceCandidate(candidate),
          );
        } catch (err) {
          console.error("ICE candidate error:", err);
        }
      },
    );

    return () => {
      socket.emit("leave-watch-party", {
        partyId: roomId,
        user: currentUser,
      });

      socket.disconnect();
      socketRef.current = null;
    };
  }, [router.isReady, roomId]);

  const handlePlay = () => {
    if (isRemoteAction.current) return;

    const video = videoRef.current;
    const socket = socketRef.current;

    if (!video || !socket || !roomId) return;

    socket.emit("video-play", {
      partyId: roomId,
      currentTime: video.currentTime,
    });
  };

  const handlePause = () => {
    if (isRemoteAction.current) return;

    const video = videoRef.current;
    const socket = socketRef.current;

    if (!video || !socket || !roomId) return;

    socket.emit("video-pause", {
      partyId: roomId,
      currentTime: video.currentTime,
    });
  };

  const handleSeek = () => {
    if (isRemoteAction.current) return;

    const video = videoRef.current;
    const socket = socketRef.current;

    if (!video || !socket || !roomId) return;

    socket.emit("video-seek", {
      partyId: roomId,
      currentTime: video.currentTime,
    });
  };

  const sendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    const socket = socketRef.current;

    if (!socket || !roomId) return;

    socket.emit("party-message", {
      partyId: roomId,
      message: trimmedMessage,
      user: currentUser,
    });

    setMessage("");
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const [copied, setCopied] = useState(false);

  const handleCopyInvite = async () => {
    if (typeof window === "undefined") return;

    const inviteLink = `${window.location.origin}/watch-party/${roomId}`;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Watch Party</h1>

            <p className="text-gray-400">Room ID: {roomId}</p>
          </div>

          <div className="text-right">
            <p className={connected ? "text-green-400" : "text-red-400"}>
              {connected ? "● Connected" : "● Disconnected"}
            </p>

            <button
              onClick={() => setShowParticipants((prev) => !prev)}
              className="text-gray-400 hover:text-white transition"
            >
              👥 {participantCount} participant
              {participantCount !== 1 ? "s" : ""}
            </button>
          </div>
        </div>

        {/* INVITE SECTION */}
        <div className="bg-gray-900 rounded-xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-400">Room Code</p>
            <p className="text-lg font-mono font-semibold tracking-wide">
              {roomId}
            </p>
          </div>

          <button
            onClick={handleCopyInvite}
            className="px-5 py-2 bg-red-600 rounded-lg hover:bg-red-700 whitespace-nowrap"
          >
            {copied ? "✅ Link Copied!" : "🔗 Copy Invite Link"}
          </button>
        </div>

        {showParticipants && (
          <div className="mb-5 bg-gray-900 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">👥 Participants</h2>

              <button
                onClick={() => setShowParticipants(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold">
                    G
                  </div>

                  <div>
                    <p className="font-medium">Guest</p>

                    <p className="text-xs text-green-400">● You</p>
                  </div>
                </div>

                <span className="text-green-400 text-sm">Online</span>
              </div>

              {participantCount > 1 &&
                Array.from({ length: participantCount - 1 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-800 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                        U
                      </div>

                      <div>
                        <p className="font-medium">User {index + 2}</p>

                        <p className="text-xs text-gray-400">Participant</p>
                      </div>
                    </div>

                    <span className="text-green-400 text-sm">Online</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VIDEO + CHAT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* VIDEO SECTION */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                controls
                className="w-full aspect-video bg-black"
                src="/video/vdo.mp4"
                onPlay={handlePlay}
                onPause={handlePause}
                onSeeked={handleSeek}
              />
            </div>

            <div className="mt-5 bg-gray-900 rounded-xl p-5">
              <h2 className="text-xl font-semibold mb-4">🎥 Video Call</h2>

              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full aspect-video object-cover"
                />
              </div>

              {/* Remote video */}
              <div className="bg-black rounded-lg overflow-hidden mt-3">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-video object-cover"
                />
              </div>

              <button
                onClick={startCamera}
                className="mt-4 px-5 py-2 bg-red-600 rounded-lg hover:bg-red-700"
              >
                {cameraOn ? "Camera Started" : "Start Camera"}
              </button>

              {cameraOn && (
                <div className="flex flex-wrap gap-3 mt-3">
                  <button
                    onClick={toggleCamera}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      cameraOn
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {cameraOn ? "📷 Camera Off" : "📷 Camera On"}
                  </button>

                  <button
                    onClick={toggleMic}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      micOn
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {micOn ? "🎤 Mute" : "🎤 Unmute"}
                  </button>

                  <button
                    onClick={leaveCall}
                    className="px-4 py-2 rounded-lg font-medium bg-red-700 hover:bg-red-800"
                  >
                    🚪 Leave Call
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 bg-gray-900 rounded-xl p-5">
              <h2 className="text-xl font-semibold mb-2">
                Real-time Video Sync
              </h2>

              <p className="text-gray-400">
                Play, pause or seek this video from one tab. Other users in the
                same room will automatically follow the video.
              </p>
            </div>
          </div>

          {/* CHAT SECTION */}
          <div className="bg-gray-900 rounded-xl flex flex-col h-[500px]">
            {/* CHAT HEADER */}
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold">💬 Party Chat</h2>

              <p className="text-sm text-gray-400">
                Chat with everyone in the party
              </p>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500 text-sm">No messages yet</p>
                </div>
              ) : (
                messages.map((item, index) => (
                  <div
                    key={`${item.socketId}-${index}`}
                    className="bg-gray-800 rounded-lg p-3"
                  >
                    <p className="text-sm text-blue-400 font-medium">
                      {item.user?.name || "User"}
                    </p>

                    <p className="text-white mt-1 break-words">
                      {item.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* CHAT INPUT */}
            <div className="p-3 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gray-500"
                />

                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchParty;
