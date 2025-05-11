class AudioManager {
    constructor() {
        this.sounds = {};
        this.soundsEnabled = true; // Novo estado para controlar os efeitos sonoros
        this.soundPaths = {
            distribuirCartas: 'assets/audio/distribuir.wav',
            jogarCarta: 'assets/audio/jogar.mp3',
            truco: 'assets/audio/truco.wav',
            vitoria: 'assets/audio/vitoria.mp3',
            derrota: 'assets/audio/derrota.mp3'
        };

        // Inicializa e carrega todos os sons
        Object.entries(this.soundPaths).forEach(([name, path]) => {
            const audio = new Audio(path);
            audio.addEventListener('error', (e) => {
                console.error(`Erro ao carregar o som ${name}:`, e);
            });
            audio.volume = 0.5; // Volume padrão
            this.sounds[name] = audio;
            audio.load();
        });

        // Música de fundo
        this.backgroundMusic = new Audio('assets/audio/background.mp3');
        this.backgroundMusic.addEventListener('error', (e) => {
            console.error('Erro ao carregar a música de fundo:', e);
        });
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.05; // Volume mais baixo para música de fundo
        this.backgroundMusic.load();
    }

    async play(soundName) {
        const sound = this.sounds[soundName];
        if (!sound) {
            console.error(`Som '${soundName}' não encontrado`);
            return;
        }

        try {
            sound.currentTime = 0; // Reinicia o som se já estiver tocando
            await sound.play();
            
            // Limita a duração do som de distribuição de cartas
            if (soundName === 'distribuirCartas') {
                setTimeout(() => {
                    sound.pause();
                    sound.currentTime = 0;
                }, 5000); // 5 segundos
            }
        } catch (error) {
            console.error(`Erro ao tocar o som ${soundName}:`, error);
            // Tenta recarregar o som em caso de erro
            sound.load();
        }
    }

    setVolume(volume) {
        Object.values(this.sounds).forEach(sound => {
            sound.volume = Math.max(0, Math.min(1, volume));
        });
        this.soundsEnabled = volume > 0;
    }

    toggleSoundEffects() {
        if (this.soundsEnabled) {
            this.setVolume(0);
        } else {
            this.setVolume(0.5);
        }
        return !this.soundsEnabled;
    }

    isSoundEnabled() {
        return this.soundsEnabled;
    }

    setBackgroundMusicVolume(volume) {
        this.backgroundMusic.volume = Math.max(0, Math.min(1, volume));
    }

    playBackgroundMusic() {
        this.backgroundMusic.play().catch(error => console.log('Erro ao tocar música de fundo:', error));
    }

    pauseBackgroundMusic() {
        this.backgroundMusic.pause();
    }

    stopBackgroundMusic() {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
    }

    enableBackgroundMusic() {
        this.backgroundMusic.volume = 0.05;
        this.playBackgroundMusic();
    }

    disableBackgroundMusic() {
        this.stopBackgroundMusic();
        this.backgroundMusic.volume = 0;
    }
}

// Exporta a classe para uso global
window.AudioManager = AudioManager;

// Controle de efeitos sonoros e música de fundo
function setupAudioControls() {
    const soundEffectsBtn = document.getElementById('sound-effects');
    const backgroundMusicBtn = document.getElementById('background-music');

    if (soundEffectsBtn && window.game && window.game.audioManager) {
        soundEffectsBtn.addEventListener('click', function() {
            const audioManager = window.game.audioManager;
            const isMuted = audioManager.toggleSoundEffects();
            
            this.textContent = isMuted ? '🔇' : '🔊';
            this.title = isMuted ? 'Clique para ativar os efeitos sonoros' : 'Clique para desativar os efeitos sonoros';
        });
    }

    if (backgroundMusicBtn && window.game && window.game.audioManager) {
        backgroundMusicBtn.addEventListener('click', function() {
            const audioManager = window.game.audioManager;
            if (this.textContent === '🎵') {
                audioManager.disableBackgroundMusic();
                this.textContent = '🎵🚫';
                this.title = 'Clique para ativar a música de fundo';
            } else {
                audioManager.enableBackgroundMusic();
                this.textContent = '🎵';
                this.title = 'Clique para desativar a música de fundo';
            }
        });
    }
}

// Exporta a classe e a função de setup para uso global
window.AudioManager = AudioManager;
window.setupAudioControls = setupAudioControls;