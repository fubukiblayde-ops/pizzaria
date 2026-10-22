function atualizarDataHora() {
    const elemento = document.getElementById('data-hora');
    
    if (elemento) {
        const agora = new Date();
        
        // Formata a data e a hora
        const opcoes = { 
            dateStyle: 'full', 
            timeStyle: 'medium' 
        };
        const dataHoraFormatada = agora.toLocaleString('pt-BR', opcoes);
        
        elemento.textContent = dataHoraFormatada;
    }
}

// Atualiza imediatamente ao carregar a página
atualizarDataHora();

setInterval(atualizarDataHora, 1000);

// API de random user

async function carregarClientes() {
  const lista = document.getElementById("lista-clientes");

  try {
    const resposta = await fetch(
      "https://randomuser.me/api/?results=3&nat=br&inc=name,email,picture"
    );

    if (!resposta.ok) {
      throw new Error("Erro ao consultar a API");
    }

    const dados = await resposta.json();

    lista.innerHTML = "";

    dados.results.forEach((usuario) => {
      const cliente = document.createElement("article");
      cliente.className = "cliente";

      const foto = document.createElement("img");
      foto.src = usuario.picture.medium;
      foto.alt = "Foto de perfil de " +
        usuario.name.first;

      const nome = document.createElement("h3");
      nome.textContent =
        `${usuario.name.first} ${usuario.name.last}`;

      const email = document.createElement("p");
      email.textContent = usuario.email;

      cliente.append(foto, nome, email);
      lista.appendChild(cliente);
    });
  } catch (erro) {
    console.error("Não foi possível carregar os clientes:", erro);
    lista.textContent = "Não foi possível carregar os clientes.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarClientes();
});
