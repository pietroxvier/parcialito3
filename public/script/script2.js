new Vue({
  el: '#app',
  data: {
    progress: parseInt(localStorage.getItem("progress")) || 0,
    level: parseInt(localStorage.getItem("level")) || 1,
    progressToday: 0, // New data property for progress earned today
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
    serverUrl: `${window.location.protocol}//${window.location.hostname}` // Declaração da variável serverUrl como uma propriedade de dados
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
    
    updateLevel(newLevel) {
      this.level = newLevel;
        // Recupera o token JWT do localStorage
  const jwtToken = localStorage.getItem('jwtToken');

  if (!jwtToken) {
    console.error('Token JWT não encontrado no localStorage');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${jwtToken}`
  };
  const data = { level: newLevel };
  const link = this.getFullUrl('/updateLevel'); // Usando o método getFullUrl para construir a URL completa

  axios.post(link, data, { headers })
    .then(response => {
      console.log('Nível atualizado com sucesso no servidor:', response.data);
    })
    .catch(error => {
      console.error('Erro ao atualizar nível no servidor:', error);
    });

    },

      updateProgress() {
        // Calculate the incremental experience points
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
    
        // Send the incremental experience points to the server
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

      // Recupera o token JWT do localStorage
      const jwtToken = localStorage.getItem('jwtToken');

      if (!jwtToken) {
        console.error('Token JWT não encontrado no localStorage');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${jwtToken}`
      };
      const data = { progress: newProgresso };
      const link = this.getFullUrl('/updateProgress'); // Usando o método getFullUrl para construir a URL completa

      axios.post(link, data, { headers })
        .then(response => {
          console.log('Progresso atualizado com sucesso no servidor:', response.data);
        })
        .catch(error => {
          console.error('Erro ao atualizar progresso no servidor:', error);
        });
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
        this.message = "Hora da pausa";

        const xpSound = document.getElementById("xpSound");
        xpSound.volume = 0.2;
        xpSound.play();

        let pauseTimeRemaining = 15 * 60 * 1000;
        const pauseCountdown = setInterval(() => {
          const pauseElapsed = performance.now() - currentTime;
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

    handleMoreXpClick() {
      if (this.canClick) {
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

    selectName(name) {
      if (!this.nameSelected) {
        this.nameSelected = true;
        this.welcomeMessage = `Seja bem-${name === "Josefina" ? "vinda" : "vindo"}, ${name}!`;
        localStorage.setItem("selectedName", name);
      }
    },

    // Método para carregar os dados do usuário usando o token JWT
    loadUserData() {
      // Obtém o token JWT do localStorage
      console.log('Iniciou a função');
      const jwtToken = localStorage.getItem('jwtToken');

      if (!jwtToken) {
        console.error('Token JWT não encontrado no localStorage');
        return;
      }

      // Configura os cabeçalhos da solicitação com o token JWT
      const headers = {
        'Authorization': `Bearer ${jwtToken}`
      };
      const link2 = this.getFullUrl('/userData'); // Usando o método getFullUrl para construir a URL completa

      // Faz uma solicitação GET para a rota protegida no seu servidor Node.js
      axios.get(link2, { headers })
        .then(response => {
          // Dados do usuário retornados pelo servidor
          const userData = response.data;
          // Atualiza os dados do usuário no Vue.js
          this.name = userData.name;
          this.level = userData.level;
          this.progress = userData.progress;
          // Outros dados...

          // Atualiza o nome selecionado e a mensagem de boas-vindas
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
    this.loadUserData();
  }
});
