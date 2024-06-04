new Vue({
  el: '#app',
  data: {
    materias: [],
    provas: [],
    filtroMateriaId: '',
    provasFiltradas: [],
    materiaSelecionada: null,
    provaSelecionada: '',
    provaNome: '',
    questoes: [],
    respostas: [], // Armazena as respostas do usuário
    showResults: false,
    resultados: [],
    pontuacao: 0,
    user: {
      name: '',
      email: '',
      hoursStudied: 0,
      nivel: '',
    },
    jwtToken: localStorage.getItem('jwtToken'), // Adicionado aqui
    serverUrl: `${window.location.protocol}//${window.location.hostname}` // Declaração da variável serverUrl como uma propriedade de dados
  },
  mounted() {
    this.carregarProvas();
    this.carregarMaterias();
    this.carregarDadosUsuario();
    this.carregarHorasEstudadas();
  },
  methods: {
    getFullUrl(path) {
      return `${this.serverUrl}${path}`;
    },
    carregarProvas() {
      axios.get(this.getFullUrl('/provas'), {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(response => {
        this.provas = response.data;
        this.provasFiltradas = this.provas; // Inicializa as provas filtradas com todas as provas
      }).catch(error => {
        console.error('Erro ao carregar provas:', error);
      });
    },
    carregarMaterias() {
      axios.get(this.getFullUrl('/materias'), {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(response => {
        this.materias = response.data;
      }).catch(error => {
        console.error('Erro ao carregar matérias:', error);
      });
    },
    filtrarProvas() {
      if (this.filtroMateriaId) {
        this.provasFiltradas = this.provas.filter(prova => prova.materia_id === this.filtroMateriaId);
      } else {
        this.provasFiltradas = this.provas;
      }
    },
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
    carregarQuestoes() {
      if (!this.provaSelecionada) {
        this.questoes = [];
        this.respostas = [];
        return;
      }
      axios.get(this.getFullUrl(`/provas/${this.provaSelecionada}/questoes`), {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(response => {
        this.questoes = response.data.map(questao => ({
          ...questao,
          opcoes: JSON.parse(questao.opcoes)
        }));
        this.respostas = Array(this.questoes.length).fill('');
        const prova = this.provas.find(prova => prova.id === this.provaSelecionada);
        this.provaNome = prova ? prova.nome : '';
      }).catch(error => {
        console.error('Erro ao carregar questões:', error);
      });
    },
    submeterRespostas() {
      const respostas = this.questoes.map((questao, index) => ({
        questaoId: questao.id,
        respostaUsuario: this.respostas[index]
      }));

      axios.post(this.getFullUrl('/submeterRespostas'), {
        provaId: this.provaSelecionada,
        respostas
      }, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(response => {
        this.pontuacao = response.data.pontuacao;
        this.resultados = response.data.respostasDetalhadas;
        this.showResults = true;
      }).catch(error => {
        console.error('Erro ao submeter respostas:', error);
      });
    },
    selecionarMateria(materia) {
      this.filtroMateriaId = materia.id;
      this.filtrarProvas();
      this.materiaSelecionada = materia;
    },
    selecionarProva(prova) {
      this.provaSelecionada = prova.id;
      this.carregarQuestoes();
    },
    voltar() {
      this.showResults = false;
      this.provaSelecionada = '';
      this.provaNome = '';
      this.materiaSelecionada = null;
    }
  }
});
