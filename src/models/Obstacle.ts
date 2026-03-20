import { Player } from "./Player";

export class Obstacle extends Player {
    constructor(name: string, x: number, y: number) {
        super(name, "Obstacle", 1000, 0, x, y, null);
    }
}