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
      avatars: [
        { src: '/avatars/avatar1.png', alt: 'Avatar 1' },
        { src: '/avatars/avatar2.png', alt: 'Avatar 2' },
        { src: '/avatars/avatar3.png', alt: 'Avatar 3' }
      ],
      jwtToken: localStorage.getItem('jwtToken')
    },
    mounted() {
      this.carregarDadosUsuario();
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
      selecionarAvatar(avatar) {
        this.user.avatar = avatar;
      },
      atualizarPerfil() {
        if (this.password !== this.confirmPassword) {
          alert('As senhas não coincidem.');
          return;
        }
  
        const dadosAtualizados = {
          name: this.user.name,
          email: this.user.email,
          avatar: this.user.avatar,
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
  