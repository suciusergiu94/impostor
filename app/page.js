"use client";

import { useState, useEffect, useCallback } from "react";
import Lobby from "@/components/Lobby";
import GameScreen from "@/components/GameScreen";
import Voting from "@/components/Voting";
import Scoreboard from "@/components/Scoreboard";

export default function Home() {
  const [playerName, setPlayerName] = useState(null);
  const [gameState, setGameState] = useState("LOBBY");
  const [players, setPlayers] = useState([]);
  const [data, setData] = useState({});

  // Restore session
  useEffect(() => {
    const savedName = localStorage.getItem('impostor_playerName');
    if (savedName) setPlayerName(savedName);
  }, []);

  // Save session
  const savePlayerName = (name) => {
    setPlayerName(name);
    if (name) localStorage.setItem('impostor_playerName', name);
    else localStorage.removeItem('impostor_playerName');
  };

  // Polling
  const poll = useCallback(async () => {
    // Poll even if no player name to see lobby updates
    try {
      const pName = playerName || "";
      // Add timestamp to prevent caching
      const res = await fetch(
        `/api/game?player=${encodeURIComponent(pName)}&t=${Date.now()}`,
        {
          cache: "no-store",
          headers: {
            Pragma: "no-cache",
            "Cache-Control": "no-cache",
          },
        }
      );
      if (res.ok) {
        const json = await res.json();
        setGameState(json.gameState);
        setPlayers(json.players);
        setData(json);
      }
    } catch (e) {
      console.error(e);
    }
  }, [playerName]);

  useEffect(() => {
    const interval = setInterval(poll, 1000);
    poll();
    return () => clearInterval(interval);
  }, [poll]);

  // Actions
  const joinGame = async (name) => {
    await fetch("/api/game", {
      method: "POST",
      body: JSON.stringify({ action: "join", player: name }),
      headers: { "Content-Type": "application/json" },
    });
    savePlayerName(name);
  };

  const startGame = async () => {
    await fetch("/api/game", {
      method: "POST",
      body: JSON.stringify({ action: "start", player: playerName }),
      headers: { "Content-Type": "application/json" },
    });
  };

  const submitVote = async (target) => {
    await fetch("/api/game", {
      method: "POST",
      body: JSON.stringify({ action: "vote", player: playerName, target }),
      headers: { "Content-Type": "application/json" },
    });
  };

  const nextRound = async () => {
    await fetch("/api/game", {
      method: "POST",
      body: JSON.stringify({ action: "next_round", player: playerName }),
      headers: { "Content-Type": "application/json" },
    });
  };

  const resetGame = async () => {
    if (
      !confirm(
        "Are you sure you want to reset the game? This will clear all scores and players."
      )
    )
      return;

    await fetch("/api/game", {
      method: "POST",
      body: JSON.stringify({ action: "reset", player: playerName }),
      headers: { "Content-Type": "application/json" },
    });
    // Reset local state
    savePlayerName(null);
    setGameState("LOBBY");
  };

  // Need to force refresh lobby if I haven't joined yet?
  // Let's add a "pre-join" poll or just simple Polling component wrapper.
  // Actually, lobby needs to show players before I join.
  // So I should poll even without player name.
  useEffect(() => {
    if (!playerName) {
      const timer = setInterval(() => {
        fetch(`/api/game?player=&t=${Date.now()}`, { cache: "no-store" })
          .then((r) => r.json())
          .then((d) => {
            setPlayers(d.players);
            setGameState(d.gameState);
          })
          .catch((e) => { });
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [playerName]);

  // If we are reset remotely, we should probably be kicked to lobby.
  // Handled by poll update: data.gameState -> LOBBY.
  // But if playerName is still set, we might show "Joined" state in lobby.
  // If remote reset clears players, our playerName is invalid on server.
  // We should detect if we are not in the players list anymore?
  // Add check: if playerName && !players.find(p=>p.name === playerName), reset local playerName.
  useEffect(() => {
    if (playerName && players.length > 0) {
      const stillIn = players.find((p) => p.name === playerName);
      if (!stillIn) {
        savePlayerName(null); // Kicked or reset
      }
    }
  }, [players, playerName]);

  // Force Lobby if no player name, even if game is in progress
  // This handles the case where a user refreshes and might momentarily have no name, 
  // or if they are a new observer.
  // Actually, if we restore from localStorage, `playerName` might be set quickly.
  // But if it remains null, we must show Lobby.
  const showLobby = gameState === 'LOBBY' || !playerName;

  // View Routing
  if (showLobby) {
    return (
      <Lobby
        players={players}
        onJoin={joinGame}
        onStart={startGame}
        playerName={playerName}
      />
    );
  }

  if (gameState === "PLAYING") {
    // Show Game Screen (Role)
    // There is no separate "Voting" phase in my backend originally,
    // I said "In this phase... each player can vote".
    // So 'PLAYING' includes voting capability.
    // However, I have a GameScreen component and a Voting component.
    // Maybe I should show GameScreen, and a button to "Vote" which switches local view?
    // I added `onVoteStart` prop to GameScreen.

    // Local view state to toggle between Word View and Vote View?
    // Let's assume we want to guide them.
    // Default: Show Word.
    // Button: "Ready to Vote".
    return (
      <PlayingController
        data={data}
        playerName={playerName}
        onVote={submitVote}
      />
    );
  }

  if (gameState === "SCORING") {
    return (
      <Scoreboard
        scores={data.scores}
        impostorIdentity={data.impostorIdentity}
        word={data.secret}
        votes={data.votes}
        isMaster={playerName === "Sergiu"}
        onNextRound={nextRound}
        onReset={resetGame}
        lastRoundResults={data.lastRoundResults}
      />
    );
  }

  return <div className="text-white">Loading...</div>;
}

// Sub-component to handle local view switching during PLAYING
function PlayingController({ data, playerName, onVote }) {
  const [view, setView] = useState("WORD"); // WORD | VOTE

  if (view === "WORD") {
    return (
      <GameScreen
        secret={data.secret}
        isImpostor={data.isImpostor}
        onVoteStart={() => setView("VOTE")}
      />
    );
  } else {
    return (
      <Voting players={data.players} onVote={onVote} playerName={playerName} />
    );
  }
}
