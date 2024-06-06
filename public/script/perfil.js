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
        avatarFile: null,
        jwtToken: localStorage.getItem('jwtToken')
    },
    mounted() {
        this.carregarDadosUsuario();
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
        onAvatarChange(event) {
            this.avatarFile = event.target.files[0];
        },
        atualizarPerfil() {
            if (this.password !== this.confirmPassword) {
                alert('As senhas não coincidem.');
                return;
            }

            const formData = new FormData();
            formData.append('name', this.user.name);
            formData.append('email', this.user.email);
            if (this.password) {
                formData.append('password', this.password);
            }
            if (this.avatarFile) {
                formData.append('avatar', this.avatarFile);
            }

            axios.put(`${serverUrl}/userData`, formData, {
                headers: {
                    'Authorization': `Bearer ${this.jwtToken}`,
                    'Content-Type': 'multipart/form-data'
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
