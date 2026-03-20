import type { MoveStrategy } from "../strategys/Move";
import type { Board } from "./Board";

export abstract class Player {
    public name: string;
    public type: string;
    public vitality: number;
    public maxVitality: number;
    public attackPower: number;
    public x: number;
    public y: number;
    
    public visualX: number;
    public visualY: number;
    
    public strategy: MoveStrategy | null;

    constructor(name: string, type: string, vitality: number, attackPower: number, x: number, y: number, strategy: MoveStrategy | null) {
        this.name = name;
        this.type = type;
        this.vitality = vitality;
        this.maxVitality = vitality;
        this.attackPower = attackPower;
        this.x = x;
        this.y = y;
        this.visualX = x;
        this.visualY = y;
        this.strategy = strategy;
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    takeDamage(amount: number): void {
        this.vitality -= amount;
        if (this.vitality < 0) this.vitality = 0;
    }

    performMove(board: Board): void {
        if (this.strategy) this.strategy.move(this, board);
    }
}