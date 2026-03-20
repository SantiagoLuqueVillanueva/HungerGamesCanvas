import { HungerGames, type GameConfig } from "./HungerGames";
import { audioManager } from "./AudioManager";

window.onload = () => {
    let game: HungerGames | null = null;
    let selectedMode: 'sandbox' | 'singleplayer' = 'sandbox';
    
    const menu = document.getElementById('menu-overlay') as HTMLElement;
    const modeSelector = document.getElementById('mode-selector') as HTMLElement;
    const configPanel = document.getElementById('config-panel') as HTMLElement;
    const infoPanel = document.getElementById('info-panel') as HTMLElement;
    const menuTitle = document.getElementById('menu-title') as HTMLElement;
    const editorPalette = document.getElementById('editor-palette') as HTMLElement;
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    
    const wrapHunters = document.getElementById('wrap-hunters') as HTMLElement;
    const wrapPreys = document.getElementById('wrap-preys') as HTMLElement;
    const wrapObstacles = document.getElementById('wrap-obstacles') as HTMLElement;
    
    const btnSandbox = document.getElementById('btn-sandbox') as HTMLButtonElement;
    const btnSingle = document.getElementById('btn-single') as HTMLButtonElement;
    const btnInfo = document.getElementById('btn-info') as HTMLButtonElement;
    const btnCloseInfo = document.getElementById('btn-close-info') as HTMLButtonElement;
    const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
    const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
    const btnStartSim = document.getElementById('btn-start-sim') as HTMLButtonElement;

    document.body.addEventListener('click', () => {
        if (!menu.classList.contains('hidden')) audioManager.playMenuBgm();
    }, { once: true });

    btnInfo.onclick = () => {
        audioManager.playClick();
        modeSelector.classList.add('hidden');
        btnInfo.classList.add('hidden');
        infoPanel.classList.remove('hidden');
        menuTitle.innerText = "Instrucciones de Juego";
    };

    btnCloseInfo.onclick = () => {
        audioManager.playClick();
        infoPanel.classList.add('hidden');
        modeSelector.classList.remove('hidden');
        btnInfo.classList.remove('hidden');
        menuTitle.innerText = "Elige un Modo de Juego";
    };

    btnSandbox.onclick = () => {
        audioManager.playClick();
        selectedMode = 'sandbox';
        wrapHunters.classList.add('hidden');
        wrapPreys.classList.add('hidden');
        wrapObstacles.classList.add('hidden');
        modeSelector.classList.add('hidden');
        btnInfo.classList.add('hidden');
        configPanel.classList.remove('hidden');
        menuTitle.innerText = "Ajustes del Tablero";
    };

    btnSingle.onclick = () => {
        audioManager.playClick();
        selectedMode = 'singleplayer';
        wrapHunters.classList.remove('hidden');
        wrapPreys.classList.remove('hidden');
        wrapObstacles.classList.remove('hidden');
        modeSelector.classList.add('hidden');
        btnInfo.classList.add('hidden');
        configPanel.classList.remove('hidden');
        menuTitle.innerText = "Ajustes Supervivencia";
    };

    const getConfigFromUI = (): GameConfig => {
        return {
            mode: selectedMode,
            hunters: parseInt((document.getElementById('inp-hunters') as HTMLInputElement).value) || 0,
            hunterDmg: parseInt((document.getElementById('inp-hunter-dmg') as HTMLInputElement).value),
            preys: parseInt((document.getElementById('inp-preys') as HTMLInputElement).value) || 0,
            preyDmg: parseInt((document.getElementById('inp-prey-dmg') as HTMLInputElement).value),
            obstacles: parseInt((document.getElementById('inp-obstacles') as HTMLInputElement).value) || 0,
            size: parseInt((document.getElementById('inp-size') as HTMLInputElement).value)
        };
    };

    startBtn.onclick = () => {
        audioManager.playClick();
        const config = getConfigFromUI();
        
        if (game) game.stop();
        game = new HungerGames(config, "gameCanvas");
        
        menu.classList.add('hidden');
        
        if (config.mode === 'sandbox') {
            editorPalette.classList.remove('hidden');
            resetBtn.classList.remove('hidden');
            game.drawInitialBoard();
        } else {
            resetBtn.classList.remove('hidden');
            audioManager.playActionBgm();
            game.start();
        }
    };

    btnStartSim.onclick = () => {
        audioManager.playClick();
        editorPalette.classList.add('hidden');
        audioManager.playSandboxBgm();
        game?.start();
    };

    resetBtn.onclick = () => {
        audioManager.playClick();
        audioManager.playMenuBgm();
        
        if (game) game.stop();
        menu.classList.remove('hidden');
        resetBtn.classList.add('hidden');
        editorPalette.classList.add('hidden');
        configPanel.classList.add('hidden');
        infoPanel.classList.add('hidden');
        modeSelector.classList.remove('hidden');
        btnInfo.classList.remove('hidden');
        menuTitle.innerText = "Elige un Modo de Juego";
    };

    window.addEventListener('game-over', (e: any) => {
        audioManager.stopBgm();
        if (e.detail.win) audioManager.playWin();
        else audioManager.playLose();

        menu.classList.remove('hidden');
        resetBtn.classList.add('hidden');
        editorPalette.classList.add('hidden');
        configPanel.classList.add('hidden');
        infoPanel.classList.add('hidden');
        modeSelector.classList.remove('hidden');
        btnInfo.classList.remove('hidden');
        menuTitle.innerText = e.detail.msg;
    });

    document.addEventListener('keydown', (e) => {
        if (game && menu.classList.contains('hidden') && editorPalette.classList.contains('hidden')) {
            game.handleInput(e.key);
        }
    });

    const paletteItems = document.querySelectorAll('.palette-item');
    paletteItems.forEach(item => {
        item.addEventListener('dragstart', (e: any) => {
            const type = (e.target as HTMLElement).getAttribute('data-type');
            e.dataTransfer.setData('text/plain', type);
        });
    });

    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer?.getData('text/plain');
        if (!type || !game || selectedMode !== 'sandbox') return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const cellSize = canvas.width / game.config.size;
        const gridX = Math.floor(x / cellSize);
        const gridY = Math.floor(y / cellSize);

        game.addEntityManual(type, gridX, gridY);
    });
};