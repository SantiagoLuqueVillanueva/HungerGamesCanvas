import { Player } from "./Player";
import type { MoveStrategy } from "../strategys/Move";

export class Prey extends Player {
    constructor(name: string, attackPower: number, x: number, y: number, strategy: MoveStrategy | null) {
        super(name, "Prey", 100, attackPower, x, y, strategy);
    }
}