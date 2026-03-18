import { HungerGames, type GameConfig } from "./HungerGames";

window.onload = () => {
    let game: HungerGames | null = null;
    let selectedMode: 'sandbox' | 'singleplayer' = 'sandbox';
    
    const menu = document.getElementById('menu-overlay') as HTMLElement;
    const modeSelector = document.getElementById('mode-selector') as HTMLElement;
    const configPanel = document.getElementById('config-panel') as HTMLElement;
    const infoPanel = document.getElementById('info-panel') as HTMLElement;
    const menuTitle = document.getElementById('menu-title') as HTMLElement;
    
    const btnSandbox = document.getElementById('btn-sandbox') as HTMLButtonElement;
    const btnSingle = document.getElementById('btn-single') as HTMLButtonElement;
    const btnInfo = document.getElementById('btn-info') as HTMLButtonElement;
    const btnCloseInfo = document.getElementById('btn-close-info') as HTMLButtonElement;
    const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
    const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

    btnInfo.onclick = () => {
        modeSelector.classList.add('hidden');
        btnInfo.classList.add('hidden');
        infoPanel.classList.remove('hidden');
        menuTitle.innerText = "Instrucciones de Juego";
    };

    btnCloseInfo.onclick = () => {
        infoPanel.classList.add('hidden');
        modeSelector.classList.remove('hidden');
        btnInfo.classList.remove('hidden');
        menuTitle.innerText = "Elige un Modo de Juego";
    };

    btnSandbox.onclick = () => {
        selectedMode = 'sandbox';
        modeSelector.classList.add('hidden');
        btnInfo.classList.add('hidden');
        configPanel.classList.remove('hidden');
        menuTitle.innerText = "Ajustes Sandbox";
    };

    btnSingle.onclick = () => {
        selectedMode = 'singleplayer';
        modeSelector.classList.add('hidden');
        btnInfo.classList.add('hidden');
        configPanel.classList.remove('hidden');
        menuTitle.innerText = "Ajustes Supervivencia";
    };

    const getConfigFromUI = (): GameConfig => {
        return {
            mode: selectedMode,
            hunters: parseInt((document.getElementById('inp-hunters') as HTMLInputElement).value),
            hunterDmg: parseInt((document.getElementById('inp-hunter-dmg') as HTMLInputElement).value),
            preys: parseInt((document.getElementById('inp-preys') as HTMLInputElement).value),
            preyDmg: parseInt((document.getElementById('inp-prey-dmg') as HTMLInputElement).value),
            obstacles: parseInt((document.getElementById('inp-obstacles') as HTMLInputElement).value),
            size: parseInt((document.getElementById('inp-size') as HTMLInputElement).value)
        };
    };

    startBtn.onclick = () => {
        const config = getConfigFromUI();
        if (game) game.stop();
        game = new HungerGames(config, "gameCanvas");
        
        menu.classList.add('hidden');
        resetBtn.classList.remove('hidden');
        game.start();
    };

    resetBtn.onclick = () => {
        if (game) game.stop();
        menu.classList.remove('hidden');
        resetBtn.classList.add('hidden');
        configPanel.classList.add('hidden');
        infoPanel.classList.add('hidden');
        modeSelector.classList.remove('hidden');
        btnInfo.classList.remove('hidden');
        menuTitle.innerText = "Elige un Modo de Juego";
    };

    window.addEventListener('game-over', (e: any) => {
        menu.classList.remove('hidden');
        resetBtn.classList.add('hidden');
        configPanel.classList.add('hidden');
        infoPanel.classList.add('hidden');
        modeSelector.classList.remove('hidden');
        btnInfo.classList.remove('hidden');
        menuTitle.innerText = e.detail;
    });

    document.addEventListener('keydown', (e) => {
        if (game && menu.classList.contains('hidden')) {
            game.handleInput(e.key);
        }
    });
};