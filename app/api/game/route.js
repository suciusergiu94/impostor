import { NextResponse } from "next/server";
import gameManager from "@/lib/gameState";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const player = searchParams.get("player");

  const updates = gameManager.getUpdates(player);

  // Filter sensitive data
  const safeUpdates = {
    ...updates,
    scores: gameManager.scores, // Send scores
  };

  // Only reveal word/impostor if playing and specific conditions met
  // Actually, client needs to know IF they are impostor.
  // And if NOT impostor, they need the word.

  if (
    gameManager.gameState === "PLAYING" ||
    gameManager.gameState === "VOTING"
  ) {
    // Voting happens during playing essentially
    if (player === gameManager.impostor) {
      safeUpdates.secret = "IMPOSTOR";
      safeUpdates.isImpostor = true;
    } else {
      safeUpdates.secret = gameManager.word;
      safeUpdates.isImpostor = false;
    }
  } else if (gameManager.gameState === "SCORING") {
    // Reveal everything
    safeUpdates.secret = gameManager.word;
    safeUpdates.impostorIdentity = gameManager.impostor;
    safeUpdates.votes = gameManager.votes;
  }

  return NextResponse.json(safeUpdates, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function POST(request) {
  const body = await request.json();
  const { action, player, target } = body;
  console.log(`[API] POST action=${action} player=${player} target=${target}`);

  switch (action) {
    case "join":
      gameManager.addPlayer(player);
      break;
    case "start":
      // Basic auth: Anyone named "Sergiu" or just allow any valid player if we want flexibility?
      // Requirement: "button, on the screen for the name "Sergiu" to start"
      if (player === "Sergiu") {
        gameManager.startGame();
      }
      break;
    case "vote":
      gameManager.submitVote(player, target);
      break;
    case "reset":
      if (player === "Sergiu") {
        gameManager.resetGame();
      }
      break;
    case "next_round":
      if (player === "Sergiu") {
        gameManager.startNextRound();
      }
      break;
  }

  return NextResponse.json({ success: true });
}
