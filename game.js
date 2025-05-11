// Constantes do jogo
const CARTAS_VALORES = {
    '4': 1, '5': 2, '6': 3, '7': 4, 'Q': 5, 'J': 6, 'K': 7, 'A': 8, '2': 9, '3': 10
};

const NAIPES_ORDEM = {
    '♣': 4, // Paus (mais forte)
    '♥': 3, // Copas
    '♠': 2, // Espadas
    '♦': 1  // Ouros (mais fraco)
};

class TrucoGame {
    constructor() {
        this.baralho = [];
        this.jogadores = ['Você', 'Jogador 2', 'Jogador 3', 'Parceiro'];
        this.maos = [[], [], [], []];
        this.pontos = [0, 0]; // [Nós, Eles]
        this.valorRodada = 1;
        this.turno = 0;
        this.cartasJogadas = [];
        this.vira = null;
        this.manilhas = [];
        this.ultimoVencedor = 0; // Jogador que ganhou a última rodada
        this.vitoriasRodada = [0, 0]; // Vitórias na rodada atual [Nós, Eles]
        this.numeroMao = 0; // Número da mão atual (1-3)
        this.audioManager = new AudioManager();
        this.inicializarBaralho();
        this.setupEventListeners();
    }

    inicializarBaralho() {
        const naipes = ['♠', '♥', '♦', '♣'];
        const valores = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];

        for (let naipe of naipes) {
            for (let valor of valores) {
                this.baralho.push(valor + naipe);
            }
        }
    }

    embaralhar() {
        for (let i = this.baralho.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.baralho[i], this.baralho[j]] = [this.baralho[j], this.baralho[i]];
        }
    }

    distribuirCartas() {
        this.embaralhar();
        for (let i = 0; i < 4; i++) {
            this.maos[i] = this.baralho.slice(i * 3, (i + 1) * 3);
        }
        this.vira = this.baralho[12]; // Carta que define as manilhas
        this.definirManilhas();
        this.audioManager.play('distribuirCartas');
        this.audioManager.playBackgroundMusic(); // Inicia a música de fundo
        this.renderizarMao();
    }

    definirManilhas() {
        const valorVira = this.vira[0];
        const valores = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
        const indexVira = valores.indexOf(valorVira);
        const valorManilha = valores[(indexVira + 1) % valores.length];

        // Define as cartas manilhas
        this.manilhas = [`${valorManilha}♣`, `${valorManilha}♥`, `${valorManilha}♠`, `${valorManilha}♦`];
    }

    valorCarta(carta) {
        const naipe = carta.slice(-1); // Pega o último caractere (naipe)
        const valor = carta[0];    // Pega o primeiro caractere (valor)
        
        // Se for uma manilha
        if (this.manilhas.includes(carta)) {
            // Retorna 15 (base das manilhas) + valor do naipe (1-4)
            return 15 + NAIPES_ORDEM[naipe];
        }

        // Se não for manilha, retorna o valor normal da carta
        return CARTAS_VALORES[valor] || 0;
    }

    jogarCarta(jogador, carta) {
        if (jogador !== this.turno) return false;

        const index = this.maos[jogador].indexOf(carta);
        if (index === -1) return false;

        this.maos[jogador].splice(index, 1);
        this.cartasJogadas.push({ jogador, carta });
        this.audioManager.play('jogarCarta');
        this.turno = (this.turno + 1) % 4;
        this.renderizarMao();

        if (this.cartasJogadas.length === 4) {
            // Adiciona um delay de 3 segundos antes de resolver a rodada
            setTimeout(() => {
                this.resolverRodada();
            }, 3000);
        } else {
            this.jogadaIA();
        }

        return true;
    }

    resolverRodada() {
        let melhorCarta = this.cartasJogadas[0];

        for (let i = 1; i < this.cartasJogadas.length; i++) {
            if (this.valorCarta(this.cartasJogadas[i].carta) > this.valorCarta(melhorCarta.carta)) {
                melhorCarta = this.cartasJogadas[i];
            }
        }

        // Atualiza o vencedor da mão atual
        const equipeVencedora = melhorCarta.jogador % 2;
        this.ultimoVencedor = melhorCarta.jogador;
        this.vitoriasRodada[equipeVencedora]++;
        this.numeroMao++;

        // Verifica se alguma equipe ganhou 2 mãos
        if (this.vitoriasRodada[0] >= 2 || this.vitoriasRodada[1] >= 2 || this.numeroMao >= 3) {
            // Determina o vencedor da rodada
            const vencedorRodada = this.vitoriasRodada[0] > this.vitoriasRodada[1] ? 0 : 1;
            this.pontos[vencedorRodada] += this.valorRodada;

            // Verifica fim do jogo
            if (this.pontos[vencedorRodada] >= 12) {
                this.fimDeJogo(vencedorRodada);
            } else {
                this.iniciarNovaRodada();
            }
        } else {
            // Continua para a próxima mão
            this.cartasJogadas = [];
            this.turno = 0; // Sempre inicia com o jogador principal
            // Não distribui novas cartas, apenas limpa as cartas jogadas
            this.renderizarMao();
        }
    }

    iniciarNovaRodada() {
        this.cartasJogadas = [];
        this.vitoriasRodada = [0, 0];
        this.numeroMao = 0;
        this.valorRodada = 1; // Reseta o valor da rodada para 1
        this.turno = 0; // Sempre começa com o jogador principal (player1)
        this.distribuirCartas();
    }

    jogadaIA() {
        // Verifica se é a vez de um jogador IA
        if (this.turno === 0 || this.cartasJogadas.length >= 4) return;

        const maoIA = this.maos[this.turno];
        if (maoIA.length === 0) return;

        // Implementa um sistema avançado de estratégia para a IA
        const fazerJogadaIA = () => {
            const ehParceiro = this.turno === 3;
            const cartasOrdenadas = [...maoIA].sort((a, b) => this.valorCarta(b) - this.valorCarta(a));
            const temManilha = cartasOrdenadas.some(carta => this.manilhas.includes(carta));

            let carta;
            if (this.cartasJogadas.length === 0) {
                // Primeira jogada da rodada
                if (ehParceiro) {
                    // Parceiro joga a melhor carta se tiver manilha ou carta alta
                    carta = (temManilha || this.valorCarta(cartasOrdenadas[0]) >= 8) ?
                        cartasOrdenadas[0] : cartasOrdenadas[cartasOrdenadas.length - 1];
                } else {
                    // Adversários jogam carta baixa, exceto se tiverem manilha
                    carta = temManilha ? cartasOrdenadas[0] : cartasOrdenadas[cartasOrdenadas.length - 1];
                }
            } else {
                const melhorCartaJogada = this.cartasJogadas.reduce((melhor, jogada) =>
                    this.valorCarta(jogada.carta) > this.valorCarta(melhor.carta) ? jogada : melhor
                );
                const valorMelhorCarta = this.valorCarta(melhorCartaJogada.carta);
                const podeMatar = cartasOrdenadas.some(c => this.valorCarta(c) > valorMelhorCarta);
                const cartaParaMatar = cartasOrdenadas.find(c => this.valorCarta(c) > valorMelhorCarta);

                // Análise do contexto da rodada
                const ehUltimaJogada = this.cartasJogadas.length === 3;
                const parceiroTemMelhorCarta = melhorCartaJogada.jogador % 2 === this.turno % 2;

                if (ehParceiro) {
                    if (parceiroTemMelhorCarta) {
                        // Se o parceiro já está ganhando, joga a carta mais baixa
                        carta = cartasOrdenadas[cartasOrdenadas.length - 1];
                    } else if (podeMatar) {
                        // Tenta matar se puder, especialmente se for a última jogada
                        carta = cartaParaMatar;
                    } else {
                        // Se não pode matar, joga a mais baixa
                        carta = cartasOrdenadas[cartasOrdenadas.length - 1];
                    }
                } else {
                    if (parceiroTemMelhorCarta) {
                        // Se a equipe está ganhando, economiza cartas boas
                        carta = cartasOrdenadas[cartasOrdenadas.length - 1];
                    } else if (podeMatar && (ehUltimaJogada || this.valorCarta(cartaParaMatar) - valorMelhorCarta <= 2)) {
                        // Mata se for última jogada ou se a diferença de valor for pequena
                        carta = cartaParaMatar;
                    } else {
                        // Joga a carta mais baixa se não puder ou não valer a pena matar
                        carta = cartasOrdenadas[cartasOrdenadas.length - 1];
                    }
                }
            }

            if (carta) {
                // Simula um "pensamento" da IA antes de jogar
                setTimeout(() => {
                    this.jogarCarta(this.turno, carta);
                }, 1000); // Delay de 1 segundo antes de jogar
            }
        };

        // Inicia a jogada da IA com um pequeno delay inicial
        setTimeout(fazerJogadaIA, 1000);
    }

    avaliarForcaMao(mao) {
        let pontuacao = 0;
        const cartasOrdenadas = [...mao].sort((a, b) => this.valorCarta(b) - this.valorCarta(a));
        
        // Avalia manilhas (aumentado o valor)
        const qtdManilhas = cartasOrdenadas.filter(carta => this.manilhas.includes(carta)).length;
        pontuacao += qtdManilhas * 15; // Aumentado de 10 para 15
        
        // Avalia cartas altas (A, 2, 3) com valor aumentado
        cartasOrdenadas.forEach(carta => {
            const valor = carta[0];
            if (['A', '2', '3'].includes(valor)) {
                pontuacao += 8; // Aumentado de 5 para 8
            } else if (['K', 'J', 'Q'].includes(valor)) {
                pontuacao += 4; // Adicionado valor para figuras
            }
        });
        
        // Bônus para sequência de naipes fortes (aumentado)
        const naipesFortes = cartasOrdenadas.filter(carta => ['♣', '♥'].includes(carta.slice(-1))).length;
        pontuacao += naipesFortes * 4; // Aumentado de 2 para 4
        
        // Bônus adicional para combinações de cartas altas
        const cartasAltas = cartasOrdenadas.filter(carta => ['A', '2', '3'].includes(carta[0])).length;
        if (cartasAltas >= 2) {
            pontuacao += 10; // Bônus para duas ou mais cartas altas
        }
        
        return pontuacao;
    }

    pedirTruco() {
        if (this.valorRodada < 12) {
            this.audioManager.play('truco');
            const novoValor = this.valorRodada === 1 ? 3 : this.valorRodada + 3;
            let chancesAceitar = 0.7; // Base aumentada para 70%
            
            // Avalia força das mãos dos jogadores IA
            const forcaMaoIA = {};
            for (let i = 1; i < 4; i++) {
                forcaMaoIA[i] = this.avaliarForcaMao(this.maos[i]);
            }
            
            // Ajusta chances baseado na força das mãos (mais agressivo)
            const mediaForcaTime = (forcaMaoIA[2] + forcaMaoIA[3]) / 2; // Time IA
            if (mediaForcaTime > 12) chancesAceitar += 0.3; // Reduzido o limiar e aumentado o bônus
            if (mediaForcaTime < 8) chancesAceitar -= 0.1; // Reduzida a penalidade
            
            // Considera o estado do jogo (mais agressivo)
            if (this.vitoriasRodada[1] > this.vitoriasRodada[0]) chancesAceitar += 0.2;
            if (this.pontos[1] >= 9) chancesAceitar += 0.15; // Aumentado quando próximo de ganhar
            if (this.pontos[0] >= 9) chancesAceitar += 0.25; // Mais agressivo quando adversário está próximo
            
            // Removida a penalidade por apostas altas
            
            // Considera o número da mão atual (mais agressivo)
            if (this.numeroMao === 0) chancesAceitar += 0.15; // Primeira mão, ainda mais agressivo
            
            // Personalidade do jogador (todos mais agressivos)
            if (this.turno === 3) chancesAceitar += 0.15; // Parceiro ainda mais agressivo
            if (this.turno === 2) chancesAceitar += 0.1; // Jogador 2 também agressivo
            
            // Limita as chances entre 0.2 e 0.95 (aumentado o mínimo e máximo)
            chancesAceitar = Math.max(0.2, Math.min(0.95, chancesAceitar));
            
            const aceita = Math.random() < chancesAceitar;
            
            if (aceita) {
                this.valorRodada = novoValor;
                alert('Truco aceito! Valor da rodada: ' + this.valorRodada);
            } else {
                this.pontos[0] += this.valorRodada;
                alert('IA correu! Você ganhou ' + this.valorRodada + ' pontos!');
                this.iniciarNovaRodada();
            }
        }
    }

    fimDeJogo(vencedor) {
        const modal = document.getElementById('gameOverModal');
        const mensagem = document.getElementById('winner-message');
        mensagem.textContent = vencedor === 0 ? 'Sua dupla venceu! 🤝' : 'Dupla adversária venceu! 🤣';
        this.audioManager.play(vencedor === 0 ? 'vitoria' : 'derrota');
        modal.style.display = 'flex';
    }

    atualizarJogadorAtual() {
        // Remove a classe current-player de todos os jogadores
        document.querySelectorAll('.player').forEach(player => {
            player.classList.remove('current-player');
        });

        // Adiciona a classe current-player ao jogador atual
        const jogadorAtual = document.getElementById(`player${this.turno + 1}`);
        if (jogadorAtual) {
            jogadorAtual.classList.add('current-player');
        }
    }


    renderizarMao() {
        // Atualiza a exibição das cartas do jogador
        const minhasCartas = document.querySelector('.my-cards');
        // Atualiza o indicador do jogador atual
        this.atualizarJogadorAtual();
        minhasCartas.innerHTML = '';

        // Mostra de quem é a vez
        const jogadorAtual = document.getElementById('jogador-atual');
        if (jogadorAtual) {
            jogadorAtual.textContent = `Vez de: ${this.jogadores[this.turno]}`;
        }
        this.maos[0].forEach(carta => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            // Adiciona classe de cor baseada no naipe
            if (carta.includes('♥') || carta.includes('♦')) {
                cardElement.classList.add('card-red');
            }
            // Separa o valor e o naipe para melhor visualização
            const [valor, ...naipeArr] = carta.split('');
            const naipe = naipeArr.join('');
            cardElement.innerHTML = `<div class="card-value">${valor}</div><div class="card-suit">${naipe}</div>`;
            cardElement.onclick = () => this.jogarCarta(0, carta);
            minhasCartas.appendChild(cardElement);
        });

        // Atualiza o placar
        document.getElementById('team1-score').textContent = `Nós: ${this.pontos[0]} (${this.vitoriasRodada[0]})`;
        document.getElementById('team2-score').textContent = `Eles: ${this.pontos[1]} (${this.vitoriasRodada[1]})`;

        // Atualiza as cartas jogadas na mesa
        const mesaCartas = document.querySelector('.played-cards');
        mesaCartas.innerHTML = '';
        // Adiciona a carta vira
        if (this.vira) {
            const viraElement = document.createElement('div');
            viraElement.className = 'card card-vira';
            if (this.vira.includes('♥') || this.vira.includes('♦')) {
                viraElement.classList.add('card-red');
            }
            const [valorVira, ...naipeViraArr] = this.vira.split('');
            viraElement.innerHTML = `<div class="card-value">${valorVira}</div><div class="card-suit">${naipeViraArr.join('')}</div>`;
            mesaCartas.appendChild(viraElement);
        }
        // Adiciona as cartas jogadas
        this.cartasJogadas.forEach(jogada => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card card-played';
            if (jogada.carta.includes('♥') || jogada.carta.includes('♦')) {
                cardElement.classList.add('card-red');
            }
            const [valor, ...naipeArr] = jogada.carta.split('');
            cardElement.innerHTML = `<div class="card-value">${valor}</div><div class="card-suit">${naipeArr.join('')}</div>`;
            mesaCartas.appendChild(cardElement);
        });
    }

    setupEventListeners() {
        document.getElementById('truco-btn').onclick = () => this.pedirTruco();
        document.getElementById('run-btn').onclick = () => {
            this.pontos[1] += this.valorRodada;
            this.iniciarNovaRodada();
        };
        document.getElementById('play-again-btn').onclick = () => {
            document.getElementById('gameOverModal').style.display = 'none';
            this.pontos = [0, 0];
            this.iniciarNovaRodada();
        };
    }
}

// Inicializa o jogo quando a página carregar
// Exporta a classe para uso global
window.TrucoGame = TrucoGame;

// Inicialização do jogo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o jogo
    window.game = new TrucoGame();
    
    // Configura os controles de áudio após a inicialização do jogo
    if (typeof window.setupAudioControls === 'function') {
        window.setupAudioControls();
    }
    
    // Configura o botão de início
    const startBtn = document.getElementById('start-btn');
    const startScreen = document.getElementById('start-screen');
    const gameContainer = document.querySelector('.game-container');
    
    startBtn.onclick = () => {
        // Inicia o jogo
        window.game.distribuirCartas();
        
        // Esconde a tela inicial com uma animação de fade out
        startScreen.style.opacity = '0';
        setTimeout(() => {
            startScreen.style.display = 'none';
            // Mostra o container do jogo
            gameContainer.style.display = 'flex';
        }, 500);
    };
});