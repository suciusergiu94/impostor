"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Lobby({ players, onJoin, onStart, playerName }) {
  const [nameInput, setNameInput] = useState("");

  const isJoined = !!playerName;
  const isMaster = playerName === "Sergiu";

  return (
    <div className="space-y-8 bg-zinc-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Impostor
        </h1>
        <p className="text-zinc-400">Identify the spy among us.</p>
      </div>

      {!isJoined ? (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-center text-lg placeholder:text-zinc-600 transition-all"
          />
          <button
            onClick={() => onJoin(nameInput)}
            disabled={!nameInput.trim()}
            className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10"
          >
            Join Game
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm uppercase tracking-widest text-zinc-500 font-semibold text-center">
              Players Joined ({players.length})
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {players.map((p) => (
                <div
                  key={p.name}
                  className={cn(
                    "px-3 py-2 rounded-lg text-center text-sm font-medium transition-all",
                    p.name === playerName
                      ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                      : "bg-zinc-800/50 text-zinc-400 border border-zinc-800"
                  )}
                >
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          {isMaster && (
            <button
              onClick={onStart}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-purple-500/20 text-lg tracking-wide"
            >
              START GAME
            </button>
          )}
          {!isMaster && (
            <div className="text-center text-zinc-500 text-sm animate-pulse">
              Waiting for Sergiu to start...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
