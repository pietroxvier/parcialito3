const app = new Vue({
  el: '#app',
  data: {
    progress: parseInt(localStorage.getItem("progress")) || 0,
    level: parseInt(localStorage.getItem("level")) || 1,
    progressToday: 0,
    canClick: true,
    countdownVisible: false,
    countdown: '',
    message: '',
    selectedName: '',
    nameSelected: false,
    showMessage: false,
    startTime: null,
    breakStartTime: null,
    timeRemaining: 0.5 * 60 * 1000,
    isPaused: false,
    welcomeMessage: 'Escolha seu nome:',
    serverUrl: `${window.location.protocol}//${window.location.hostname}:3000`,
    socket: null
  },
  computed: {
    progressWidth() {
      return (this.progress / 7) * (100 / 2);
    }
  },
  methods: {
    getFullUrl(path) {
      return `${this.serverUrl}${path}`;
    },

    connectSocket() {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        console.error('Token JWT não encontrado no localStorage');
        return;
      }
    
      this.socket = io(this.serverUrl, {
        query: { token }
      });
    
      this.socket.on('connect', () => {
        console.log('Conectado ao servidor WebSocket');
      });
    
      this.socket.on('timerUpdate', (state) => {
        const elapsedTime = state.startTime ? (Date.now() - new Date(state.startTime).getTime()) : 0;
        this.timeRemaining = state.timeRemaining - elapsedTime;
        this.isPaused = state.isPaused;
    
        if (!state.isPaused && this.timeRemaining > 0) {
          this.startTime = Date.now() - elapsedTime;
          this.updateCountdown();
          this.countdownInterval = setInterval(this.updateCountdown, 1000);
        } else {
          this.startTime = null;
          clearInterval(this.countdownInterval);
        }
      });
    
      this.socket.on('disconnect', () => {
        console.log('Desconectado do servidor WebSocket');
      });
    
      // Evento de resposta de teste
      this.socket.on('testResponse', (message) => {
        console.log('Resposta do servidor:', message);
      });
    },
    
    saveTimerState() {
      const jwtToken = localStorage.getItem('jwtToken');
      if (!jwtToken) {
        console.error('Token JWT não encontrado no localStorage');
        return;
      }
  
      const headers = { 'Authorization': `Bearer ${jwtToken}` };
      const data = { timeRemaining: this.timeRemaining, isPaused: this.isPaused ? 1 : 0, startTime: this.startTime }; // Incluindo startTime no payload
      const link = this.getFullUrl('/saveTimerState');
  
      axios.post(link, data, { headers })
        .then(response => {
          console.log('Estado do timer salvo com sucesso no servidor:', response.data);
        })
        .catch(error => {
          console.error('Erro ao salvar estado do timer no servidor:', error);
        });
    },
  
    startTimer() {
      if (this.canClick) {
        this.canClick = false;
        this.showMessage = true;
        this.message = "Hora de estudar";
        this.startTime = Date.now();
        this.breakStartTime = null;
        this.isPaused = false;
        this.timeRemaining = 0.5 * 60 * 1000; // Iniciar o timer com 50 minutos
        this.updateCountdown();
        this.countdownInterval = setInterval(this.updateCountdown, 1000);
  
        if (this.socket) {
          this.socket.emit('startTimer', {
            timeRemaining: this.timeRemaining,
            isPaused: this.isPaused,
            startTime: this.startTime
          });
        }
        this.saveTimerState(); // Salvar o estado do timer ao iniciar
      }
    },
  
    pauseTimer() {
      if (this.socket) {
        this.socket.emit('pauseTimer');
      }
      this.saveTimerState();
    },
  
    resumeTimer() {
      if (this.socket) {
        this.socket.emit('resumeTimer');
      }
      this.saveTimerState();
    },
  
    beforeUnload() {
      console.log('Salvando estado do timer antes de descarregar a página');
      this.saveTimerState();
    },

    updateCountdown() {
      if (this.isPaused || !this.startTime) return;
    
      const currentTime = Date.now();
      const elapsedTime = currentTime - this.startTime;
    
      if (elapsedTime >= this.timeRemaining) {
        clearInterval(this.countdownInterval);
        this.updateProgress();
        this.canClick = false;
        this.isPaused = true;
        this.countdownVisible = false;
        this.showMessage = true;
        this.message = "Hora da pausa";
    
        const xpSound = document.getElementById("xpSound");
        xpSound.volume = 0.2;
        xpSound.play();
    
        let pauseTimeRemaining = 15 * 60 * 1000;
        const pauseCountdown = setInterval(() => {
          const pauseElapsed = Date.now() - currentTime;
          const pauseRemainingMilliseconds = pauseTimeRemaining - pauseElapsed;
    
          if (pauseRemainingMilliseconds <= 0) {
            clearInterval(pauseCountdown);
            this.countdown = "";
            this.message = "Parabéns! Você ganhou 1 ponto de experiência.";
            this.canClick = false;
            this.isPaused = false;
            const endPauseSound = document.getElementById("endPause");
            endPauseSound.volume = 0.2;
            endPauseSound.play();
            setTimeout(() => {
              this.message = "Continue assim e estude mais uma vez!";
              this.canClick = true;
            }, 3000);
          } else {
            const pauseRemainingSeconds = Math.ceil(pauseRemainingMilliseconds / 1000);
            const pauseMinutes = Math.floor(pauseRemainingSeconds / 60);
            const pauseSeconds = pauseRemainingSeconds % 60;
            this.countdown = `${pauseMinutes}:${pauseSeconds < 10 ? "0" : ""}${pauseSeconds}`;
            this.countdownVisible = true;
          }
        }, 1000);
      } else {
        const remainingMilliseconds = this.timeRemaining - elapsedTime;
        const remainingSeconds = Math.ceil(remainingMilliseconds / 1000);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        this.countdown = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        this.countdownVisible = true;
        this.isPaused = false;
      }
    },
    
    updateProgress() {
      const incrementalXp = 100 / 7;
      this.progress += incrementalXp;
      this.progressToday += 1;
  
      if (this.progress >= 98) {
        this.level++;
        this.progress = 0;
        this.message = `Parabéns, você subiu para o nível ${this.level}!`;
  
        setTimeout(() => {
          this.message = "";
        }, 3000);
        this.updateLevel(this.level);
        localStorage.setItem("level", this.level);
      } else {
        this.setarProgresso(this.progress);
      }
  
      this.sendIncrementalExperience(incrementalXp);
    },

    sendIncrementalExperience(incrementalXp) {
      const jwtToken = localStorage.getItem('jwtToken');
  
      if (!jwtToken) {
        console.error('Token JWT não encontrado no localStorage');
        return;
      }
  
      const headers = { 'Authorization': `Bearer ${jwtToken}` };
      const data = { experiencePoints: incrementalXp };
      const link = this.getFullUrl('/addExperiencePoints');
  
      axios.post(link, data, { headers })
        .then(response => {
          console.log('Pontos de experiência atualizados com sucesso no servidor:', response.data);
        })
        .catch(error => {
          console.error('Erro ao atualizar pontos de experiência no servidor:', error);
        });
    },
    
    setarProgresso(newProgresso) {
      console.log('comecei');
  
      const jwtToken = localStorage.getItem('jwtToken');
  
      if (!jwtToken) {
        console.error('Token JWT não encontrado no localStorage');
        return;
      }
  
      const headers = {
        'Authorization': `Bearer ${jwtToken}`
      };
      const data = { progress: newProgresso };
      const link = this.getFullUrl('/updateProgress');
  
      axios.post(link, data, { headers })
        .then(response => {
          console.log('Progresso atualizado com sucesso no servidor:', response.data);
        })
        .catch(error => {
          console.error('Erro ao atualizar progresso no servidor:', error);
        });
    },
  
    handleMoreXpClick() {
      this.startTimer();
    },
  
    loadFromLocalStorage() {
      const savedProgress = localStorage.getItem("progress");
      if (savedProgress !== null && this.progress === 0) {
        this.progress = parseInt(savedProgress);
      }
  
      const savedSelectedName = localStorage.getItem("selectedName");
      if (savedSelectedName) {
        this.selectedName = savedSelectedName;
        this.nameSelected = true;
        this.welcomeMessage = `Seja bem-${this.selectedName === "Josefina" ? "vinda" : "vindo"}, ${this.selectedName}!`;
      }
    },
  
    selectName(name) {
      if (!this.nameSelected) {
        this.nameSelected = true;
        this.welcomeMessage = `Seja bem-${name === "Josefina" ? "vinda" : "vindo"}, ${name}!`;
        localStorage.setItem("selectedName", name);
      }
    },
  
    loadUserData() {
      console.log('Iniciou a função');
      const jwtToken = localStorage.getItem('jwtToken');
  
      if (!jwtToken) {
        console.error('Token JWT não encontrado no localStorage');
        return;
      }
  
      const headers = {
        'Authorization': `Bearer ${jwtToken}`
      };
      const link2 = this.getFullUrl('/userData');
  
      axios.get(link2, { headers })
        .then(response => {
          const userData = response.data;
          this.name = userData.name;
          this.level = userData.level;
          this.progress = userData.progress;
          this.timeRemaining = userData.time_remaining || 0.5 * 60 * 1000;
          this.isPaused = userData.is_paused === 1;
          this.startTime = userData.start_time ? new Date(userData.start_time).getTime() : null;
  
          if (this.startTime && !this.isPaused) {
            this.updateCountdown();
            this.countdownInterval = setInterval(this.updateCountdown, 1000);
          }
  
          this.selectedName = this.name;
          this.nameSelected = true;
          this.welcomeMessage = `Seja bem-${this.selectedName === "Josefina" ? "vinda" : "vindo"}, ${this.selectedName}!`;
  
          console.log('Dados do usuário carregados:', userData);
        })
        .catch(error => {
          console.error('Erro ao carregar dados do usuário:', error);
        });
    },
  
    testSocketConnection() {
      if (this.socket) {
        this.socket.emit('test', 'Olá, servidor!');
      }
    }
  },
  
  mounted() {
    this.loadUserData();
    this.connectSocket();
  
    window.addEventListener('beforeunload', this.beforeUnload);
  },
  
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.beforeUnload);
  }
});
  
window.app = app;
