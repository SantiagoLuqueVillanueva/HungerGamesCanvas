import { Board } from "./models/Board";
import { Hunter } from "./models/Hunter";
import { Prey } from "./models/Prey";
import { Obstacle } from "./models/Obstacle";
import { HunterMove } from "./strategys/HunterMove";
import { PreyMove } from "./strategys/PreyMove";
import type { Player } from "./models/Player";

export class HungerGames {
    private board: Board;
    private hunters: Player[] = [];
    private preys: Player[] = [];
    private gameInterval: any = null;
    private canvasId: string;
    private config: { h: number, p: number, o: number };

    constructor(huntersCount: number, preysCount: number, obstaclesCount: number, canvasId: string) {
    this.canvasId = canvasId;
    this.config = { h: huntersCount, p: preysCount, o: obstaclesCount };
    
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    canvas.width = 800;
    canvas.height = 800;

    this.board = new Board(20, 20, canvasId); 
    this.setupEntities();
}

    private setupEntities(): void {
        this.hunters = [];
        this.preys = [];
        const hStrat = new HunterMove();
        const pStrat = new PreyMove();

        for (let i = 0; i < this.config.h; i++) {
            const h = new Hunter(`H${i}`, 0, 0, hStrat);
            this.randomPlace(h);
            this.hunters.push(h);
        }
        for (let i = 0; i < this.config.p; i++) {
            const p = new Prey(`P${i}`, 0, 0, pStrat);
            this.randomPlace(p);
            this.preys.push(p);
        }
        for (let i = 0; i < this.config.o; i++) {
            this.randomPlace(new Obstacle(`Obs${i}`, 0, 0));
        }
    }

    private randomPlace(p: Player): void {
        let placed = false;
        const grid = this.board.getGrid();
        let attempts = 0;
        while (!placed && attempts < 400) {
            const x = Math.floor(Math.random() * 20);
            const y = Math.floor(Math.random() * 20);
            if (grid[y][x] === null) {
                p.x = x; p.y = y;
                this.board.placePlayer(p);
                placed = true;
            }
            attempts++;
        }
    }

    private isAlive(p: Player): boolean {
        const grid = this.board.getGrid();
        return p.y >= 0 && p.y < 20 && p.x >= 0 && p.x < 20 && grid[p.y][p.x] === p;
    }

    public start(): void {
        this.stop();
        this.gameInterval = setInterval(() => {
            this.board.drawBoard();
            this.hunters.forEach(h => { if (this.isAlive(h)) h.performMove(this.board); });
            this.preys.forEach(p => { if (this.isAlive(p)) p.performMove(this.board); });

            const hAlive = this.hunters.filter(h => this.isAlive(h)).length;
            const pAlive = this.preys.filter(p => this.isAlive(p)).length;

            if (hAlive === 0 || pAlive === 0) {
                this.stop();
                this.board.drawBoard();
                const msg = hAlive === 0 ? "¡GANAN LAS PRESAS!" : "¡GANAN LOS CAZADORES!";
                window.dispatchEvent(new CustomEvent('game-over', { detail: msg }));
            }
        }, 400);
    }

    public stop(): void {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
    }

    public reset(): void {
        this.stop();
        this.board = new Board(20, 20, this.canvasId);
        this.setupEntities();
        this.board.drawBoard();
    }
}