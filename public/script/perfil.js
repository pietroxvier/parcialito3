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
        avatars: [], // Inicialmente vazio, será carregado do servidor
        jwtToken: localStorage.getItem('jwtToken')
    },
    mounted() {
        this.carregarDadosUsuario();
        this.carregarAvatares(); // Adiciona a chamada para carregar os avatares
    },
    methods: {
        carregarDadosUsuario() {
            axios.get(`${window.location.protocol}//${window.location.hostname}/userData`, {
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
            axios.get(`${window.location.protocol}//${window.location.hostname}/avatares`, {
                headers: {
                    'Authorization': `Bearer ${this.jwtToken}`
                }
            }).then(response => {
                this.avatars = response.data.map(src => ({ src, alt: 'Avatar' }));
            }).catch(error => {
                console.error('Erro ao carregar avatares:', error);
            });
        },
        selecionarAvatar(avatar) {
            this.user.avatar = avatar.src; // Define o src do avatar selecionado
        },
        atualizarPerfil() {
            if (this.password !== this.confirmPassword) {
                alert('As senhas não coincidem.');
                return;
            }

            const dadosAtualizados = {
                name: this.user.name,
                email: this.user.email,
                avatar: this.user.avatar, // Inclui o avatar no payload
                password: this.password,
                confirmPassword: this.confirmPassword
            };

            axios.put(`${window.location.protocol}//${window.location.hostname}/userData`, dadosAtualizados, {
                headers: {
                    'Authorization': `Bearer ${this.jwtToken}`
                }
            }).then(() => {
                alert('Perfil atualizado com sucesso!');
                this.carregarDadosUsuario(); // Recarrega os dados do usuário após atualização
            }).catch(error => {
                console.error('Erro ao atualizar perfil:', error);
            });
        }
    }
});
