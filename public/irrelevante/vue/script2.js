new Vue({
  el: '#app',
  data: {
    progress: parseInt(localStorage.getItem("progress")) || 0,
    level: parseInt(localStorage.getItem("level")) || 1,
    canClick: true,
    countdownVisible: false,
    countdown: '',
    message: '',
    selectedName: '',
    nameSelected: false,
	showMessage: false,
	startTime: null, // Initialize to null
    timeRemaining: 0.1 * 60 * 1000, // Initialize to your desired value in milliseconds
	isPaused: false, // Add a property to track pause state
    welcomeMessage: 'Escolha seu nome:'
  },
  computed: {
    progressWidth() {
    return (this.progress / 7) * (100 / 2); // Divide by 7 to distribute evenly
    }
  },
  methods: {
    updateLevel(newLevel) {
      this.level = newLevel;
    },
    updateProgress() {
  this.progress += 100 / 7; // Increment by approximately 14.29% for each point
  if (this.progress >= 98) {
        this.level++;
        this.progress = 0;
        this.message = `Parabéns, você subiu para o nível ${this.level}!`;

        setTimeout(() => {
          this.message = "";
        }, 3000);
        this.updateLevel(this.level);
        localStorage.setItem("level", this.level);
        localStorage.setItem("progress", this.progress);
      } else {
        localStorage.setItem("progress", this.progress);
      }
    },
  
  loadFromLocalStorage() {
    const savedProgress = localStorage.getItem("progress");
    if (savedProgress !== null && this.progress === 0) {
      this.progress = parseInt(savedProgress);
      this.updateProgressBar();
    }

	  const savedSelectedName = localStorage.getItem("selectedName");
      if (savedSelectedName) {
        this.selectedName = savedSelectedName; // Update the selectedName data property
        this.nameSelected = true; // Set nameSelected to true to hide the buttons
        this.welcomeMessage = `Seja bem-${this.selectedName === "Josefina" ? "vinda" : "vindo"}, ${this.selectedName}!`;
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
		this.isPaused = true; // Set pause state to true
        this.countdownVisible = false; // Hide the countdown
		this.showMessage = true; // Show the message
        this.message = "Hora da pausa";

        const xpSound = document.getElementById("xpSound");
        xpSound.play();


        let pauseTimeRemaining = 0.1 * 60 * 1000;
        const pauseCountdown = setInterval(() => {
          const pauseRemainingSeconds = Math.ceil(pauseTimeRemaining / 1000);
          const pauseMinutes = Math.floor(pauseRemainingSeconds / 60);
          const pauseSeconds = pauseRemainingSeconds % 60;
          this.countdown = `${pauseMinutes}:${pauseSeconds < 10 ? "0" : ""}${pauseSeconds}`;
		  this.countdownVisible = true; // Show the countdown


          if (pauseTimeRemaining <= 0) {
            clearInterval(pauseCountdown);
            this.countdown = "";
            this.message = "Parabéns! Você ganhou 1 ponto de experiência.";
			this.canClick = false; // Enable "More XP" button after pause

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
        this.countdownVisible = true; // Show the countdown
		this.isPaused = false; // Set pause state to false
      }
    },
    handleMoreXpClick() {
      if (this.canClick) {
        this.canClick = false;
		this.showMessage = true; // Show the message
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
        localStorage.setItem("selectedName", name); // Use the correct key "selectedName"
      }
    }
  },
  mounted() {
    this.loadFromLocalStorage();
  }
});