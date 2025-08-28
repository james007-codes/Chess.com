import { useEffect, useState } from "react";
import { socket, chess, getBoard, subscribeToBoard, getPlayerRole } from "./socket";

function App() {
  const [board, setBoard] = useState(getBoard());
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Subscribe to board updates
    subscribeToBoard((newBoard) => setBoard(newBoard));

    // Listen for assigned role from server
    socket.on("playerRole", (newRole) => {
      setRole(newRole === "W" ? "white" : "black");
    });

    // Initialize
    setBoard(getBoard());
    setRole(getPlayerRole());
  }, []);

  const resetBoard = () => {
    chess.reset();
    setBoard(getBoard());
  };

  // 🔄 Convert row/col -> square name depending on orientation
  const squareName = (row, col) => {
    let actualRow = row;
    let actualCol = col;

    if (role === "black") {
      // Mirror coordinates for black perspective
      actualRow = 7 - row;
      actualCol = 7 - col;
    }

    return String.fromCharCode(97 + actualCol) + (8 - actualRow);
  };

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
      socket.emit("move", move);
    }
    setDraggedFrom(null);
  };

  // 🔄 Flip board visually if black
  const orientedBoard =
    role === "black"
      ? board.map((row) => [...row].reverse()).reverse()
      : board;

  return (
    <div className="w-full min-h-screen bg-zinc-900 text-white flex flex-col justify-center items-center gap-4">
      <div className="chessboard grid grid-cols-8 w-96 h-96">
        {orientedBoard.map((row, rowIndex) =>
          row.map((square, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`square w-12 h-12 flex items-center justify-center ${
                  isLight ? "bg-[#eedc97]" : "bg-[#964d22]"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(rowIndex, colIndex)}
              >
                {square ? (
                  <span
                    draggable
                    onDragStart={() => handleDragStart(rowIndex, colIndex, square)}
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
