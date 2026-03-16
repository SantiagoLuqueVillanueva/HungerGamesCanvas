import { HungerGames } from "./HungerGames";

window.onload = () => {
    const game = new HungerGames(4, 4, 15, "gameCanvas");
    
    const menu = document.getElementById('menu-overlay');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const menuTitle = document.getElementById('menu-title');

    if (startBtn) {
        startBtn.onclick = () => {
            game.reset();
            menu?.classList.add('hidden');
            resetBtn?.classList.remove('hidden');
            game.start();
        };
    }

    if (resetBtn) {
        resetBtn.onclick = () => {
            game.reset();
            menu?.classList.remove('hidden');
            resetBtn?.classList.add('hidden');
            if (menuTitle) menuTitle.innerText = "¿Listo para la revancha?";
        };
    }

    window.addEventListener('game-over', (e: any) => {
        menu?.classList.remove('hidden');
        resetBtn?.classList.add('hidden');
        if (menuTitle) menuTitle.innerText = e.detail;
        if (startBtn) startBtn.innerText = "JUGAR DE NUEVO";
    });
};