new Vue({
  el: '#app',
  data: {
    progress: 0,
    level: 1,
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
    timeRemaining: null,
    isPaused: false,
    welcomeMessage: 'Escolha seu nome:',
    serverUrl: `${window.location.protocol}//${window.location.hostname}`,
    pomodoroSelected: false,
    pomodoroTime: null,
    breakTime: null,
    timerStarted: false,
    showPomodoroOptions: false,
    selectedPomodoro: null
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

    togglePomodoroOptions() {
      if (this.timerStarted) return; // Prevent changing options after timer starts
      this.showPomodoroOptions = !this.showPomodoroOptions;
    },

    selectPomodoro(time) {
      this.pomodoroTime = time * 60 * 1000;
      this.breakTime = (time === 30) ? 5 * 60 * 1000 : 15 * 60 * 1000;
      this.pomodoroSelected = true;
      this.selectedPomodoro = time; // Set the selected pomodoro time
      this.showPomodoroOptions = false; // Hide options after selection
    },

    updateLevel(newLevel) {
      this.level = newLevel;
      const jwtToken = localStorage.getItem('jwtToken');

      if (!jwtToken) {
        console.error('Token JWT não encontrado no localStorage');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${jwtToken}`
      };
      const data = { level: newLevel };
      const link = this.getFullUrl('/updateLevel');

      axios.post(link, data, { headers })
        .then(response => {
          console.log('Nível atualizado com sucesso no servidor:', response.data);
        })
        .catch(error => {
          console.error('Erro ao atualizar nível no servidor:', error);
        });
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

    updateCountdown() {
      const currentTime = performance.now();
      let elapsedTime;
    
      if (this.startTime) {
        elapsedTime = currentTime - this.startTime;
      } else if (this.breakStartTime) {
        elapsedTime = currentTime - this.breakStartTime;
      } else {
        return;
      }
    
      console.log(`Elapsed Time: ${elapsedTime} ms`);
    
      if (elapsedTime >= this.pomodoroTime) {
        console.log('Tempo de estudo completo.');
        clearInterval(this.countdownInterval);
        this.updateProgress();
        this.canClick = false;
        this.isPaused = true;
        this.countdownVisible = false;
        this.showMessage = true;
        this.message = "Hora da pausa";
    
        if (this.xpSound) {
          this.xpSound.play().catch(e => console.error("Erro ao reproduzir xpSound:", e));
        }
    
        let pauseTimeRemaining = this.breakTime;
        const pauseCountdown = setInterval(() => {
          const pauseElapsed = performance.now() - currentTime;
          const pauseRemainingMilliseconds = pauseTimeRemaining - pauseElapsed;
    
          if (pauseRemainingMilliseconds <= 0) {
            clearInterval(pauseCountdown);
            this.countdown = "";
            this.message = "Parabéns! Você ganhou 1 ponto de experiência.";
            this.canClick = false;
            this.isPaused = false;
            
            if (this.endPauseSound) {
              this.endPauseSound.play().catch(e => console.error("Erro ao reproduzir endPauseSound:", e));
            }
    
            setTimeout(() => {
              this.message = "Continue assim e estude mais uma vez!";
              this.canClick = true;
              setTimeout(() => {
                this.message = "";
                this.pomodoroSelected = false;
                this.timerStarted = false;
              }, 3000);
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
        const remainingMilliseconds = this.pomodoroTime - elapsedTime;
        const remainingSeconds = Math.ceil(remainingMilliseconds / 1000);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        this.countdown = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        this.countdownVisible = true;
        this.isPaused = false;
      }
    },
    
    handleMoreXpClick() {
      if (this.canClick && this.pomodoroSelected) {
        console.log('Iniciando o timer...');
        this.timerStarted = true;
        this.canClick = false;
        this.showMessage = true;
        this.loadUserData();
        this.message = "Hora de estudar";
        this.startTime = performance.now();
        this.breakStartTime = null;
        this.updateCountdown();
        this.countdownInterval = setInterval(this.updateCountdown, 1000);
      }
    },

    loadUserData() {
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

          this.selectedName = this.name;
          this.nameSelected = true;
          this.welcomeMessage = `Seja bem-${this.selectedName === "Josefina" ? "vinda" : "vindo"}, ${this.selectedName}!`;
        })
        .catch(error => {
          console.error('Erro ao carregar dados do usuário:', error);
        });
    }
  },

  mounted() {
    this.xpSound = document.getElementById("xpSound");
    this.endPauseSound = document.getElementById("endPauseSound");
    
    if (this.xpSound) this.xpSound.volume = 0.2;
    if (this.endPauseSound) this.endPauseSound.volume = 0.2;

    this.loadUserData();
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('script/service-worker.js').then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
      });
    }
  }
});
