const products = [
  { id: 1, title: 'Immune Boost Daily Gummies', category: 'supplement', price: 25.99, desc: 'Vitamin C + Zinc with natural elderberry for immunity.', image: 'https://images.unsplash.com/photo-1584447242545-25fb66c3e5a2?auto=format&fit=crop&w=500&q=80' },
  { id: 2, title: 'Smart Heart Monitor Band', category: 'device', price: 109.99, desc: '24/7 ECG tracking with anomaly alerts and app sync.', image: 'https://images.unsplash.com/photo-1542736667-069246bdbc6d?auto=format&fit=crop&w=500&q=80' },
  { id: 3, title: 'Sleep Wellness Kit', category: 'wellness', price: 68.00, desc: 'Melatonin formula, guided audio, and blue-light blocking glasses.', image: 'https://images.unsplash.com/photo-1582719478177-9dfd16f8511f?auto=format&fit=crop&w=500&q=80' },
  { id: 4, title: 'Joint Flex Advanced', category: 'supplement', price: 38.50, desc: 'Glucosamine + MSM for joint arthritis comfort.', image: 'https://images.unsplash.com/photo-1516600164264-d58f08e5516c?auto=format&fit=crop&w=500&q=80' },
  { id: 5, title: 'Allergy Quick Relief Spray', category: 'supplement', price: 21.75, desc: 'Fast, drug-free nasal spray for pollen sensitivity.', image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=500&q=80' },
  { id: 6, title: 'Infusion Hydration Pack', category: 'wellness', price: 45.00, desc: 'Electrolyte bundle for athletes and recovery days.', image: 'https://images.unsplash.com/photo-1559602022-03f63cff7a8b?auto=format&fit=crop&w=500&q=80' }
];

const cart = JSON.parse(localStorage.getItem('vv-cart') || '[]');
const productGrid = document.getElementById('productGrid');
const cartQty = document.getElementById('cartQty');
const cartTotal = document.getElementById('cartTotal');
const cartItems = document.getElementById('cartItems');
const cartDrawer = document.getElementById('cartDrawer');
const toast = document.getElementById('toast');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

const fallbackImageSrc = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="100%25" height="100%25" fill="%23eef3fc"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%237a8fa3" font-family="Segoe UI, Arial, sans-serif" font-size="20"%3ENo Image Available%3C/text%3E%3C/svg%3E';

function showToast(message) {
  toast.textContent = message;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 1800);
}

function saveCart() {
  localStorage.setItem('vv-cart', JSON.stringify(cart));
}

function updateCartUI() {
  const totalQuantity = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalAmount = cart.reduce((acc, item) => acc + item.qty * item.price, 0);
  cartQty.textContent = totalQuantity;
  cartTotal.textContent = totalAmount.toFixed(2);

  cartItems.innerHTML = cart.length ? cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" onerror="this.onerror=null; this.src='${fallbackImageSrc}'" />
      <div>
        <strong>${item.title}</strong>
        <p>$${item.price.toFixed(2)} × ${item.qty}</p>
        <div class="qty-controls">
          <button class="qty-btn" data-dec="${item.id}">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-inc="${item.id}">+</button>
        </div>
        <button data-remove="${item.id}">Remove</button>
      </div>
    </div>
  `).join('') : '<p style="color:#516378; padding: 8px;">Your cart is empty.</p>';
}

function drawProducts(displayedProducts) {
  productGrid.innerHTML = displayedProducts.map(product => `
    <article class="product-card" data-id="${product.id}">
      <img src="${product.image}" alt="${product.title}" onerror="this.onerror=null; this.src='${fallbackImageSrc}'" />
      <h3>${product.title}</h3>
      <p>${product.desc}</p>
      <span>$${product.price.toFixed(2)}</span>
      <button class="btn primary add-to-cart" data-id="${product.id}">Add to Cart</button>
    </article>
  `).join('');
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  const found = cart.find(item => item.id === id);
  if (found) {
    found.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`${product.title} added to cart`);
}

function removeFromCart(id) {
  const idx = cart.findIndex(item => item.id === id);
  if (idx >= 0) {
    cart.splice(idx, 1);
    saveCart();
    updateCartUI();
    showToast('Item removed from cart');
  }
}

function updateItemQty(id, delta) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty < 1) {
    removeFromCart(id);
    return;
  }
  saveCart();
  updateCartUI();
}

function openCart() { cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden', 'false'); }
function closeCart() { cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden', 'true'); }

function filterProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const filtered = products.filter(product => {
    const matchText = product.title.toLowerCase().includes(query) || product.desc.toLowerCase().includes(query);
    const matchCat = category === 'all' || product.category === category;
    return matchText && matchCat;
  });
  drawProducts(filtered);
}

productGrid.addEventListener('click', (event) => {
  if (event.target.closest('.add-to-cart')) {
    const id = Number(event.target.closest('[data-id]').getAttribute('data-id'));
    addToCart(id);
  }
});

cartItems.addEventListener('click', (event) => {
  if (event.target.dataset.remove) {
    removeFromCart(Number(event.target.dataset.remove));
    return;
  }
  if (event.target.dataset.inc) {
    updateItemQty(Number(event.target.dataset.inc), 1);
    return;
  }
  if (event.target.dataset.dec) {
    updateItemQty(Number(event.target.dataset.dec), -1);
    return;
  }
});

document.getElementById('cartButton').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);

document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (!cart.length) {
    showToast('Cart is empty. Add products first.');
    return;
  }
  cart.length = 0;
  saveCart();
  updateCartUI();
  closeCart();
  showToast('Thank you! Checkout completed successfully.');
});

cartDrawer.addEventListener('click', (event) => {
  if (event.target === cartDrawer) {
    closeCart();
  }
});

searchInput.addEventListener('input', filterProducts);
categoryFilter.addEventListener('change', filterProducts);

document.getElementById('scrollProducts').addEventListener('click', () => {
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('contactForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const nameVal = document.getElementById('name').value.trim();
  const emailVal = document.getElementById('email').value.trim();
  const messageVal = document.getElementById('message').value.trim();
  if (!nameVal || !emailVal || !messageVal) {
    showToast('Please fill all contact fields');
    return;
  }
  showToast('Message sent! We will contact you soon.');
  event.target.reset();
});

// initialize
updateCartUI();
drawProducts(products);
filterProducts();
