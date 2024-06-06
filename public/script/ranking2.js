new Vue({
    el: '#app',
    data: {
        ranking: []
    },
    mounted() {
        this.carregarRanking();
    },
    methods: {
        carregarRanking() {
            axios.get(`${window.location.protocol}//${window.location.hostname}/weeklyRanking`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            }).then(response => {
                this.ranking = response.data;
            }).catch(error => {
                console.error('Erro ao carregar ranking:', error);
            });
        }
    }
});