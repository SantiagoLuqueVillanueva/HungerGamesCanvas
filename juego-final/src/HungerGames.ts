import { Board } from "./models/Board";
import { Hunter } from "./models/Hunter";
import { Prey } from "./models/Prey";
import { Obstacle } from "./models/Obstacle";
import { HunterMove } from "./strategys/HunterMove";
import { PreyMove } from "./strategys/PreyMove";
import type { Player } from "./models/Player";
import { audioManager } from "./AudioManager";

export interface GameConfig {
    mode: 'sandbox' | 'singleplayer';
    hunters: number;
    hunterDmg: number;
    preys: number;
    preyDmg: number;
    obstacles: number;
    size: number;
}

export interface Projectile { x: number; y: number; dx: number; dy: number; }

export class HungerGames {
    private board: Board;
    private hunters: Player[] = [];
    private preys: Player[] = [];
    private projectiles: Projectile[] = [];
    private gameInterval: any = null;
    private projInterval: any = null;
    private canvasId: string;
    public config: GameConfig;

    constructor(config: GameConfig, canvasId: string) {
        this.canvasId = canvasId;
        this.config = config;
        this.board = new Board(config.size, config.size, canvasId);
        this.setupEntities();
    }

    private setupEntities(): void {
        this.hunters = [];
        this.preys = [];
        
        if (this.config.mode === 'sandbox') return;

        const hStrat = new HunterMove();
        const pStrat = new PreyMove();

        for (let i = 0; i < this.config.hunters; i++) {
            const h = new Hunter(`H${i}`, this.config.hunterDmg, 0, 0, hStrat);
            this.randomPlace(h);
            this.hunters.push(h);
        }
        for (let i = 0; i < this.config.preys; i++) {
            const strat = (i === 0) ? null : pStrat;
            const p = new Prey(`P${i}`, this.config.preyDmg, 0, 0, strat);
            this.randomPlace(p);
            this.preys.push(p);
        }
        for (let i = 0; i < this.config.obstacles; i++) {
            this.randomPlace(new Obstacle(`Obs${i}`, 0, 0));
        }
    }

    private randomPlace(p: Player): void {
        let placed = false;
        const grid = this.board.getGrid();
        let attempts = 0;
        while (!placed && attempts < 1000) {
            const x = Math.floor(Math.random() * this.config.size);
            const y = Math.floor(Math.random() * this.config.size);
            if (grid[y][x] === null) {
                p.x = x; p.y = y;
                this.board.placePlayer(p);
                placed = true;
            }
            attempts++;
        }
    }

    public addEntityManual(type: string, x: number, y: number): void {
        if (x < 0 || x >= this.config.size || y < 0 || y >= this.config.size) return;
        if (this.board.getGrid()[y][x] !== null) return;

        if (type === 'Hunter') {
            const h = new Hunter(`H${Date.now()}`, this.config.hunterDmg, x, y, new HunterMove());
            this.hunters.push(h);
            this.board.placePlayer(h);
        } else if (type === 'Prey') {
            const p = new Prey(`P${Date.now()}`, this.config.preyDmg, x, y, new PreyMove());
            this.preys.push(p);
            this.board.placePlayer(p);
        } else if (type === 'Obstacle') {
            const o = new Obstacle(`O${Date.now()}`, x, y);
            this.board.placePlayer(o);
        }
        
        audioManager.playClick();
        this.board.drawBoard([], null);
    }

    public drawInitialBoard(): void {
        this.board.drawBoard([], null);
    }

    private isAlive(p: Player): boolean {
        const grid = this.board.getGrid();
        return p.y >= 0 && p.y < this.config.size && p.x >= 0 && p.x < this.config.size && grid[p.y][p.x] === p;
    }

    public handleInput(key: string): void {
        if (this.config.mode !== 'singleplayer') return;
        const user = this.preys[0];
        if (!user || !this.isAlive(user)) return;

        let moveDx = 0, moveDy = 0;
        if (key === 'w' || key === 'W') moveDy = -1;
        if (key === 's' || key === 'S') moveDy = 1;
        if (key === 'a' || key === 'A') moveDx = -1;
        if (key === 'd' || key === 'D') moveDx = 1;

        if (moveDx !== 0 || moveDy !== 0) {
            this.board.movePlayer(user, user.x + moveDx, user.y + moveDy);
            return;
        }

        let shootDx = 0, shootDy = 0;
        if (key === 'ArrowUp') shootDy = -1;
        if (key === 'ArrowDown') shootDy = 1;
        if (key === 'ArrowLeft') shootDx = -1;
        if (key === 'ArrowRight') shootDx = 1;

        if (shootDx !== 0 || shootDy !== 0) {
            audioManager.playShoot();
            this.projectiles.push({ x: user.x, y: user.y, dx: shootDx * 0.3, dy: shootDy * 0.3 });
        }
    }

    public start(): void {
        this.stop();
        
        this.gameInterval = setInterval(() => {
            this.hunters.forEach(h => { if (this.isAlive(h)) h.performMove(this.board); });
            this.preys.forEach((p, i) => { 
                if (this.isAlive(p) && p.strategy) p.performMove(this.board); 
            });
            this.checkWinCondition();
        }, 400);

        this.projInterval = setInterval(() => {
            if (this.projectiles.length > 0) {
                for (let i = this.projectiles.length - 1; i >= 0; i--) {
                    const proj = this.projectiles[i];
                    proj.x += proj.dx;
                    proj.y += proj.dy;

                    if (proj.x < 0 || proj.x >= this.config.size || proj.y < 0 || proj.y >= this.config.size) {
                        this.projectiles.splice(i, 1);
                        continue;
                    }

                    const gridX = Math.floor(proj.x);
                    const gridY = Math.floor(proj.y);
                    const cell = this.board.getGrid()[gridY][gridX];
                    
                    if (cell) {
                        if (cell.type === 'Hunter') {
                            audioManager.playHit();
                            cell.takeDamage(this.config.preyDmg);
                            if (cell.vitality <= 0 && this.board.getGrid()[cell.y][cell.x] === cell) {
                                this.board.getGrid()[cell.y][cell.x] = null;
                            }
                        }
                        if (cell.type !== 'Prey') {
                            this.projectiles.splice(i, 1);
                        }
                    }
                }
                this.checkWinCondition();
            }

            const playerChar = (this.config.mode === 'singleplayer' ? this.preys[0] : null);
            this.board.drawBoard(this.projectiles, playerChar); 
        }, 16); 
    }

    private checkWinCondition() {
        const hAlive = this.hunters.filter(h => this.isAlive(h)).length;
        const pAlive = this.preys.filter(p => this.isAlive(p)).length;

        if (this.hunters.length > 0 && this.preys.length > 0 && (hAlive === 0 || pAlive === 0)) {
            this.stop();
            const playerChar = (this.config.mode === 'singleplayer' ? this.preys[0] : null);
            this.board.drawBoard(this.projectiles, playerChar);
            
            const playerWon = hAlive === 0;
            const msg = playerWon ? "¡VICTORIA DE LAS PRESAS!" : "¡LOS CAZADORES GANAN!";
            
            window.dispatchEvent(new CustomEvent('game-over', { detail: { msg: msg, win: playerWon } }));
        }
    }

    public stop(): void {
        if (this.gameInterval) clearInterval(this.gameInterval);
        if (this.projInterval) clearInterval(this.projInterval);
        this.gameInterval = null;
        this.projInterval = null;
    }
}