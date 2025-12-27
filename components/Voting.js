'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function Voting({ players, onVote, playerName }) {
    const [selected, setSelected] = useState(null);

    // Exclude self from voting options
    const candidates = players.filter(p => p.name !== playerName);

    const handleVote = (target) => {
        setSelected(target);
        onVote(target);
    };

    return (
        <div className="space-y-6 w-full animate-in slide-in-from-bottom duration-700">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Who is the Impostor?</h2>
                <p className="text-zinc-400 text-sm">Tap to cast your vote.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {candidates.map((p) => (
                    <button
                        key={p.name}
                        onClick={() => handleVote(p.name)}
                        disabled={!!selected}
                        className={cn(
                            "p-4 rounded-xl border-2 transition-all duration-300 font-bold text-lg",
                            selected === p.name
                                ? "bg-red-500/20 border-red-500 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                                : selected
                                    ? "opacity-30 border-zinc-800 grayscale cursor-not-allowed"
                                    : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 text-zinc-300"
                        )}
                    >
                        {p.name}
                    </button>
                ))}
            </div>

            {selected && (
                <div className="text-center p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50 animate-pulse">
                    <p className="text-zinc-400">Waiting for other players...</p>
                </div>
            )}
        </div>
    );
}
