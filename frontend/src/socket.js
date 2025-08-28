import { io } from "socket.io-client";
import { Chess } from "chess.js";

const URL =
  process.env.NODE_ENV === "production"
    ? undefined
    : "http://localhost:3000";

export const socket = io(URL);
export const chess = new Chess();

// --- Board subscription system ---
let boardListeners = [];
export const subscribeToBoard = (cb) => {
  boardListeners.push(cb);
};

const updateBoard = () => {
  const board = chess.board();
  boardListeners.forEach((cb) => cb(board));
};

// --- Role state (optional if you’ll use it later) ---
let playerRole = null;
let spectatorRole = null;

// Socket listeners
socket.on("playerRole", (role) => {
  playerRole = role;
  updateBoard();
});

socket.on("spectatorRole", (role) => {
  spectatorRole = role;
  updateBoard();
});

socket.on("boardState", (fen) => {
  chess.load(fen);
  updateBoard();
});

socket.on("move", (move) => {
  chess.move(move);
  updateBoard();
});

// Export helpers
export const getBoard = () => chess.board();
export const getPlayerRole = () => playerRole;
export const getSpectatorRole = () => spectatorRole;
