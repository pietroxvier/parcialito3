new Vue({
  el: '#app',
  data: {
    dailyRanking: [],
    weeklyRanking: [],
    currentRanking: [],
    isDaily: true,
    serverUrl: `${window.location.protocol}//${window.location.hostname}`
  },
  methods: {
    async fetchRanking(type) {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
          throw new Error('JWT token not found in localStorage');
        }

        const headers = { 'Authorization': `Bearer ${jwtToken}` };
        const response = await axios.get(this.getFullUrl(`/${type}Ranking`), { headers });
        this[`${type}Ranking`] = response.data.map(player => ({
          ...player,
          hours: Math.floor(player.hours) // Round down the hours
        }));

        if (this.isDaily === (type === 'daily')) {
          this.currentRanking = this[`${type}Ranking`];
        }
      } catch (error) {
        console.error(`Error loading ${type} ranking:`, error);
        alert(`Failed to load ${type} ranking. Please check the console for more details.`);
      }
    },
    // Barra Lateral Direita 
    carregarDadosUsuario() {
      axios.get(this.getFullUrl('/userData'), {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(response => {
        this.user.name = response.data.name;
        this.user.email = response.data.email;
        this.user.nivel = response.data.level;
      }).catch(error => {
        console.error('Erro ao carregar dados do usuário:', error);
      });
    },
    carregarHorasEstudadas() {
      axios.get(this.getFullUrl('/userWeeklyHours'), {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(response => {
        this.user.hoursStudied = Math.floor(response.data.hoursStudied);
      }).catch(error => {
        console.error('Erro ao carregar horas estudadas:', error);
      });
    },
    showDailyRanking() {
      this.isDaily = true;
      this.currentRanking = this.dailyRanking;
    },

    showWeeklyRanking() {
      this.isDaily = false;
      this.currentRanking = this.weeklyRanking;
    },

    getFullUrl(path) {
      return `${this.serverUrl}${path}`;
    }
  },
  mounted() {
    this.fetchRanking('daily');
    this.fetchRanking('weekly');
    this.carregarDadosUsuario();
    this.carregarHorasEstudadas();
  }
});
