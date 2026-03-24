const products = [
  { id: 1, title: 'Immune Boost Daily Gummies', category: 'supplement', price: 2599, desc: 'Vitamin C + Zinc with natural elderberry for immunity.', image: 'https://images.unsplash.com/photo-1626945220945-a115fab47733?auto=format&fit=crop&w=500&q=80' },
  { id: 2, title: 'Smart Heart Monitor Band', category: 'device', price: 13999, desc: '24/7 ECG tracking with anomaly alerts and app sync.', image: 'https://images.unsplash.com/photo-1575311373937-040b3ff6e056?auto=format&fit=crop&w=500&q=80' },
  { id: 3, title: 'Sleep Wellness Kit', category: 'wellness', price: 6800, desc: 'Melatonin formula, guided audio, and blue-light blocking glasses.', image: 'https://images.unsplash.com/photo-1551632786-de41ec16a85e?auto=format&fit=crop&w=500&q=80' },
  { id: 4, title: 'Joint Flex Advanced', category: 'supplement', price: 3850, desc: 'Glucosamine + MSM for joint arthritis comfort.', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?auto=format&fit=crop&w=500&q=80' },
  { id: 5, title: 'Allergy Quick Relief Spray', category: 'supplement', price: 2175, desc: 'Fast, drug-free nasal spray for pollen sensitivity.', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?auto=format&fit=crop&w=500&q=80' },
  { id: 6, title: 'Infusion Hydration Pack', category: 'wellness', price: 4500, desc: 'Electrolyte bundle for athletes and recovery days.', image: 'https://images.unsplash.com/photo-1609343882288-e0b3b27b0665?auto=format&fit=crop&w=500&q=80' }
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
  cartTotal.textContent = totalAmount.toLocaleString();

  cartItems.innerHTML = cart.length ? cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" onerror="this.onerror=null; this.src='${fallbackImageSrc}'" />
      <div>
        <strong>${item.title}</strong>
        <p>KES ${item.price.toLocaleString()} × ${item.qty}</p>
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
      <span>KES ${product.price.toLocaleString()}</span>
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

const paymentMethod = document.getElementById('paymentMethod');
const addressSelect = document.getElementById('addressSelect');
const newAddressInput = document.getElementById('newAddressInput');
const addAddressBtn = document.getElementById('addAddressBtn');

const savedAddresses = [
  'Home - Nairobi, Kajiado Road',
  'Work - Nairobi CBD, Moi Avenue',
  'Family - Thika, Green Park',
];

function populateAddressOptions() {
  addressSelect.innerHTML = savedAddresses.map(addr => `<option value="${addr}">${addr}</option>`).join('');
}

addAddressBtn.addEventListener('click', () => {
  const newAddr = newAddressInput.value.trim();
  if (!newAddr) { showToast('Enter a valid address first'); return; }
  savedAddresses.push(newAddr);
  populateAddressOptions();
  addressSelect.value = newAddr;
  newAddressInput.value = '';
  showToast('New address saved');
});

populateAddressOptions();

document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (!cart.length) {
    showToast('Cart is empty. Add products first.');
    return;
  }

  const method = paymentMethod.value;
  const total = cart.reduce((acc, item) => acc + item.qty * item.price, 0);
  const chosenAddress = addressSelect.value;
  if (!chosenAddress) {
    showToast('Select or add a delivery address.');
    return;
  }

  if (method === 'mpesa') {
    const shortcode = '123456';
    const till = '987654';
    showToast(`M-Pesa: Paybill ${shortcode}, Account: ${till}, KES ${total.toLocaleString()} to deliver to ${chosenAddress}`);
  } else {
    showToast(`Card payment selected for KES ${total.toLocaleString()}. Delivery to ${chosenAddress}`);
  }

  setTimeout(() => {
    cart.length = 0;
    saveCart();
    updateCartUI();
    closeCart();
    showToast(`Order confirmed! Delivery address: ${chosenAddress}`);
  }, 2000);
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
