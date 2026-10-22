# Home Pizzas — carrinho

## O que está pronto
- Botão de carrinho no cabeçalho, com contador.
- Painel lateral para ver produtos e quantidades.
- Adicionar, remover e alterar quantidades.
- Subtotal/total e valores em reais.
- Persistência local via `localStorage` (continua após atualizar a página no mesmo navegador).
- Busca, filtros e avaliação mantidos.
- Botão de finalização preparado para enviar `POST /api/orders`.

## Como testar
1. Coloque `index.html`, `style.css` e `script.js` na pasta servida pelo seu site.
2. Abra o site por um servidor local (por exemplo, Live Server).
3. Clique nos `+` dos produtos e abra o botão Carrinho.
4. Atualize a página: os itens devem continuar no carrinho.

## Importante sobre o SQL
O navegador não deve conectar diretamente ao banco SQL, pois isso exporia usuário/senha. A finalização chama `POST /api/orders`, mas esse endpoint ainda precisa existir no backend para gravar no banco. O código do front-end não considera o pedido gravado no SQL até o servidor responder com sucesso.

Para eu preparar o backend e o script SQL corretos, preciso saber qual banco e qual tecnologia seu servidor usa:
- MySQL / MariaDB
- Microsoft SQL Server
- PostgreSQL
- Outro

E se o backend é PHP, Node.js, Python, ASP.NET ou outra tecnologia.
