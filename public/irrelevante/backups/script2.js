new Vue({
  el: '#app',
  data: {
    progress: +localStorage.getItem("progress") || 0,
    level: +localStorage.getItem("level") || 1,
    canClick: true,
    countdownVisible: false,
    countdown: '',
    message: '',
    selectedName: '',
    nameSelected: false,
    showMessage: false,
    startTime: null,
    timeRemaining: 50 * 60 * 1000,
    isPaused: false,
    welcomeMessage: 'Escolha seu nome:'
  },
  computed: {
    progressWidth() {
      return (this.progress / 7) * (100 / 2);
    }
  },
  methods: {
    updateLevel(newLevel) {
      this.level = newLevel;
    },
    updateProgress() {
      this.progress += 100 / 7;
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
        localStorage.setItem("progress", this.progress);
      }
    },
    loadFromLocalStorage() {
      if (localStorage.getItem("progress") && this.progress === 0) {
        this.progress = +localStorage.getItem("progress");
      }
      const savedSelectedName = localStorage.getItem("selectedName");
      if (savedSelectedName) {
        this.selectedName = savedSelectedName;
        this.nameSelected = true;
        this.welcomeMessage = `Seja bem-${savedSelectedName === "Josefina" ? "vinda" : "vindo"}, ${savedSelectedName}!`;
      }
    },
    updateCountdown() {
      const currentTime = performance.now();
      const elapsedTime = currentTime - this.startTime;
      const remainingMilliseconds = this.timeRemaining - elapsedTime;
      if (remainingMilliseconds <= 0) {
        clearInterval(this.countdownInterval);
        this.updateProgress();
        this.canClick = false;
        this.isPaused = true;
        this.countdownVisible = false;
        this.showMessage = true;
        this.message = "Hora da pausa";
        const xpSound = document.getElementById("xpSound");
        xpSound.play();
        let pauseTimeRemaining = 15 * 60 * 1000;
        const pauseCountdown = setInterval(() => {
          const pauseRemainingSeconds = Math.ceil(pauseTimeRemaining / 1000);
          const pauseMinutes = Math.floor(pauseRemainingSeconds / 60);
          const pauseSeconds = pauseRemainingSeconds % 60;
          this.countdown = `${pauseMinutes}:${pauseSeconds < 10 ? "0" : ""}${pauseSeconds}`;
          this.countdownVisible = true;
          if (pauseTimeRemaining <= 0) {
            clearInterval(pauseCountdown);
            this.countdown = "";
            this.message = "Parabéns! Você ganhou 1 ponto de experiência.";
            this.canClick = false;
            this.isPaused = false;
            const xpSound = document.getElementById("endPause");
            xpSound.play();
            setTimeout(() => {
              this.message = "Continue assim e estude mais uma vez!";
              this.canClick = true;
            }, 3000);
          }
          pauseTimeRemaining -= 1000;
        }, 1000);
      } else {
        const remainingSeconds = Math.ceil(remainingMilliseconds / 1000);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        this.countdown = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        this.countdownVisible = true;
        this.isPaused = false;
      }
    },
    handleMoreXpClick() {
      if (this.canClick) {
        this.canClick = false;
        this.showMessage = true;
        this.message = "Hora de estudar";
        this.startTime = performance.now();
        this.updateCountdown();
        this.countdownInterval = setInterval(this.updateCountdown, 1000);
      }
    },
    selectName(name) {
      if (!this.nameSelected) {
        this.nameSelected = true;
        this.welcomeMessage = `Seja bem-${name === "Josefina" ? "vinda" : "vindo"}, ${name}!`;
        localStorage.setItem("selectedName", name);
      }
    }
  },
  mounted() {
    this.loadFromLocalStorage();
  }
});
