import type { Player } from "./Player";
import { audioManager } from "../AudioManager";

export class Board {
    private grid: (Player | null)[][];
    private width: number;
    private height: number;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private cellSize: number;
    private sprites: { [key: string]: HTMLImageElement } = {};

    constructor(width: number, height: number, canvasId: string) {
        this.width = width;
        this.height = height;
        this.grid = Array.from({ length: height }, () => Array(width).fill(null));
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;
        this.cellSize = this.canvas.width / this.width;

        this.sprites.hunter = new Image(); this.sprites.hunter.src = "/assets/hunter.png"; 
        this.sprites.prey = new Image(); this.sprites.prey.src = "/assets/prey.png";
        this.sprites.player = new Image(); this.sprites.player.src = "/assets/player.png";
        this.sprites.obstacle = new Image(); this.sprites.obstacle.src = "/assets/rock.png";
        this.sprites.grass = new Image(); this.sprites.grass.src = "/assets/grass.png";
    }

    public getGrid(): (Player | null)[][] { return this.grid; }
    public getWidth(): number { return this.width; }
    public getHeight(): number { return this.height; }

    public placePlayer(p: Player): void {
        this.grid[p.y][p.x] = p;
        p.visualX = p.x;
        p.visualY = p.y;
    }

    public movePlayer(p: Player, newX: number, newY: number): void {
        if (newX < 0 || newX >= this.width || newY < 0 || newY >= this.height) return;
        const objective = this.grid[newY][newX];

        if (objective === null) {
            if (this.grid[p.y][p.x] === p) this.grid[p.y][p.x] = null;
            p.setPosition(newX, newY);
            this.grid[newY][newX] = p;
        } else if (objective.type !== "Obstacle" && objective.type !== p.type) {
            audioManager.playHit();

            const dmg1 = Math.floor(Math.random() * (p.attackPower - 5 + 1)) + 5;
            const dmg2 = Math.floor(Math.random() * (objective.attackPower - 5 + 1)) + 5;
            objective.takeDamage(dmg1);
            p.takeDamage(dmg2);
            if (p.vitality <= 0 && this.grid[p.y][p.x] === p) this.grid[p.y][p.x] = null;
            if (objective.vitality <= 0) {
                if (p.vitality > 0) {
                    if (this.grid[p.y][p.x] === p) this.grid[p.y][p.x] = null;
                    p.setPosition(newX, newY);
                    this.grid[newY][newX] = p;
                } else {
                    this.grid[newY][newX] = null;
                }
            }
        }
    }

    public drawBoard(projectiles: {x: number, y: number}[] = [], playerCharacter: Player | null = null): void {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.sprites.grass.complete) {
                    this.ctx.drawImage(this.sprites.grass, x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const p = this.grid[y][x];
                if (!p) continue;

                p.visualX += (p.x - p.visualX) * 0.3;
                p.visualY += (p.y - p.visualY) * 0.3;

                const drawX = p.visualX * this.cellSize;
                const drawY = p.visualY * this.cellSize;

                let img = null;
                if (p.type === "Obstacle") {
                    img = this.sprites.obstacle;
                } else if (p.type === "Hunter") {
                    img = this.sprites.hunter;
                } else if (p.type === "Prey") {
                    if (playerCharacter && p === playerCharacter) {
                        this.ctx.fillStyle = "rgba(255, 255, 0, 0.8)"; 
                        this.ctx.beginPath();
                        this.ctx.arc(drawX + this.cellSize / 2, drawY + this.cellSize / 2, this.cellSize / 1.5, 0, Math.PI * 2);
                        this.ctx.fill();
                        img = this.sprites.player;
                    } else {
                        img = this.sprites.prey;
                    }
                }

                if (img && img.complete) {
                    this.ctx.drawImage(img, drawX, drawY, this.cellSize, this.cellSize);
                }

                if (p.type !== "Obstacle") {
                    this.drawHealthBar(p, drawX, drawY);
                }
            }
        }

        this.ctx.fillStyle = "#f1c40f"; 
        for (const proj of projectiles) {
            this.ctx.beginPath();
            this.ctx.arc(
                proj.x * this.cellSize + this.cellSize / 2, 
                proj.y * this.cellSize + this.cellSize / 2, 
                this.cellSize / 4, 
                0, Math.PI * 2
            );
            this.ctx.fill();
        }
    }

    private drawHealthBar(p: Player, x: number, y: number) {
        const hpPerc = p.vitality / p.maxVitality;
        const width = this.cellSize * 0.8;
        const offsetX = (this.cellSize - width) / 2;
        this.ctx.fillStyle = "rgba(0,0,0,0.5)";
        this.ctx.fillRect(x + offsetX, y + 2, width, 5);
        this.ctx.fillStyle = hpPerc > 0.5 ? "#2ecc71" : hpPerc > 0.2 ? "#f1c40f" : "#e74c3c";
        this.ctx.fillRect(x + offsetX, y + 2, width * hpPerc, 5);
    }
}