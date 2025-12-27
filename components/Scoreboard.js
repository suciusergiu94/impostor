'use client';

import { cn } from '@/lib/utils';

export default function Scoreboard({
    scores,
    impostorIdentity,
    word,
    votes,
    isMaster,
    onNextRound,
    onReset,
    lastRoundResults
}) {
    // Sort scores desc
    const sortedScores = Object.entries(scores || {}).sort(([, a], [, b]) => b - a);

    return (
        <div className="space-y-8 w-full animate-in zoom-in duration-500">
            <div className="text-center space-y-4 bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800">
                <div className="space-y-1">
                    <h2 className="text-zinc-500 text-xs uppercase tracking-widest">The Secret Word Was</h2>
                    <p className="text-3xl font-bold text-white text-glow">{word}</p>
                </div>
                <div className="w-full h-px bg-zinc-800" />
                <div className="space-y-1">
                    <h2 className="text-zinc-500 text-xs uppercase tracking-widest">The Impostor Was</h2>
                    <p className="text-4xl font-black text-red-500 text-glow-red">{impostorIdentity}</p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white px-2">Scoreboard</h3>
                <div className="space-y-2">
                    {sortedScores.map(([name, score], i) => (
                        <div
                            key={name}
                            className={cn(
                                "flex justify-between items-center p-4 rounded-xl border transition-all",
                                name === impostorIdentity
                                    ? "bg-red-500/10 border-red-500/30"
                                    : "bg-zinc-800/50 border-zinc-700/50",
                                i === 0 ? "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]" : ""
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold",
                                    i === 0 ? "bg-yellow-500 text-black" : "bg-zinc-700 text-zinc-400"
                                )}>
                                    {i + 1}
                                </span>
                                <div>
                                    <span className={cn(
                                        "font-medium block",
                                        name === impostorIdentity ? "text-red-400" : "text-zinc-200"
                                    )}>
                                        {name}
                                    </span>
                                    {lastRoundResults && lastRoundResults[name] && (
                                        <span className={cn(
                                            "text-xs",
                                            lastRoundResults[name].points > 0 ? "text-green-400" : "text-zinc-500"
                                        )}>
                                            +{lastRoundResults[name].points} ({lastRoundResults[name].reason})
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="font-bold text-xl text-white">{score}</span>
                        </div>
                    ))}
                </div>
            </div>

            {isMaster && (
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <button
                        onClick={onReset}
                        className="w-full py-4 bg-zinc-800 text-red-400 font-bold rounded-xl border border-zinc-700 hover:bg-zinc-700 hover:text-red-300 transition-all"
                    >
                        Reset Game
                    </button>
                    <button
                        onClick={onNextRound}
                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                        Next Round
                    </button>
                </div>
            )}
            {!isMaster && (
                <div className="text-center text-zinc-500 text-sm animate-pulse">
                    Waiting for next round...
                </div>
            )}
        </div>
    );
}
