import type { MoveStrategy } from "./Move";
import type { Player } from "../models/Player";
import type { Board } from "../models/Board";

export class PreyMove implements MoveStrategy {
    move(p: Player, board: Board): void {
        let hunter: Player | null = null;
        let minDistance = Number.MAX_VALUE;
        const grid = board.getGrid();
        const w = board.getWidth();
        const h = board.getHeight();

        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                const pos = grid[i][j];
                if (pos !== null && pos.type === "Hunter") {
                    const distance = Math.hypot(pos.x - p.x, pos.y - p.y);
                    if (distance < minDistance) {
                        minDistance = distance;
                        hunter = pos;
                    }
                }
            }
        }

        if (!hunter) return;

        const validMoves: { x: number, y: number, dist: number }[] = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nX = p.x + dx;
                const nY = p.y + dy;
                if (nX >= 0 && nX < w && nY >= 0 && nY < h) {
                    const cell = grid[nY][nX];
                    if (cell === null || (cell.type !== "Obstacle" && cell.type !== p.type)) {
                        const dist = Math.hypot(hunter.x - nX, hunter.y - nY);
                        validMoves.push({ x: nX, y: nY, dist: dist });
                    }
                }
            }
        }
        validMoves.sort((a, b) => b.dist - a.dist);
        if (validMoves.length > 0) board.movePlayer(p, validMoves[0].x, validMoves[0].y);
    }
}