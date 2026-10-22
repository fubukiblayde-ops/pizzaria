'use strict';

const search = document.getElementById('search');
const cards = [...document.querySelectorAll('.card')];
const chips = [...document.querySelectorAll('.chip')];
let category = 'todos';

function filterProducts() {
  const term = (search?.value || '').trim().toLocaleLowerCase('pt-BR');
  let count = 0;
  cards.forEach(card => {
    const matchesCategory = category === 'todos' || card.dataset.category === category;
    const matchesTerm = (card.dataset.name || '').includes(term) ||
      card.textContent.toLocaleLowerCase('pt-BR').includes(term);
    card.hidden = !(matchesCategory && matchesTerm);
    if (!card.hidden) count++;
  });
  const empty = document.getElementById('empty');
  if (empty) empty.style.display = count ? 'none' : 'block';
}
search?.addEventListener('input', filterProducts);
chips.forEach(chip => chip.addEventListener('click', () => {
  chips.forEach(item => item.classList.remove('active'));
  chip.classList.add('active');
  category = chip.dataset.category;
  filterProducts();
}));

// Avaliação visual da loja.
const stars = [...document.querySelectorAll('.stars button')];
stars.forEach(star => star.addEventListener('click', () => {
  const score = Number(star.dataset.score);
  stars.forEach(item => item.classList.toggle('selected', Number(item.dataset.score) <= score));
  const message = document.getElementById('rating-message');
  if (message) message.textContent = `Obrigado pela sua avaliação de ${score} estrela${score > 1 ? 's' : ''}!`;
}));

// Data/hora no cabeçalho.
function updateDateTime() {
  const target = document.getElementById('data-hora');
  if (!target) return;
  target.textContent = new Date().toLocaleString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
updateDateTime();
setInterval(updateDateTime, 60000);

// Carrinho: o identificador é o nome do produto; preços vêm do card do catálogo.
const CART_STORAGE_KEY = 'homePizzasCartV1';
const API_ORDERS_URL = '/api/orders'; // Configure este endpoint no seu servidor.
let cart = loadCart();

const drawer = document.getElementById('cart-drawer');
const overlay = document.getElementById('cart-overlay');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const checkoutButton = document.getElementById('checkout-button');
const cartStatus = document.getElementById('cart-status');

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter(item =>
      item && typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      Number.isFinite(item.price) && item.price >= 0 &&
      Number.isInteger(item.quantity) && item.quantity > 0
    ) : [];
  } catch {
    return [];
  }
}
function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}
function money(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function getCardProduct(card) {
  const title = card.querySelector('.title h3')?.textContent.trim() || 'Produto';
  const priceText = card.querySelector('.price')?.textContent || '';
  const price = Number(priceText.replace(/[^\d,]/g, '').replace('.', '').replace(',', '.'));
  return {
    id: title.toLocaleLowerCase('pt-BR'),
    name: title,
    price: Number.isFinite(price) ? price : 0,
    image: card.querySelector('img')?.src || ''
  };
}
function showStatus(message, type = 'error') {
  cartStatus.textContent = message;
  cartStatus.className = `cart-status show ${type}`;
}
function clearStatus() {
  cartStatus.textContent = '';
  cartStatus.className = 'cart-status';
}
function addProduct(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  saveCart();
  renderCart();
  showStatus(`${product.name} adicionado ao carrinho.`, 'success');
}
function changeQuantity(id, delta) {
  const item = cart.find(product => product.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter(product => product.id !== id);
  saveCart();
  renderCart();
  clearStatus();
}
function removeItem(id) {
  cart = cart.filter(product => product.id !== id);
  saveCart();
  renderCart();
  clearStatus();
}
function renderCart() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = String(totalQuantity);
  cartTotal.textContent = money(total);
  checkoutButton.disabled = cart.length === 0;

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="cart-empty"><div class="empty-icon">🛍️</div><strong>Seu carrinho está vazio</strong><p>Adicione algo gostoso do nosso cardápio.</p></div>';
    return;
  }

  cartItems.replaceChildren();
  cart.forEach(item => {
    const row = document.createElement('article');
    row.className = 'cart-item';

    const details = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = item.name;
    const unit = document.createElement('div');
    unit.className = 'cart-unit';
    unit.textContent = `${money(item.price)} cada`;
    const lineTotal = document.createElement('div');
    lineTotal.className = 'cart-line-total';
    lineTotal.textContent = money(item.price * item.quantity);
    const controls = document.createElement('div');
    controls.className = 'quantity-controls';

    const minus = document.createElement('button');
    minus.type = 'button'; minus.textContent = '−';
    minus.setAttribute('aria-label', `Diminuir ${item.name}`);
    minus.addEventListener('click', () => changeQuantity(item.id, -1));
    const quantity = document.createElement('span');
    quantity.textContent = String(item.quantity);
    quantity.setAttribute('aria-label', 'Quantidade');
    const plus = document.createElement('button');
    plus.type = 'button'; plus.textContent = '+';
    plus.setAttribute('aria-label', `Aumentar ${item.name}`);
    plus.addEventListener('click', () => changeQuantity(item.id, 1));
    const remove = document.createElement('button');
    remove.type = 'button'; remove.textContent = 'Remover';
    remove.className = 'remove-item';
    remove.addEventListener('click', () => removeItem(item.id));

    controls.append(minus, quantity, plus, remove);
    details.append(title, unit, lineTotal, controls);
    row.append(details);
    cartItems.append(row);
  });
}
function openCart() {
  drawer.classList.add('open');
  overlay.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('cart-locked');
  document.getElementById('close-cart').focus();
}
function closeCart() {
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('cart-locked');
  document.getElementById('open-cart').focus();
}
document.getElementById('open-cart').addEventListener('click', openCart);
document.getElementById('close-cart').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && drawer.classList.contains('open')) closeCart();
});

document.querySelectorAll('.add').forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('.card');
    if (card) {
      addProduct(getCardProduct(card));
      button.textContent = '✓';
      window.setTimeout(() => { button.textContent = '+'; }, 650);
    }
  });
});

// Envia o pedido para o backend. A API precisa ser criada/configurada no servidor.
checkoutButton.addEventListener('click', async () => {
  if (!cart.length) return;
  const order = {
    items: cart.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    createdAt: new Date().toISOString()
  };
  checkoutButton.disabled = true;
  checkoutButton.textContent = 'Enviando pedido...';
  clearStatus();
  try {
    const response = await fetch(API_ORDERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (!response.ok) throw new Error(`Servidor respondeu ${response.status}`);
    const result = await response.json().catch(() => ({}));
    cart = [];
    saveCart();
    renderCart();
    showStatus(result.message || 'Pedido enviado ao servidor com sucesso!', 'success');
  } catch (error) {
    showStatus('O carrinho está salvo neste navegador, mas não foi possível gravar o pedido no SQL. Configure a API /api/orders no servidor.', 'error');
  } finally {
    checkoutButton.textContent = 'Finalizar pedido';
    checkoutButton.disabled = cart.length === 0;
  }
});

renderCart();
