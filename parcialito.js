const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const port = process.env.PORT || 3000;
const multer = require('multer');  // Adicionando o multer
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

// Middleware para habilitar o CORS
const corsOptions = {
  origin: '*', // Permite todas as origens
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'public')));

const JWT_SECRET = 'killuajr';

// Configuração do banco de dados MySQL
// Configuração do banco de dados MySQL
const connection = mysql.createConnection({
  host: process.env.JAWSDB_MARIA_HOST.trim(),
  user: process.env.JAWSDB_MARIA_USER.trim(),
  password: process.env.JAWSDB_MARIA_PASSWORD.trim(),
  database: process.env.JAWSDB_MARIA_DATABASE.trim(),
  timezone: 'America/Argentina/Buenos_Aires' // Define explicitamente o timezone
});


connection.connect(err => {
  if (err) throw err;
  console.log('Conectado ao banco de dados');
});

// Middleware para analisar o corpo das solicitações
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Rota padrão
console.log(__dirname);
console.log(path.join(__dirname, 'public'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API de Cadastro
app.post('/cadastro', async (req, res) => {
  const { name, email, password } = req.body;

  // Verificar se o e-mail já está sendo usado por outro usuário
  const emailExistsQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(emailExistsQuery, [email], async (err, rows) => {
    if (err) {
      console.error('Erro ao verificar e-mail existente:', err);
      res.status(500).json({ message: 'Erro interno do servidor' });
      return;
    }

    if (rows.length > 0) {
      res.status(400).json({ message: 'E-mail já cadastrado' });
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertUserQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      connection.query(insertUserQuery, [name, email, hashedPassword], (err, result) => {
        if (err) {
          console.error('Erro ao inserir usuário no banco de dados:', err);
          res.status(500).json({ message: 'Erro interno do servidor' });
          return;
        }

        console.log('Usuário inserido com sucesso no banco de dados');
        res.status(200).json({ message: 'Usuário cadastrado com sucesso' });
      });
    } catch (error) {
      console.error('Erro ao criptografar senha:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });
});

// Rota para lidar com a solicitação de login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário no banco de dados:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.error('Erro ao comparar senhas:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }

      if (result) {
        const token = jwt.sign(
          { userId: user.id, userEmail: user.email }, 
          JWT_SECRET, 
          { expiresIn: '30d' }
        );
        res.status(200).json({ token });
      } else {
        res.status(401).json({ message: 'Credenciais inválidas' });
      }
    });
  });
});

// Middleware para verificar se o token JWT é válido
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido ou em formato inválido' });
  }

  const tokenValue = token.split(' ')[1];
  jwt.verify(tokenValue, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Erro ao verificar token:', err);
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token JWT inválido' });
      }
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token JWT expirado' });
      }
      return res.status(401).json({ message: 'Erro ao verificar o token JWT' });
    }

    req.userId = decoded.userId;
    next();
  });
}

// Rota protegida que requer autenticação
app.get('/perfil', verifyToken, (req, res) => {
  res.status(200).json({ userId: req.userId });
});

// Rota protegida que requer autenticação
app.get('/userData', verifyToken, (req, res) => {
  const userId = req.userId;
  const query = 'SELECT name, level, email, progress, avatar FROM users WHERE id = ?';
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar dados do usuário no banco de dados:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    const userData = results[0];
    res.status(200).json(userData);
  });
});

app.post('/updateProgress', verifyToken, (req, res) => {
  const userId = req.userId;
  const { progress } = req.body;
  const updateProgressQuery = 'UPDATE users SET progress = ? WHERE id = ?';
  connection.query(updateProgressQuery, [progress, userId], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar progresso do usuário no banco de dados:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(200).json({ message: 'Progresso do usuário atualizado com sucesso' });
  });
});

app.post('/addExperience', verifyToken, (req, res) => {
  const { userId, experiencePoints } = req.body;

  // Atualizar os pontos de experiência do usuário
  const updateUserQuery = 'UPDATE users SET progress = progress + ? WHERE id = ?';
  connection.query(updateUserQuery, [experiencePoints, userId], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar pontos de experiência do usuário:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }

    // Gerar timestamp no fuso horário correto
    const currentTimestamp = moment().tz("America/Argentina/Buenos_Aires").format('YYYY-MM-DD HH:mm:ss');

    // Inserir na tabela user_experience
    const insertExperienceQuery = 'INSERT INTO user_experience (user_id, experience_points, timestamp) VALUES (?, ?, ?)';
    connection.query(insertExperienceQuery, [userId, experiencePoints, currentTimestamp], (err, result) => {
      if (err) {
        console.error('Erro ao inserir pontos de experiência na tabela user_experience:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }

      res.status(200).json({ message: 'Pontos de experiência adicionados com sucesso!' });
    });
  });
});


//Conseguir Lista de Usuários
app.get('/users', verifyToken, (req, res) => {
  const query = 'SELECT id, name FROM users';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(200).json(results);
  });
});

app.post('/addExperiencePoints', verifyToken, (req, res) => {
  const userId = req.userId;
  const { experiencePoints } = req.body;

  // Obtém a data e hora atual no fuso horário da Argentina
  const currentTimestamp = moment().tz("America/Argentina/Buenos_Aires").format('YYYY-MM-DD HH:mm:ss');

  const insertExperienceQuery = 'INSERT INTO user_experience (user_id, experience_points, timestamp) VALUES (?, ?, ?)';
  connection.query(insertExperienceQuery, [userId, experiencePoints, currentTimestamp], (err, result) => {
    if (err) {
      console.error('Erro ao inserir pontos de experiência no banco de dados:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(200).json({ message: 'Pontos de experiência adicionados com sucesso' });
  });
});


app.post('/updateLevel', verifyToken, (req, res) => {
  const userId = req.userId;
  const { level } = req.body;
  const updateLevelQuery = 'UPDATE users SET level = ? WHERE id = ?';
  connection.query(updateLevelQuery, [level, userId], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar nível do usuário no banco de dados:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    const resetProgressQuery = 'UPDATE users SET progress = 0 WHERE id = ?';
    connection.query(resetProgressQuery, [userId], (err, result) => {
      if (err) {
        console.error('Erro ao redefinir progresso do usuário no banco de dados:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
      res.status(200).json({ message: 'Nível e progresso do usuário atualizados com sucesso' });
    });
  });
});


// Rota para obter o ranking diário
app.get('/dailyRanking', verifyToken, (req, res) => {
  const dailyRankingQuery = `
    SELECT user_id, users.name, SUM(experience_points) AS total_xp, SUM(experience_points) / 14.2857 AS hours
    FROM user_experience
    INNER JOIN users ON user_experience.user_id = users.id
    WHERE DATE(timestamp) = CURDATE()
    GROUP BY user_id
    ORDER BY total_xp DESC
    LIMIT 10
  `;

  connection.query(dailyRankingQuery, (err, results) => {
    if (err) {
      console.error('Erro ao buscar ranking diário:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }

    res.status(200).json(results);
  });
});

app.get('/weeklyRanking', verifyToken, (req, res) => {
  const weeklyRankingQuery = `
      SELECT user_id, users.name, users.avatar, SUM(experience_points) AS total_xp, SUM(experience_points) / 14.2857 AS hours
      FROM user_experience
      INNER JOIN users ON user_experience.user_id = users.id
      WHERE YEARWEEK(timestamp, 1) = YEARWEEK(CURDATE(), 1)
      GROUP BY user_id
      ORDER BY total_xp DESC
      LIMIT 10
  `;

  connection.query(weeklyRankingQuery, (err, results) => {
      if (err) {
          console.error('Erro ao buscar ranking semanal:', err);
          return res.status(500).json({ message: 'Erro interno do servidor' });
      }

      // Prefix the avatar paths with the base URL
      results.forEach(user => {
          if (user.avatar) {
              user.avatar = `${req.protocol}://${req.get('host')}${user.avatar}`;
          }
      });

      res.status(200).json(results);
  });
});


///Dados do Usuário da Barra Lateral Direita
// Rota para obter as horas estudadas na semana pelo usuário logado
app.get('/userWeeklyHours', verifyToken, (req, res) => {
    const userId = req.userId;
    const weeklyHoursQuery = `
      SELECT SUM(experience_points) / 14.2857 AS hours
      FROM user_experience
      WHERE user_id = ? AND YEARWEEK(timestamp, 1) = YEARWEEK(CURDATE(), 1)
    `;
  
    connection.query(weeklyHoursQuery, [userId], (err, results) => {
      if (err) {
        console.error('Erro ao buscar horas estudadas na semana:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
  
      res.status(200).json({ hoursStudied: results[0].hours || 0 });
    });
  });

  
///////APIs relacionadas com as Provas

// Listar todas as categorias
app.get('/categorias', (req, res) => {
  const query = 'SELECT * FROM categorias';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar categorias:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(200).json(results);
  });
});

// Adicionar nova categoria incluindo a matéria
app.post('/categorias', (req, res) => {
  const { nome, materia_id } = req.body;
  const query = 'INSERT INTO categorias (nome, materia_id) VALUES (?, ?)';
  connection.query(query, [nome, materia_id], (err, result) => {
    if (err) {
      console.error('Erro ao inserir categoria:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(201).json({ message: 'Categoria adicionada com sucesso', categoriaId: result.insertId });
  });
});

// Listar todas as questões
app.get('/questoes', (req, res) => {
  const query = 'SELECT * FROM questoes';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar questões:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(200).json(results);
  });
});

// Adicionar nova questão
// Adicionar nova questão
app.post('/questoes', verifyToken, (req, res) => {
  const { texto_questao, categoria_id, resposta_correta, opcoes } = req.body;

  // Verificar se todas as informações necessárias estão presentes
  if (!texto_questao || !categoria_id || !resposta_correta || !opcoes) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  const query = 'INSERT INTO questoes (texto_questao, categoria_id, resposta_correta, opcoes) VALUES (?, ?, ?, ?)';
  const valores = [texto_questao, categoria_id, resposta_correta, opcoes];

  connection.query(query, valores, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao inserir questão.' });
    }
    res.status(201).json({ message: 'Questão adicionada com sucesso', questaoId: result.insertId });
  });
});



// Questões Múltiplas
app.post('/questoes/multiplas', verifyToken, (req, res) => {
  const { questoes, categoriaId } = req.body;
  if (questoes.length === 0) {
      return res.status(400).json({ message: 'Nenhuma questão foi enviada.' });
  }

  let questoesProcessadas = 0;
  let errosEncontrados = 0;

  questoes.forEach(questao => {
      const { texto, opcoes, resposta_correta } = questao;

      if (!texto || !opcoes || !resposta_correta) {
          errosEncontrados++;
          questoesProcessadas++;
          if (questoesProcessadas === questoes.length) {
              if (errosEncontrados > 0) {
                  return res.status(500).json({ message: `Erro ao inserir questões. ${errosEncontrados} questões não foram inseridas.` });
              }
              res.status(201).json({ message: 'Todas as questões foram adicionadas com sucesso.' });
          }
          return;
      }

      const opcoesString = JSON.stringify(opcoes); // Convertendo o objeto opções em uma string JSON
      const query = 'INSERT INTO questoes (texto_questao, categoria_id, resposta_correta, opcoes) VALUES (?, ?, ?, ?)';
      const valores = [texto, categoriaId, resposta_correta, opcoesString];

      connection.query(query, valores, (err, result) => {
          questoesProcessadas++;
          if (err) {
              errosEncontrados++;
          }

          // Responder apenas quando todas as questões forem processadas
          if (questoesProcessadas === questoes.length) {
              if (errosEncontrados > 0) {
                  return res.status(500).json({ message: `Erro ao inserir questões. ${errosEncontrados} questões não foram inseridas.` });
              }
              res.status(201).json({ message: 'Todas as questões foram adicionadas com sucesso.' });
          }
      });
  });
});


// Gerar prova com questões aleatórias
app.get('/gerarProva', verifyToken, (req, res) => {
    const { criterio, categoriaId } = req.query;
    let query;
  
    switch (criterio) {
      case 'aleatorio':
        query = 'SELECT * FROM questoes ORDER BY RAND() LIMIT 10';  // Gerar prova com 10 questões aleatórias
        break;
      case 'categoria':
        query = 'SELECT * FROM questoes WHERE categoria_id = ? ORDER BY RAND() LIMIT 10';  // Gerar prova com 10 questões de uma categoria específica
        break;
      case 'erros':
        query = `
          SELECT q.* FROM questoes q
          INNER JOIN respostas_usuario r ON q.id = r.questao_id
          WHERE r.usuario_id = ? AND r.correta = 0
          ORDER BY RAND() LIMIT 10
        `;
        break;
      default:
        return res.status(400).json({ message: 'Critério inválido' });
    }
  
    connection.query(query, [req.userId, categoriaId], (err, results) => {
      if (err) {
        console.error('Erro ao gerar prova:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
      res.status(200).json(results);
    });
  });

// Avaliar respostas submetidas
app.post('/avaliarProva', verifyToken, (req, res) => {
  const respostas = req.body;  // Espera-se que respostas seja um array de objetos com { questaoId, respostaUsuario }
  let pontuacao = 0;
  respostas.forEach(resp => {
    const query = 'SELECT resposta_correta FROM questoes WHERE id = ?';
    connection.query(query, [resp.questaoId], (err, result) => {
      if (err) {
        console.error('Erro ao verificar resposta:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
      if (result[0].resposta_correta === resp.respostaUsuario) {
        pontuacao++;
      }
    });
  });
  res.status(200).json({ pontuacao });
});

// Listar questões não associadas a uma prova específica, filtradas por matéria e categoria
app.get('/questoesDisponiveis', (req, res) => {
  const { provaId, materiaId, categoriaId } = req.query;

  const query = `
    SELECT q.* FROM questoes q
    INNER JOIN categorias c ON q.categoria_id = c.id
    INNER JOIN materias m ON c.materia_id = m.id
    WHERE q.id NOT IN (SELECT questao_id FROM provas_questoes WHERE prova_id = ?)
      AND m.id = ?
      AND c.id = ?
  `;

  connection.query(query, [provaId, materiaId, categoriaId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar questões disponíveis:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(200).json(results);
  });
});

  
  
// Atualizar uma questão
app.put('/questoes/:id', verifyToken, (req, res) => {
  const { texto_questao, opcoes, resposta_correta } = req.body;
  const { id } = req.params;

  const query = 'UPDATE questoes SET texto_questao = ?, opcoes = ?, resposta_correta = ? WHERE id = ?';
  connection.query(query, [texto_questao, opcoes, resposta_correta, id], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar questão:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(200).json({ message: 'Questão atualizada com sucesso' });
  });
});


// Deletar uma questão
app.delete('/questoes/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM questoes WHERE id = ?';
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Erro ao deletar questão:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(200).json({ message: 'Questão deletada com sucesso' });
  });
});

// Listar questões por categoria
app.get('/questoesPorCategoria/:categoriaId', (req, res) => {
  const { categoriaId } = req.params;

  const query = 'SELECT * FROM questoes WHERE categoria_id = ?';
  connection.query(query, [categoriaId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar questões:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(200).json(results);
  });
});

// Adicionar nova matéria
app.post('/materias', (req, res) => {
  const { nome } = req.body;
  const query = 'INSERT INTO materias (nome) VALUES (?)';
  connection.query(query, [nome], (err, result) => {
    if (err) {
      console.error('Erro ao inserir matéria:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(201).json({ message: 'Matéria adicionada com sucesso', materiaId: result.insertId });
  });
});

// Listar todas as matérias
app.get('/materias', (req, res) => {
  const query = 'SELECT * FROM materias';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar matérias:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(200).json(results);
  });
});

// Adicionar nova prova
app.post('/provas', verifyToken, (req, res) => {
  const { nome, materia_id } = req.body;
  const query = 'INSERT INTO provas (nome, materia_id) VALUES (?, ?)';
  connection.query(query, [nome, materia_id], (err, result) => {
    if (err) {
      console.error('Erro ao adicionar prova:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(201).json({ message: 'Prova adicionada com sucesso', provaId: result.insertId });
  });
});


// Listar todas as provas
app.get('/provas', verifyToken, (req, res) => {
  const query = 'SELECT * FROM provas';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar provas:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(200).json(results);
  });
});

// Atualizar uma prova
app.put('/provas/:id', verifyToken, (req, res) => {
  const { nome, materia_id } = req.body;
  const { id } = req.params;

  const query = 'UPDATE provas SET nome = ?, materia_id = ? WHERE id = ?';
  connection.query(query, [nome, materia_id, id], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar prova:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(200).json({ message: 'Prova atualizada com sucesso' });
  });
});



// Adicionar questões a uma prova específica
app.post('/provas/:provaId/questoes', (req, res) => {
  const { provaId } = req.params;
  const { questoes } = req.body;
  
  if (questoes.length === 0) {
    return res.status(400).json({ message: 'Nenhuma questão foi enviada.' });
  }

  let questoesProcessadas = 0;
  let errosEncontrados = 0;

  questoes.forEach(questaoId => {
    const query = 'INSERT INTO provas_questoes (prova_id, questao_id) VALUES (?, ?)';
    connection.query(query, [provaId, questaoId], (err, result) => {
      questoesProcessadas++;
      if (err) {
        console.error('Erro ao inserir questão na prova:', err);
        errosEncontrados++;
      }

      // Responder apenas quando todas as questões forem processadas
      if (questoesProcessadas === questoes.length) {
        if (errosEncontrados > 0) {
          return res.status(500).json({ message: `Erro ao inserir questões na prova. ${errosEncontrados} questões não foram inseridas.` });
        }
        res.status(201).json({ message: 'Todas as questões foram adicionadas à prova com sucesso.' });
      }
    });
  });
});

// Listar questões de uma prova específica
app.get('/provas/:provaId/questoes', (req, res) => {
    const { provaId } = req.params;
  
    const query = `
      SELECT q.* FROM questoes q
      INNER JOIN provas_questoes pq ON q.id = pq.questao_id
      WHERE pq.prova_id = ?
    `;
  
    connection.query(query, [provaId], (err, results) => {
      if (err) {
        console.error('Erro ao buscar questões da prova:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
      res.status(200).json(results);
    });
  });

  // Gerar prova com questões baseadas em critérios específicos
  app.get('/gerarProva', verifyToken, (req, res) => {
    const { criterio, categoriaId } = req.query;
    let query;
  
    switch (criterio) {
      case 'aleatorio':
        query = 'SELECT * FROM questoes ORDER BY RAND() LIMIT 10';  // Gerar prova com 10 questões aleatórias
        break;
      case 'categoria':
        query = 'SELECT * FROM questoes WHERE categoria_id = ? ORDER BY RAND() LIMIT 10';  // Gerar prova com 10 questões de uma categoria específica
        break;
      case 'erros':
        query = `
          SELECT q.* FROM questoes q
          INNER JOIN respostas_usuario r ON q.id = r.questao_id
          WHERE r.usuario_id = ? AND r.correta = 0
          ORDER BY RAND() LIMIT 10
        `;
        break;
      default:
        return res.status(400).json({ message: 'Critério inválido' });
    }
  
    connection.query(query, [req.userId, categoriaId], (err, results) => {
      if (err) {
        console.error('Erro ao gerar prova:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
      res.status(200).json(results);
    });
  });
  
// Listar provas por matéria
app.get('/provasPorMateria/:materiaId', verifyToken, (req, res) => {
  const { materiaId } = req.params;

  const query = 'SELECT * FROM provas WHERE materia_id = ?';
  connection.query(query, [materiaId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar provas por matéria:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(200).json(results);
  });
});


  // Submeter respostas
  app.post('/submeterRespostas', verifyToken, (req, res) => {
    const { provaId, respostas } = req.body;
  
    let pontuacao = 0;
    let respostasDetalhadas = [];
  
    // Primeiro, insere uma nova tentativa
    const insertTentativaQuery = 'INSERT INTO tentativas_usuario (usuario_id, prova_id, pontuacao) VALUES (?, ?, ?)';
    connection.query(insertTentativaQuery, [req.userId, provaId, pontuacao], (err, result) => {
      if (err) {
        console.error('Erro ao registrar tentativa:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
  
      const tentativaId = result.insertId;
  
      const queries = respostas.map(resp => {
        return new Promise((resolve, reject) => {
          const query = 'SELECT texto_questao, resposta_correta, opcoes FROM questoes WHERE id = ?';
          connection.query(query, [resp.questaoId], (err, result) => {
            if (err) {
              console.error('Erro ao verificar resposta:', err);
              return reject(err);
            }
  
            const questao = result[0];
            const correta = questao.resposta_correta === resp.respostaUsuario ? 1 : 0;
            pontuacao += correta;
  
            respostasDetalhadas.push({
              questaoId: resp.questaoId,
              texto: questao.texto_questao,
              opcoes: JSON.parse(questao.opcoes),
              respostaUsuario: resp.respostaUsuario,
              respostaCorreta: questao.resposta_correta,
              correta: correta === 1
            });
  
            const insertRespostaQuery = 'INSERT INTO respostas_usuario (tentativa_id, questao_id, resposta_usuario, correta) VALUES (?, ?, ?, ?)';
            connection.query(insertRespostaQuery, [tentativaId, resp.questaoId, resp.respostaUsuario, correta], (err, result) => {
              if (err) {
                console.error('Erro ao registrar resposta:', err);
                return reject(err);
              }
              resolve();
            });
          });
        });
      });
  
      Promise.all(queries)
        .then(() => {
          // Atualiza a pontuação da tentativa
          const updatePontuacaoQuery = 'UPDATE tentativas_usuario SET pontuacao = ? WHERE id = ?';
          connection.query(updatePontuacaoQuery, [pontuacao, tentativaId], (err, result) => {
            if (err) {
              console.error('Erro ao atualizar pontuação:', err);
              return res.status(500).json({ message: 'Erro interno do servidor' });
            }
            res.status(200).json({ pontuacao, respostasDetalhadas });
          });
        })
        .catch(error => {
          res.status(500).json({ message: 'Erro ao submeter respostas' });
        });
    });
  });
  
  const upload = multer({ dest: 'avatares/' });
  
  // Rota para obter os avatares disponíveis
app.get('/avatares', verifyToken, (req, res) => {
  const avatarDir = path.join(__dirname, 'public/avatares');
  fs.readdir(avatarDir, (err, files) => {
      if (err) {
          console.error('Erro ao ler diretório de avatares:', err);
          return res.status(500).json({ message: 'Erro interno do servidor' });
      }

      const avatares = files
          .filter(file => path.extname(file) === '.webp')
          .map(file => `/avatares/${file}`);

      res.status(200).json(avatares);
  });
});


// Rota para atualizar os dados do usuário
app.put('/userData', verifyToken, (req, res) => {
  const userId = req.userId;
  const { name, email, avatar, password } = req.body;

  // Preparando a query de atualização de dados
  const updateQuery = 'UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ?';
  const updateValues = [name, email, avatar, userId];

  // Executando a query de atualização de dados
  connection.query(updateQuery, updateValues, (err) => {
      if (err) {
          console.error('Erro ao atualizar dados do usuário:', err);
          return res.status(500).json({ message: 'Erro interno do servidor' });
      }

      // Se a senha for fornecida, atualize a senha também
      if (password) {
          const hashedPassword = bcrypt.hashSync(password, 10);
          const updatePasswordQuery = 'UPDATE users SET password = ? WHERE id = ?';
          connection.query(updatePasswordQuery, [hashedPassword, userId], (err) => {
              if (err) {
                  console.error('Erro ao atualizar senha do usuário:', err);
                  return res.status(500).json({ message: 'Erro interno do servidor' });
              }

              res.status(200).json({ message: 'Perfil atualizado com sucesso!' });
          });
      } else {
          res.status(200).json({ message: 'Perfil atualizado com sucesso!' });
      }
  });
});

  // Obter histórico de desempenho
  app.get('/desempenho', verifyToken, (req, res) => {
    const query = `
      SELECT p.*, tu.pontuacao, tu.data 
      FROM provas p
      INNER JOIN tentativas_usuario tu ON p.id = tu.prova_id
      WHERE tu.usuario_id = ?
    `;
  
    connection.query(query, [req.userId], (err, results) => {
      if (err) {
        console.error('Erro ao obter desempenho:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
      res.status(200).json(results);
    });
  });

  // Endpoint para salvar o estado do temporizador
// Endpoint para salvar o estado do temporizador
app.post('/saveTimerState', verifyToken, (req, res) => {
  const userId = req.userId;
  const { timeRemaining, isPaused } = req.body;
  const updateTimerStateQuery = 'UPDATE users SET time_remaining = ?, is_paused = ? WHERE id = ?';

  connection.query(updateTimerStateQuery, [timeRemaining, isPaused, userId], (err, result) => {
    if (err) {
      console.error('Erro ao salvar estado do temporizador no banco de dados:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    res.status(200).json({ message: 'Estado do temporizador salvo com sucesso' });
  });
});


// Endpoint para carregar o estado do temporizador
app.get('/loadTimerState', verifyToken, (req, res) => {
  const userId = req.userId;
  const query = 'SELECT time_remaining, is_paused FROM users WHERE id = ?';
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erro ao carregar estado do temporizador do banco de dados:', err);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    const timerState = results[0];
    res.status(200).json(timerState);
  });
});


// Inicia o servidor+
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log("Current Server Time:", new Date().toString());
  console.log("Current Argentina Time:", moment().tz("America/Argentina/Buenos_Aires").format('YYYY-MM-DD HH:mm:ss'));
});
