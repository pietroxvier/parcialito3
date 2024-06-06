new Vue({
    el: '#app',
    data: {
      user: {
        name: '',
        email: '',
        avatar: '',
        password: '',
        confirmPassword: ''
      },
      avatars: [
        '/avatares/avatar1.webp',
        '/avatares/avatar2.webp',
        '/avatares/avatar3.webp',
        '/avatares/avatar6.webp',// Adicione os caminhos corretos dos avatares aqui
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
          this.user.name = response.data.name;
          this.user.email = response.data.email;
          this.user.avatar = response.data.avatar; // Adicione essa linha para carregar o avatar do usuário
        }).catch(error => {
          console.error('Erro ao carregar dados do usuário:', error);
        });
      },
      atualizarPerfil() {
        axios.put(`${window.location.protocol}//${window.location.hostname}/userData`, this.user, {
          headers: {
            'Authorization': `Bearer ${this.jwtToken}`
          }
        }).then(() => {
          alert('Perfil atualizado com sucesso!');
        }).catch(error => {
          console.error('Erro ao atualizar perfil:', error);
        });
      },
      selecionarAvatar(avatar) {
        this.user.avatar = avatar;
      }
    }
  });
  