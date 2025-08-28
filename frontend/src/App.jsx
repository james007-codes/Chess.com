import { useEffect, useState } from "react";
import { socket,chess, getBoard, subscribeToBoard } from "./socket";

function App() {
  const [board, setBoard] = useState(getBoard());
  const [draggedFrom, setDraggedFrom] = useState(null);

  useEffect(() => {
    // Subscribe to board updates
    subscribeToBoard((newBoard) => setBoard(newBoard));

    // Initialize with current board
    setBoard(getBoard());
  }, []);

  const resetBoard = () => {
    chess.reset();
    setBoard(getBoard());
  };

  const squareName = (row, col) =>
    String.fromCharCode(97 + col) + (8 - row);

  const handleDragStart = (row, col, square) => {
    if (!square) return;
    setDraggedFrom(squareName(row, col));
  };

  const handleDrop = (row, col) => {
    if (!draggedFrom) return;
    const to = squareName(row, col);

    const move = chess.move({ from: draggedFrom, to, promotion: "q" });
    if (move) {
      setBoard(getBoard());

      // 🔥 send move to server
      // so other clients update
      // (otherwise only local state changes)
      socket.emit("move", move);
    }
    setDraggedFrom(null);
  };

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white flex flex-col justify-center items-center gap-4">
      <div className="chessboard grid grid-cols-8 w-96 h-96">
        {board.map((row, rowIndex) =>
          row.map((square, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`square w-12 h-12 flex items-center justify-center ${
                  isLight ? "bg-slate-400" : "bg-amber-900"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(rowIndex, colIndex)}
              >
                {square ? (
                  <span
                    draggable
                    onDragStart={() =>
                      handleDragStart(rowIndex, colIndex, square)
                    }
                    className="text-2xl cursor-grab select-none"
                  >
                    {pieceToUnicode(square.type, square.color)}
                  </span>
                ) : null}
              </div>
            );
          })
        )}
      </div>
      <button
        onClick={resetBoard}
        className="mt-4 px-4 py-2 bg-red-500 rounded"
      >
        Reset Board
      </button>
    </div>
  );
}

function pieceToUnicode(type, color) {
  const map = {
    p: { w: "♙", b: "♟" },
    r: { w: "♖", b: "♜" },
    n: { w: "♘", b: "♞" },
    b: { w: "♗", b: "♝" },
    q: { w: "♕", b: "♛" },
    k: { w: "♔", b: "♚" },
  };
  return map[type][color];
}

export default App;
