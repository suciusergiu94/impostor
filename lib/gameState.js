import fs from 'fs';
import path from 'path';

// Singleton instance
let gameManagerInstance = null;

class GameManager {
    constructor() {
        this.players = []; // { name: string, lastSeen: number }
        this.gameState = 'LOBBY'; // 'LOBBY', 'PLAYING', 'VOTING', 'SCORING'
        this.word = '';
        this.impostor = null;
        this.votes = {}; // { voter: target }
        this.scores = {}; // { name: number }
        this.round = 0;
        this.words = [];
    }

    loadWords() {
        try {
            const filePath = path.join(process.cwd(), 'words.txt');
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            // Parse : "Word 1", "Word 2", ...
            // Remove quotes and split
            this.words = fileContent
                .split(',')
                .map(w => w.trim().replace(/^"|"$/g, ''))
                .filter(w => w.length > 0);
        } catch (error) {
            console.error('Error loading words:', error);
            this.words = ['Apple', 'Banana', 'Orange']; // Fallback
        }
    }

    getUpdates(playerName) {
        if (playerName) {
            this.touchPlayer(playerName);
        }
        return {
            players: this.players,
            gameState: this.gameState,
            round: this.round,
            lastRoundResults: this.lastRoundResults || {},
            // Hide sensitive info if not needed or tailor to player
            // But for simplicity, we send safe data.
            // Private data (word/impostor) logic handled in API route or frontend?
            // Better to handle in API.
            // This method returns GLOBAL state. API filters it.
        };
    }

    addPlayer(name) {
        if (!name) return;
        const existing = this.players.find(p => p.name === name);
        if (!existing) {
            this.players.push({ name, lastSeen: Date.now() });
            if (this.scores[name] === undefined) {
                this.scores[name] = 0;
            }
        } else {
            existing.lastSeen = Date.now();
        }
    }

    touchPlayer(name) {
        const p = this.players.find(p => p.name === name);
        if (p) p.lastSeen = Date.now();
    }

    startGame() {
        if (this.words.length === 0) this.loadWords();
        const availablePlayers = this.players.map(p => p.name);

        // Pick random word
        const wordIndex = Math.floor(Math.random() * this.words.length);
        this.word = this.words[wordIndex];

        // Pick impostor
        const impIndex = Math.floor(Math.random() * availablePlayers.length);
        this.impostor = availablePlayers[impIndex];

        this.gameState = 'PLAYING';
        this.votes = {};
        this.round++;
    }

    submitVote(voter, target) {
        if (this.gameState !== 'PLAYING' && this.gameState !== 'VOTING') return;

        // Validation
        const voterExists = this.players.find(p => p.name === voter);
        if (!voterExists) {
            console.log(`[GameManager] Invalid vote attempt: Voter '${voter}' not found.`);
            return;
        }

        if (voter === target) {
            console.log(`[GameManager] Invalid vote attempt: '${voter}' tried to self-vote.`);
            return;
        }

        this.votes[voter] = target;

        // check if all non-impostor players voted
        const nonImpostorPlayers = this.players.filter(p => p.name !== this.impostor);
        const allVoted = nonImpostorPlayers.every(p => this.votes[p.name]);

        if (allVoted) {
            this.calculateScore();
            this.gameState = 'SCORING';
        }
    }

    calculateScore() {
        const votesForImpostor = Object.entries(this.votes)
            .filter(([voter, target]) => target === this.impostor && voter !== this.impostor)
            .length;

        const nonImpostorPlayers = this.players.filter(p => p.name !== this.impostor);
        const allFound = nonImpostorPlayers.every(p => this.votes[p.name] === this.impostor);
        const noneFound = votesForImpostor === 0;

        // Reset round results
        this.lastRoundResults = {}; // { name: { points: 0, reason: '' } }
        this.players.forEach(p => this.lastRoundResults[p.name] = { points: 0, reason: '' });

        if (allFound) {
            // Imp: 0, Others: 1
            this.scores[this.impostor] += 0;
            this.lastRoundResults[this.impostor] = { points: 0, reason: 'Caught by everyone' };

            nonImpostorPlayers.forEach(p => {
                this.scores[p.name] += 1;
                this.lastRoundResults[p.name] = { points: 1, reason: 'Found Impostor' };
            });
        } else if (noneFound) {
            // Imp: 5, Others: 0
            this.scores[this.impostor] += 5;
            this.lastRoundResults[this.impostor] = { points: 5, reason: 'Escaped Detection' };

            nonImpostorPlayers.forEach(p => {
                this.scores[p.name] += 0;
                this.lastRoundResults[p.name] = { points: 0, reason: 'Missed Impostor' };
            });
        } else {
            // Mixed
            // Imp: 1
            this.scores[this.impostor] += 1;
            this.lastRoundResults[this.impostor] = { points: 1, reason: 'Partially Caught' };

            nonImpostorPlayers.forEach(p => {
                if (this.votes[p.name] === this.impostor) {
                    this.scores[p.name] += 2;
                    this.lastRoundResults[p.name] = { points: 2, reason: 'Found Impostor (Bonus)' };
                } else {
                    this.scores[p.name] += 0;
                    this.lastRoundResults[p.name] = { points: 0, reason: 'Missed Impostor' };
                }
            });
        }
    }

    startNextRound() {
        console.log(`[GameManager] Starting next round: ${this.round + 1}`);
        this.startGame();
    }

    resetGame() {
        console.log('[GameManager] Resetting game');
        this.gameState = 'LOBBY';
        this.players = [];
        this.scores = {};
        this.votes = {};
        this.word = '';
        this.impostor = null;
        this.round = 0;
    }
}

// Global instance to persist across HMR in dev (somewhat) or module boundaries
if (!global.gameManager) {
    global.gameManager = new GameManager();
}
gameManagerInstance = global.gameManager;

export default gameManagerInstance;
