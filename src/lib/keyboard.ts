export type GridCoord = { row: number; col: number };
export function nextCell(key: string, cur: GridCoord, rows: number, cols: number): GridCoord {
  const { row, col } = cur;
  switch (key) {
    case "ArrowRight": return { row, col: Math.min(col + 1, cols - 1) };
    case "ArrowLeft":  return { row, col: Math.max(col - 1, 0) };
    case "ArrowDown":  return { row: Math.min(row + 1, rows - 1), col };
    case "ArrowUp":    return { row: Math.max(row - 1, 0), col };
    default: return cur;
  }
}