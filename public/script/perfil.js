const serverUrl = `${window.location.protocol}//${window.location.hostname}`;

new Vue({
    el: '#app',
    data: {
        user: {
            name: '',
            email: '',
            avatar: '',
            nivel: '',
            hoursStudied: 0
        },
        password: '',
        confirmPassword: '',
        avatares: [], // Lista de URLs de avatares
        jwtToken: localStorage.getItem('jwtToken')
    },
    mounted() {
        this.carregarDadosUsuario();
        this.carregarAvatares();
    },
    methods: {
        carregarDadosUsuario() {
            axios.get(`${serverUrl}/userData`, {
                headers: {
                    'Authorization': `Bearer ${this.jwtToken}`
                }
            }).then(response => {
                this.user = response.data;
            }).catch(error => {
                console.error('Erro ao carregar dados do usuário:', error);
            });
        },
        carregarAvatares() {
            // Aqui você pode buscar os avatares disponíveis do servidor
            axios.get(`${serverUrl}/avatares`, {
                headers: {
                    'Authorization': `Bearer ${this.jwtToken}`
                }
            }).then(response => {
                this.avatares = response.data;
            }).catch(error => {
                console.error('Erro ao carregar avatares:', error);
            });
        },
        atualizarPerfil() {
            if (this.password !== this.confirmPassword) {
                alert('As senhas não coincidem.');
                return;
            }

            const dadosAtualizados = {
                name: this.user.name,
                email: this.user.email,
                avatar: this.user.avatar
            };

            if (this.password) {
                dadosAtualizados.password = this.password;
            }

            axios.put(`${serverUrl}/userData`, dadosAtualizados, {
                headers: {
                    'Authorization': `Bearer ${this.jwtToken}`
                }
            }).then(() => {
                alert('Perfil atualizado com sucesso!');
                this.carregarDadosUsuario();
            }).catch(error => {
                console.error('Erro ao atualizar perfil:', error);
            });
        }
    }
});
