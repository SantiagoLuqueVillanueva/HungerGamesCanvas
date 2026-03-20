import type { Player } from "../models/Player";
import type { Board } from "../models/Board";

export interface MoveStrategy {
    move(player: Player, board: Board): void;
}