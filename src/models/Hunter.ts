import { Player } from "./Player";
import type { MoveStrategy } from "../strategys/Move";

export class Hunter extends Player {
    constructor(name: string, attackPower: number, x: number, y: number, strategy: MoveStrategy | null) {
        super(name, "Hunter", 100, attackPower, x, y, strategy); 
    }
}