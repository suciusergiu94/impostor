'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function GameScreen({ secret, isImpostor, onVoteStart }) {
    const [show, setShow] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-1000">
            <div className="text-center space-y-4">
                <h2 className="text-zinc-400 text-lg uppercase tracking-widest font-semibold">Your Role / Word</h2>
                <div
                    onClick={() => setShow(!show)}
                    className={cn(
                        "cursor-pointer select-none py-12 px-8 rounded-3xl border-2 transition-all duration-500 transform",
                        show
                            ? "bg-zinc-800/80 border-zinc-600 scale-100"
                            : "bg-zinc-900 border-zinc-800 scale-95 hover:scale-100"
                    )}
                >
                    {show ? (
                        <div className="text-center">
                            {isImpostor ? (
                                <span className="text-5xl md:text-6xl font-black text-red-500 text-glow-red animate-pulse block tracking-tighter">
                                    IMPOSTOR
                                </span>
                            ) : (
                                <span className="text-4xl md:text-5xl font-bold text-white text-glow tracking-tight">
                                    {secret}
                                </span>
                            )}
                            <p className="mt-4 text-xs text-zinc-500 font-mono">Tap to hide</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <span className="text-xl text-zinc-500 font-medium">Tap to reveal</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center text-zinc-500 text-sm max-w-xs px-4">
                {isImpostor
                    ? "Pretend you know the word. Listen carefully and blend in."
                    : "Find the Impostor! Ask questions and remember the word."}
            </div>

            <div className="pt-8">
                <button
                    onClick={onVoteStart}
                    className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-300 font-medium transition-colors border border-zinc-700"
                >
                    I'm ready to vote
                </button>
            </div>
        </div>
    );
}
