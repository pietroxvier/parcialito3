new Vue({
  el: '#app',
  data() {
    return {
      progress: 0,
      level: 1,
      canClick: true,
      countdownVisible: false,
      countdown: '',
      message: '',
      selectedName: '',
      nameSelected: false,
      showMessage: false,
      startTime: null,
      breakStartTime: null,
      timeRemaining: 50 * 60 * 1000,
      isPaused: false,
      welcomeMessage: 'Escolha seu nome:',
    };
  },
  computed: {
    progressWidth() {
      return (this.progress / 7) * (100 / 2);
    },
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
          this.message = '';
        }, 3000);
        this.updateLevel(this.level);
        localStorage.setItem('level', this.level);
      } else {
        localStorage.setItem('progress', this.progress);
      }
    },

    loadFromLocalStorage() {
      const savedProgress = localStorage.getItem('progress');
      if (savedProgress !== null && this.progress === 0) {
        this.progress = parseInt(savedProgress);
        this.updateProgressBar();
      }

      const savedSelectedName = localStorage.getItem('selectedName');
      if (savedSelectedName) {
        this.selectedName = savedSelectedName;
        this.nameSelected = true;
        this.welcomeMessage = `Seja bem-${this.selectedName === 'Josefina' ? 'vinda' : 'vindo'}, ${this.selectedName}!`;
      }
    },

    updateCountdown() {
      const currentTime = performance.now();
      let elapsedTime;

      if (this.startTime) {
        elapsedTime = currentTime - this.startTime;
      } else if (this.breakStartTime) {
        elapsedTime = currentTime - this.breakStartTime;
      } else {
        // Handle initial case or other scenarios as needed
        // ...
      }

      if (elapsedTime >= this.timeRemaining) {
        clearInterval(this.countdownInterval);
        this.updateProgress();
        this.canClick = false;
        this.isPaused = true;
        this.countdownVisible = false;
        this.showMessage = true;
        this.message = 'Hora da pausa';

        const xpSound = document.getElementById('xpSound');
        xpSound.play();

        let pauseTimeRemaining = 15 * 60 * 1000;
        const pauseCountdown = setInterval(() => {
          const pauseRemainingSeconds = Math.ceil(pauseTimeRemaining / 1000);
          const pauseMinutes = Math.floor(pauseRemainingSeconds / 60);
          const pauseSeconds = pauseRemainingSeconds % 60;
          this.countdown = `${pauseMinutes}:${pauseSeconds < 10 ? '0' : ''}${pauseSeconds}`;
          this.countdownVisible = true;

          if (pauseTimeRemaining <= 0) {
            clearInterval(pauseCountdown);
            this.countdown = '';
            this.message = 'Parabéns! Você ganhou 1 ponto de experiência.';
            this.canClick = false;
            this.isPaused = false;
            const xpSound = document.getElementById('endPause');
            xpSound.play();
            setTimeout(() => {
              this.message = 'Continue assim e estude mais uma vez!';
              this.canClick = true;
            }, 3000);
          }

          pauseTimeRemaining -= 1000;
        }, 1000);
      } else {
        const remainingMilliseconds = this.timeRemaining - elapsedTime;
        const remainingSeconds = Math.ceil(remainingMilliseconds / 1000);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        this.countdown = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        this.countdownVisible = true;
        this.isPaused = false;
      }
    },

    handleMoreXpClick() {
      if (this.canClick) {
        this.canClick = false;
        this.showMessage = true;
        this.message = 'Hora de estudar';
        this.startTime = performance.now();
        this.breakStartTime = null;
        this.updateCountdown();
        this.countdownInterval = setInterval(this.updateCountdown, 1000);
      }
    },

    selectName(name) {
      if (!this.nameSelected) {
        this.nameSelected = true;
        this.welcomeMessage = `Seja bem-${name === 'Josefina' ? 'vinda' : 'vindo'}, ${name}!`;
        localStorage.setItem('selectedName', name);
      }
    },

    // New methods to load progress and level from the server
	const YOUR_JWT_TOKEN = 'your_actual_jwt_token_here'; // Replace with your actual JWT token
    loadProgressAndLevel() {
        axios.get('http://localhost:3000/api/progress', {
          headers: {
            Authorization: `Bearer ${YOUR_JWT_TOKEN}`, // Replace with your JWT token
          },
        })
        .then((response) => {
          this.progress = response.data.progress;
          this.level = response.data.level;
        })
        .catch((error) => {
          console.error('Error fetching progress and level:', error);
        });
    },
  },

  mounted() {
    this.loadFromLocalStorage();
    this.loadProgressAndLevel(); // Load progress and level from the server
  },
});
