new Vue({
  el: '#app',
  data: {
    dailyRanking: [],
    weeklyRanking: [],
    currentRanking: [],
    isDaily: true,
    serverUrl: `${window.location.protocol}//${window.location.hostname}:8080`
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
  }
});
