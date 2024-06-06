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
      avatars: [],
      jwtToken: localStorage.getItem('jwtToken')
    },
    mounted() {
      this.carregarDadosUsuario();
      this.carregarAvatares();
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
          this.avatars = response.data.map((avatar, index) => ({
            src: avatar,
            alt: `Avatar ${index + 1}`
          }));
        }).catch(error => {
          console.error('Erro ao carregar avatares:', error);
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
          this.carregarDadosUsuario();
        }).catch(error => {
          console.error('Erro ao atualizar perfil:', error);
        });
      },
      scrollLeft() {
        this.$el.querySelector('.avatar-wrapper').scrollBy({
          left: -100,
          behavior: 'smooth'
        });
      },
      scrollRight() {
        this.$el.querySelector('.avatar-wrapper').scrollBy({
          left: 100,
          behavior: 'smooth'
        });
      }
    }
  });
  