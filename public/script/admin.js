new Vue({
  el: '#app',
  data: {
    currentView: 'addMateria',
    materias: [],
    categorias: [],
    provas: [],
    questoesProva: [],
    questoesForm: [],
    novaMateria: { nome: '' },
    novaCategoria: { nome: '', materia_id: '' },
    novaProva: { nome: '', materia_id: '' },
    provaEdicao: { nome: '', materia_id: '' },
    provaSelecionada: '',
    questaoMateriaId: '',
    categoriaId: '',
    numeroDeRespostas: 5,
    opcoesDeResposta: ['A', 'B', 'C', 'D', 'E'],
    questoesDisponiveis: [],
    questoesSelecionadas: [],
    categoriasFiltradas: [],
    users: [],
    selectedUserId: '', // Definindo selectedUserId no data
    experiencePoints: '',
    experienceMultiplier: '1', // Definindo o multiplicador padrão
    jwtToken: localStorage.getItem('jwtToken'),
    serverUrl: `${window.location.protocol}//${window.location.hostname}`
  },
  mounted() {
    this.buscarMaterias();
    this.buscarCategorias();
    this.buscarProvas();
    this.buscarUsuarios(); // Buscar usuários ao montar o componente
  },
  methods: {
    buscarMaterias() {
      axios.get('${this.serverUrl}/materias', {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(response => {
        this.materias = response.data;
      }).catch(error => {
        console.error('Erro ao buscar matérias:', error);
      });
    },
    buscarCategorias() {
      axios.get('${this.serverUrl}/categorias', {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(response => {
        this.categorias = response.data;
      }).catch(error => {
        console.error('Erro ao buscar categorias:', error);
      });
    },
    buscarProvas() {
      axios.get('${this.serverUrl}/provas', {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(response => {
        this.provas = response.data;
      }).catch(error => {
        console.error('Erro ao buscar provas:', error);
      });
    },
    buscarUsuarios() {
      console.log('Buscando usuários...');
      axios.get('${this.serverUrl}/users', {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(response => {
        this.users = response.data;
        console.log('Usuários carregados:', this.users); // Log para verificar os usuários carregados
      }).catch(error => {
        console.error('Erro ao buscar usuários:', error);
      });
    },
    adicionarMateria() {
      axios.post('${this.serverUrl}/materias', this.novaMateria, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(() => {
        alert('Matéria adicionada com sucesso!');
        this.buscarMaterias();
        this.novaMateria = { nome: '' };
      }).catch(error => {
        console.error('Erro ao adicionar matéria:', error);
      });
    },
    adicionarCategoria() {
      axios.post('${this.serverUrl}/categorias', this.novaCategoria, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(() => {
        alert('Categoria adicionada com sucesso!');
        this.buscarCategorias();
        this.novaCategoria = { nome: '', materia_id: '' };
      }).catch(error => {
        console.error('Erro ao adicionar categoria:', error);
      });
    },
    adicionarProva() {
      axios.post('${this.serverUrl}/provas', this.novaProva, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(() => {
        alert('Prova adicionada com sucesso!');
        this.buscarProvas();
        this.novaProva = { nome: '', materia_id: '' };
      }).catch(error => {
        console.error('Erro ao adicionar prova:', error);
      });
    },
    carregarProva() {
      const prova = this.provas.find(p => p.id === this.provaSelecionada);
      if (prova) {
        this.provaEdicao = { ...prova };
        this.carregarQuestoesProva(prova.id);
      }
    },
    atualizarProva() {
      axios.put(`${this.serverUrl}/provas/${this.provaSelecionada}`, this.provaEdicao, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(() => {
        alert('Prova atualizada com sucesso!');
        this.buscarProvas();
        this.provaEdicao = { nome: '', materia_id: '' };
        this.provaSelecionada = '';
      }).catch(error => {
        console.error('Erro ao atualizar prova:', error);
      });
    },

    carregarQuestoesProva(provaId) {
      axios.get(`${this.serverUrl}/provas/${provaId}/questoes`, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(response => {
        this.questoesProva = response.data.map(questao => ({
          ...questao,
          opcoes: JSON.parse(questao.opcoes) // Parseia as opções da string JSON para objeto
        }));
        this.filtrarQuestoesDisponiveis(); // Chama a função de filtragem após carregar as questões da prova
      }).catch(error => {
        console.error('Erro ao carregar questões da prova:', error);
      });
    },
  
    carregarQuestoesDisponiveis() {
      axios.get('${this.serverUrl}/questoes', {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(response => {
        this.questoesDisponiveis = response.data.filter(questao => 
          !this.questoesProva.some(qp => qp.id === questao.id)
        );
      }).catch(error => {
        console.error('Erro ao carregar questões disponíveis:', error);
      });
    },
  
    filtrarQuestoesDisponiveis() {
      axios.get('${this.serverUrl}/questoesDisponiveis', {
        params: {
          provaId: this.provaSelecionada,
          materiaId: this.questaoMateriaId,
          categoriaId: this.categoriaId
        },
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(response => {
        this.questoesDisponiveis = response.data.filter(questao => 
          !this.questoesProva.some(qp => qp.id === questao.id)
        );
      }).catch(error => {
        console.error('Erro ao filtrar questões disponíveis:', error);
      });
    },

  
    adicionarQuestoesAProva() {
      if (this.questoesSelecionadas.length === 0) {
        alert('Por favor, selecione pelo menos uma questão.');
        return;
      }
      axios.post(`${this.serverUrl}/provas/${this.provaSelecionada}/questoes`, {
        questoes: this.questoesSelecionadas
      }, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(() => {
        alert('Questões adicionadas à prova com sucesso!');
        this.questoesSelecionadas = [];
        this.carregarQuestoesProva(this.provaSelecionada);
      }).catch(error => {
        console.error('Erro ao adicionar questões à prova:', error);
      });
    },
    removerQuestaoDaProva(questaoId) {
      axios.delete(`${this.serverUrl}/provas/${this.provaSelecionada}/questoes/${questaoId}`, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(() => {
        alert('Questão removida da prova com sucesso!');
        this.carregarQuestoesProva(this.provaSelecionada);
      }).catch(error => {
        console.error('Erro ao remover questão da prova:', error);
      });
    },
    atualizarQuestao(questaoId, questao) {
      axios.put(`${this.serverUrl}/questoes/${questaoId}`, {
        texto_questao: questao.texto_questao,
        opcoes: JSON.stringify(questao.opcoes),
        resposta_correta: questao.resposta_correta
      }, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(() => {
        alert('Questão atualizada com sucesso!');
      }).catch(error => {
        console.error('Erro ao atualizar questão:', error);
      });
    },
    adicionarQuestoes() {
      if (!this.categoriaId || this.questoesForm.length === 0) {
        alert('Por favor, selecione uma categoria e adicione pelo menos uma questão.');
        return;
      }
      axios.post('${this.serverUrl}/questoes/multiplas', {
        questoes: this.questoesForm,
        categoriaId: this.categoriaId
      }, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(() => {
        alert('Questões adicionadas com sucesso!');
        this.questoesForm = []; // Limpa o formulário após o envio
      }).catch(error => {
        console.error('Erro ao adicionar questões:', error);
      });
    },
    adicionarQuestaoForm() {
      this.questoesForm.push({
        texto: '',
        opcoes: { 'A': '', 'B': '', 'C': '', 'D': '', 'E': '' }, // Inicializa todas as opções possíveis
        resposta_correta: 'A'  // Um valor default pode ser útil
      });
      this.atualizarOpcoesDeResposta(); // Atualiza as opções baseadas no número de respostas selecionado
    },
    atualizarOpcoesDeResposta() {
      this.questoesForm.forEach(questao => {
        if (this.numeroDeRespostas === '4') {
          delete questao.opcoes['E']; // Remove a opção E se o número de respostas for 4
        } else if (!questao.opcoes['E']) {
          questao.opcoes['E'] = ''; // Adiciona a opção E se não existir
        }
      });
    },
    filtrarCategoriasPorMateria() {
      this.categoriasFiltradas = this.categorias.filter(categoria => categoria.materia_id === this.questaoMateriaId);
    },
    processarArquivo(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          const { metadata, questions } = this.parseQuestions(content);
          if (this.validarQuestoes(questions)) {
            this.enviarQuestoes(metadata, questions);
          } else {
            alert('Uma ou mais questões não possuem resposta correta definida ou alternativas.');
          }
        };
        reader.readAsText(file);
      }
    },
    parseQuestions(content) {
      const lines = content.split('\n');
      let currentQuestion = null;
      const questions = [];
      const metadata = {};
    
      lines.forEach((line, index) => {
        line = line.trim();
        console.log(`Processando linha ${index + 1}: ${line}`); // Log da linha atual
    
        if (line.startsWith('Matéria:')) {
          metadata.materia = line.replace('Matéria:', '').trim();
          console.log(`Encontrada Matéria: ${metadata.materia}`); // Log da matéria
        } else if (line.startsWith('Categoria:')) {
          metadata.categoria = line.replace('Categoria:', '').trim();
          console.log(`Encontrada Categoria: ${metadata.categoria}`); // Log da categoria
        } else if (line.startsWith('Questão')) {
          if (currentQuestion) {
            questions.push(currentQuestion);
            console.log('Questão adicionada:', currentQuestion); // Log da questão adicionada
          }
          currentQuestion = { texto: '', opcoes: {}, resposta_correta: '' };
        } else if (line.startsWith('Texto:')) {
          currentQuestion.texto = line.replace('Texto:', '').trim();
          console.log(`Texto da Questão: ${currentQuestion.texto}`); // Log do texto da questão
        } else if (line.match(/^[A-E]:/)) {
          const option = line.charAt(0);
          const text = line.replace(`${option}:`, '').trim();
          currentQuestion.opcoes[option] = text;
          console.log(`Opção ${option}: ${text}`); // Log da opção
        } else if (line.startsWith('Respuesta Correcta:')) {
          currentQuestion.resposta_correta = line.replace('Respuesta Correcta:', '').trim();
          console.log(`Resposta Correta: ${currentQuestion.resposta_correta}`); // Log da resposta correta
        }
      });
    
      if (currentQuestion) {
        questions.push(currentQuestion);
        console.log('Questão adicionada:', currentQuestion); // Log da última questão adicionada
      }
    
      console.log('Metadata:', metadata); // Log do metadata
      console.log('Total de questões processadas:', questions.length); // Log do total de questões
      return { metadata, questions };
    },
  
    validarQuestoes(questions) {
      return questions.every(question => question.resposta_correta && question.opcoes && Object.keys(question.opcoes).length > 0);
    },
    async enviarQuestoes(metadata, questions) {
      try {
        const token = this.jwtToken;
    
        // Primeiro, obtenha o ID da matéria
        const materiasResponse = await axios.get('${this.serverUrl}/materias', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const materia = materiasResponse.data.find(m => m.nome === metadata.materia);
        if (!materia) {
          alert(`Matéria "${metadata.materia}" não encontrada.`);
          return;
        }
    
        // Em seguida, obtenha o ID da categoria
        const categoriasResponse = await axios.get('${this.serverUrl}/categorias', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const categoria = categoriasResponse.data.find(c => c.nome === metadata.categoria && c.materia_id === materia.id);
        if (!categoria) {
          alert(`Categoria "${metadata.categoria}" não encontrada para a matéria "${metadata.materia}".`);
          return;
        }
    
        // Finalmente, envie as questões para o servidor
        for (const question of questions) {
          if (!question.opcoes || Object.keys(question.opcoes).length === 0) {
            console.error('Questão sem opções:', question);
            continue;
          }
          console.log('Enviando questão:', question); // Log da questão sendo enviada
          await axios.post('${this.serverUrl}/questoes', {
            texto_questao: question.texto,
            categoria_id: categoria.id,
            resposta_correta: question.resposta_correta,
            opcoes: JSON.stringify(question.opcoes)
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log(`Questão adicionada: ${question.texto}`);
        }
        alert('Todas as questões foram adicionadas com sucesso!');
      } catch (error) {
        console.error('Erro ao enviar questões:', error);
      }
    },
    adicionarExperiencia() {
      const experiencePoints = 14.2857 * this.experienceMultiplier;
      console.log('Adicionando experiência para o usuário:', this.selectedUserId, 'Pontos:', experiencePoints);
      const data = {
        userId: this.selectedUserId,
        experiencePoints: experiencePoints
      };
      axios.post('${this.serverUrl}/addExperience', data, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      }).then(() => {
        alert('Pontos de experiência adicionados com sucesso!');
        this.selectedUserId = '';
        this.experienceMultiplier = '1';
      }).catch(error => {
        console.error('Erro ao adicionar pontos de experiência:', error);
      });
    },
  }
});
