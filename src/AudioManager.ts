export class AudioManager {
    private bgmMenu = new Audio("/assets/bgm_menu.mp3");
    private bgmSandbox = new Audio("/assets/bgm_sandbox.mp3");
    private bgmAction = new Audio("/assets/bgm_action.mp3");

    private sfxClick = new Audio("/assets/sfx_click.mp3");
    private sfxShoot = new Audio("/assets/sfx_shoot.mp3");
    private sfxHit = new Audio("/assets/sfx_hit.mp3");
    private sfxWin = new Audio("/assets/sfx_win.mp3");
    private sfxLose = new Audio("/assets/sfx_lose.mp3");

    private currentBgm: HTMLAudioElement | null = null;

    constructor() {
        this.bgmMenu.loop = true;
        this.bgmSandbox.loop = true;
        this.bgmAction.loop = true;

        this.bgmMenu.volume = 0.4;
        this.bgmSandbox.volume = 0.4;
        this.bgmAction.volume = 0.4;
        this.sfxShoot.volume = 0.3; 
        this.sfxHit.volume = 0.5;
        this.sfxClick.volume = 0.8;
    }

    public playClick() { this.playClone(this.sfxClick); }
    public playShoot() { this.playClone(this.sfxShoot); }
    public playHit() { this.playClone(this.sfxHit); }
    public playWin() { this.playClone(this.sfxWin); }
    public playLose() { this.playClone(this.sfxLose); }

    public playMenuBgm() { this.switchBgm(this.bgmMenu); }
    public playSandboxBgm() { this.switchBgm(this.bgmSandbox); }
    public playActionBgm() { this.switchBgm(this.bgmAction); }
    
    public stopBgm() {
        if (this.currentBgm) {
            this.currentBgm.pause();
            this.currentBgm.currentTime = 0;
            this.currentBgm = null;
        }
    }

    private switchBgm(newBgm: HTMLAudioElement) {
        if (this.currentBgm === newBgm) return;
        this.stopBgm();
        this.currentBgm = newBgm;
        this.currentBgm.play().catch(() => console.log("Esperando interacción para reproducir música..."));
    }

    private playClone(audio: HTMLAudioElement) {
        const clone = audio.cloneNode() as HTMLAudioElement;
        clone.volume = audio.volume;
        clone.play().catch(() => {});
    }
}

export const audioManager = new AudioManager();