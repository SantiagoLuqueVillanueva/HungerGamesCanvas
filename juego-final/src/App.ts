import { HungerGames, type GameConfig } from "./HungerGames";
import { audioManager } from "./AudioManager"; // <-- IMPORTAMOS EL AUDIO

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

    // --- ACTIVAR MÚSICA DEL MENÚ AL PRIMER CLIC EN CUALQUIER PARTE ---
    // (Esto evita bloqueos del navegador por autoplay)
    document.body.addEventListener('click', () => {
        if (menu.classList.contains('hidden') === false) {
            audioManager.playMenuBgm();
        }
    }, { once: true });

    // --- PANEL DE INSTRUCCIONES ---
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

    // --- SELECCIÓN DE MODO ---
    btnSandbox.onclick = () => {
        audioManager.playClick();
        selectedMode = 'sandbox';
        modeSelector.classList.add('hidden');
        btnInfo.classList.add('hidden');
        configPanel.classList.remove('hidden');
        menuTitle.innerText = "Ajustes Sandbox";
    };

    btnSingle.onclick = () => {
        audioManager.playClick();
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

    // --- INICIAR PARTIDA ---
    startBtn.onclick = () => {
        audioManager.playClick();
        const config = getConfigFromUI();
        
        // Elegimos la música de batalla según el modo
        if (config.mode === 'sandbox') audioManager.playSandboxBgm();
        else audioManager.playActionBgm();

        if (game) game.stop();
        game = new HungerGames(config, "gameCanvas");
        
        menu.classList.add('hidden');
        resetBtn.classList.remove('hidden');
        game.start();
    };

    // --- VOLVER AL MENÚ ---
    resetBtn.onclick = () => {
        audioManager.playClick();
        audioManager.playMenuBgm(); // Volvemos a la música tranquila
        
        if (game) game.stop();
        menu.classList.remove('hidden');
        resetBtn.classList.add('hidden');
        configPanel.classList.add('hidden');
        infoPanel.classList.add('hidden');
        modeSelector.classList.remove('hidden');
        btnInfo.classList.remove('hidden');
        menuTitle.innerText = "Elige un Modo de Juego";
    };

    // --- FIN DE PARTIDA ---
    window.addEventListener('game-over', (e: any) => {
        audioManager.stopBgm(); // Paramos la música de batalla
        
        // Reproducimos victoria o derrota según el evento
        if (e.detail.win) {
            audioManager.playWin();
        } else {
            audioManager.playLose();
        }

        menu.classList.remove('hidden');
        resetBtn.classList.add('hidden');
        configPanel.classList.add('hidden');
        infoPanel.classList.add('hidden');
        modeSelector.classList.remove('hidden');
        btnInfo.classList.remove('hidden');
        menuTitle.innerText = e.detail.msg; // El mensaje ("Victoria" o "Derrota")
    });

    // --- CONTROLES ---
    document.addEventListener('keydown', (e) => {
        if (game && menu.classList.contains('hidden')) {
            game.handleInput(e.key);
        }
    });
};