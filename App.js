
import React, { useState } from "react";
import "./App.css";

const App = () => {
  // State for the Sudoku grid, message, error, hints, and hint cell
  const [grid, setGrid] = useState(Array(9).fill().map(() => Array(9).fill("")));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hints, setHints] = useState({});
  const [hintCell, setHintCell] = useState(null);

  // Update cell value
  const handleChange = (row, col, value) => {
    if (value === "" || /^[1-9]$/.test(value)) {
      const newGrid = grid.map((r, i) =>
        i === row ? r.map((c, j) => (j === col ? value : c)) : r
      );
      setGrid(newGrid);
      setHints({});
      setHintCell(null); // Reset hint cell
    }
  };

  // Validate the Sudoku grid
  const isValidGrid = () => {
    const isValid = (nums) => {
      const filtered = nums.filter((n) => n !== "");
      return new Set(filtered).size === filtered.length;
    };

    for (let i = 0; i < 9; i++) {
      if (!isValid(grid[i]) || !isValid(grid.map((row) => row[i]))) {
        return false;
      }

      const subGrid = [];
      const startRow = Math.floor(i / 3) * 3;
      const startCol = (i % 3) * 3;
      for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
          subGrid.push(grid[r][c]);
        }
      }
      if (!isValid(subGrid)) {
        return false;
      }
    }
    return true;
  };

  // Solve the Sudoku
  const solveSudoku = (board) => {
    const findEmpty = () => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c] === "") return [r, c];
        }
      }
      return null;
    };

    const isValidPlacement = (row, col, num) => {
      for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) {
          return false;
        }
      }
      const subRow = Math.floor(row / 3) * 3;
      const subCol = Math.floor(col / 3) * 3;
      for (let r = subRow; r < subRow + 3; r++) {
        for (let c = subCol; c < subCol + 3; c++) {
          if (board[r][c] === num) return false;
        }
      }
      return true;
    };

    const empty = findEmpty();
    if (!empty) return true;

    const [row, col] = empty;
    for (let num = 1; num <= 9; num++) {
      if (isValidPlacement(row, col, num.toString())) {
        board[row][col] = num.toString();
        if (solveSudoku(board)) return true;
        board[row][col] = "";
      }
    }
    return false;
  };

  const handleValidate = () => {
    if (isValidGrid()) {
      setError("");
      setMessage("The grid is valid!");
    } else {
      setMessage("");
      setError("Invalid Sudoku grid!");
    }
  };

  const handleSolve = () => {
    const newGrid = grid.map((row) => row.slice());
    if (isValidGrid()) {
      if (solveSudoku(newGrid)) {
        setGrid(newGrid);
        setMessage("Sudoku solved successfully!");
        setError("");
      } else {
        setMessage("");
        setError("Sudoku is unsolvable!");
      }
    } else {
      setMessage("");
      setError("Invalid Sudoku grid!");
    }
  };

  const handleClear = () => {
    setGrid(Array(9).fill().map(() => Array(9).fill("")));
    setHints({});
    setMessage("");
    setError("");
  };

  // Generate hints for a specific cell
  const generateHintsForCell = (row, col) => {
    if (grid[row][col] !== "") return;

    const possible = new Set("123456789".split(""));
    for (let i = 0; i < 9; i++) {
      possible.delete(grid[row][i]); // Remove numbers from the same row
      possible.delete(grid[i][col]); // Remove numbers from the same column
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        possible.delete(grid[r][c]); // Remove numbers from same sub-grid
      }
    }

    return Array.from(possible);
  };

  const handleHintCellClick = (row, col) => {
    setHintCell([row, col]); // Save the cell to provide hints
    setHints({ [`${row}-${col}`]: generateHintsForCell(row, col) }); // Generate hints for the clicked cell
  };

  const handleShowAllHints = () => {
    const allHints = {};
    grid.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        if (cell === "") {
          allHints[`${rIdx}-${cIdx}`] = generateHintsForCell(rIdx, cIdx);
        }
      });
    });
    setHints(allHints); // Store hints for all empty cells
  };

  return (
    <div className="app">
      <h1>Sudoku Solver</h1>
      <div className="sudoku-grid">
        {grid.map((row, rIdx) =>
          row.map((value, cIdx) => (
            <input
              key={`${rIdx}-${cIdx}`}
              type="text"
              className="cell"
              value={value}
              onChange={(e) => handleChange(rIdx, cIdx, e.target.value)}
              onClick={() => handleHintCellClick(rIdx, cIdx)}
            />
          ))
        )}
      </div>
      <div className="buttons">
        <button onClick={handleValidate} className="button validate">
          Validate
        </button>
        <button onClick={handleSolve} className="button solve">
          Solve
        </button>
        <button onClick={handleClear} className="button clear">
          Clear
        </button>
        <button onClick={handleShowAllHints} className="button hint">
          Show Hints
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}
      {hintCell && hints[`${hintCell[0]}-${hintCell[1]}`] && (
        <div className="message">
          Possible values for cell ({hintCell[0]}, {hintCell[1]}): <strong>{hints[`${hintCell[0]}-${hintCell[1]}`].join(", ")}</strong>
        </div>
      )}
      {Object.keys(hints).length > 0 && (
        <div className="hints">
          <h3>Hints for Empty Cells:</h3>
          <ul>
            {Object.entries(hints).map(([key, possibleValues]) => {
              const [rIdx, cIdx] = key.split("-").map(Number);
              return (
                <li key={key}>
                  Cell ({rIdx}, {cIdx}): <strong>{possibleValues.join(", ")}</strong>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;