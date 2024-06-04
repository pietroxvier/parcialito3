document.getElementById('registration-form').addEventListener('submit', function(event) {
  event.preventDefault(); // Evita o comportamento padrão do formulário

  // Obtém os valores dos campos do formulário
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Padrão do url
  const serverUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
  const registerUrl = `${serverUrl}/cadastro`;

  // Constrói o objeto de dados a ser enviado para a API
  const data = {
    name: name,
    email: email,
    password: password
  };

  // Envia a solicitação POST usando Axios
  axios.post(registerUrl, data)
    .then(function(response) {
      // Manipula a resposta da API
      console.log('Resposta da API:', response);
      alert('Cadastro realizado com sucesso!');
    })
    .catch(function(error) {
      // Manipula erros
      console.error('Erro ao enviar solicitação:', error);
      alert('Ocorreu um erro durante o cadastro.');
    });
});
