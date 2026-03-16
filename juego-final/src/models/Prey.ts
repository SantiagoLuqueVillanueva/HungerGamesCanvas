import { Player } from "./Player";
import type { MoveStrategy } from "../strategys/Move";

export class Prey extends Player {
    constructor(name: string, x: number, y: number, strategy: MoveStrategy) {
        super(name, "Prey", 100, 30, x, y, strategy);
    }
}