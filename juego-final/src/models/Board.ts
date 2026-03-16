import type { Player } from "./Player";

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

        this.loadSprites();
    }

    private loadSprites() {
        const sources = {
            hunter: "/assets/hunter.png",
            prey: "/assets/prey.png",
            obstacle: "/assets/rock.png",
            grass: "/assets/grass.png"
        };

        for (const [key, src] of Object.entries(sources)) {
            const img = new Image();
            img.src = src;
            this.sprites[key] = img;
        }
    }

    public getGrid(): (Player | null)[][] { return this.grid; }
    public getWidth(): number { return this.width; }
    public getHeight(): number { return this.height; }

    public placePlayer(p: Player): void {
        this.grid[p.y][p.x] = p;
    }

    public movePlayer(p: Player, newX: number, newY: number): void {
        const objective = this.grid[newY][newX];
        if (objective === null) {
            this.grid[p.y][p.x] = null;
            p.setPosition(newX, newY);
            this.grid[newY][newX] = p;
        } else if (objective.type !== "Obstacle" && objective.type !== p.type) {
            const dmg1 = Math.floor(Math.random() * (p.attackPower - 5 + 1)) + 5;
            const dmg2 = Math.floor(Math.random() * (objective.attackPower - 5 + 1)) + 5;
            objective.takeDamage(dmg1);
            p.takeDamage(dmg2);
            if (p.vitality <= 0) this.grid[p.y][p.x] = null;
            if (objective.vitality <= 0) {
                if (p.vitality > 0) {
                    this.grid[p.y][p.x] = null;
                    p.setPosition(newX, newY);
                    this.grid[newY][newX] = p;
                } else { this.grid[newY][newX] = null; }
            }
        }
    }

    public drawBoard(): void {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.sprites.grass.complete) {
                    this.ctx.drawImage(this.sprites.grass, x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                } else {
                    this.ctx.fillStyle = "#27ae60";
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const p = this.grid[y][x];
                if (!p) continue;

                const drawX = x * this.cellSize;
                const drawY = y * this.cellSize;

                let img = null;
                if (p.type === "Hunter") img = this.sprites.hunter;
                else if (p.type === "Prey") img = this.sprites.prey;
                else if (p.type === "Obstacle") img = this.sprites.obstacle;

                if (img && img.complete) {
                    this.ctx.drawImage(img, drawX, drawY, this.cellSize, this.cellSize);
                } else {
                    this.ctx.fillStyle = p.type === "Hunter" ? "red" : "blue";
                    this.ctx.beginPath();
                    this.ctx.arc(drawX + this.cellSize/2, drawY + this.cellSize/2, this.cellSize/3, 0, Math.PI*2);
                    this.ctx.fill();
                }

                if (p.type !== "Obstacle") {
                    this.drawHealthBar(p, drawX, drawY);
                }
            }
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