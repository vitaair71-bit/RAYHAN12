// === Helper cepat ===
const qs = id => document.getElementById(id);

// === DATA PRODUK ===
const products = [
  {
    id: "hitam",
    name: "Hitam",
    displayName: "BAJU HITAM",
    price: 50000,
    image: "images/hitam.jpeg",
    rating: 5
  },
  {
    id: "putih",
    name: "Putih",
    displayName: "BAJU PUTIH",
    price: 50000,
    image: "images/putih.jpeg",
    rating: 3
  },
  {
    id: "merah",
    name: "Merah",
    displayName: "BAJU MERAH",
    price: 50000,
    image: "images/merah.jpeg",
    rating: 3
  }
];

// === BINTANG RATING ===
function createStarRating(rating) {
  const ratingDiv = document.createElement('div');
  ratingDiv.className = 'product-rating flex gap-1 text-yellow-400';
  ratingDiv.title = `Rating ${rating}/5`;

  for (let i = 0; i < 5; i++) {
    const star = document.createElement('i');
    star.className = i < rating ? 'ri-star-fill' : 'ri-star-line';
    ratingDiv.appendChild(star);
  }

  return ratingDiv;
}

// === TOMBOL UKURAN ===
function createSizeButtons(ariaLabel) {
  const sizes = ['M', 'L', 'XL'];
  const sizeDiv = document.createElement('div');
  sizeDiv.className = 'size-buttons';
  sizeDiv.setAttribute('role', 'group');
  sizeDiv.setAttribute('aria-label', ariaLabel);

  sizes.forEach(size => {
    const btn = document.createElement('button');
    btn.className = 'size-btn';
    btn.type = 'button';
    btn.textContent = size;
    sizeDiv.appendChild(btn);
  });

  return sizeDiv;
}

// === RENDER PRODUK ===
function renderProducts(productList, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  productList.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;
    card.dataset.name = product.name;
    card.dataset.price = product.price;
    card.dataset.image = product.image;

    const img = document.createElement('img');
    img.src = product.image;
    img.alt = `Kaos ${product.name}`;
    img.className = 'product-image';

    const name = document.createElement('h3');
    name.className = 'product-name';
    name.textContent = product.displayName;

    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = `Rp${product.price.toLocaleString('id-ID')}`;

    const ratingStars = createStarRating(product.rating);
    const sizeButtons = createSizeButtons(`Pilih ukuran kaos ${product.name.toLowerCase()}`);

    const addToCartBtn = document.createElement('button');
    addToCartBtn.className = 'add-to-cart-btn btn btn-success mt-auto';
    addToCartBtn.type = 'button';
    addToCartBtn.setAttribute('aria-label', `Tambah ${product.name} ke keranjang`);
    addToCartBtn.textContent = 'Tambah Keranjang';

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(ratingStars);
    card.appendChild(price);
    card.appendChild(sizeButtons);
    card.appendChild(addToCartBtn);

    container.appendChild(card);
  });
}

// === EVENT HANDLERS ===
document.addEventListener("DOMContentLoaded", () => {
  // === DOM SELECTORS ===
  const menuToggle = qs("menu-toggle");
  const cartToggle = qs("cart-toggle");
  const sidebarMenu = qs("sidebar-menu");
  const sidebarCart = qs("sidebar-cart");
  const overlay = qs("overlay");
  const cartItemsContainer = qs("cart-items");
  const cartTotalEl = qs("cart-total");
  const checkoutBtn = qs("checkout-btn");
  const loginBtn = qs("loginBtn");
  const modal = qs("loginModal");
  const closeBtn = document.querySelector(".close");
  const closeCartBtn = qs("close-cart"); // ✅ tombol X keranjang

  // === TOGGLE SIDEBAR ===
  function closeAll() {
    sidebarMenu?.classList.remove("open");
    sidebarCart?.classList.remove("open");
    overlay?.classList.remove("active");
  }

  menuToggle?.addEventListener("click", () => {
    sidebarMenu.classList.toggle("open");
    sidebarCart?.classList.remove("open");
    overlay.classList.toggle("active", sidebarMenu.classList.contains("open"));
  });

  cartToggle?.addEventListener("click", () => {
    sidebarCart.classList.toggle("open");
    sidebarMenu?.classList.remove("open");
    overlay.classList.toggle("active", sidebarCart.classList.contains("open"));
  });

  overlay?.addEventListener("click", closeAll);

  // === TOMBOL CLOSE (❌) SIDEBAR CART ===
  closeCartBtn?.addEventListener("click", () => {
    sidebarCart.classList.remove("open");
    overlay.classList.remove("active");
  });

  // === KERANJANG ===
  let cart = JSON.parse(localStorage.getItem("checkout") || "[]");

  function saveCart() {
    localStorage.setItem("checkout", JSON.stringify(cart));
  }

  function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartCountEl = qs("cart-count");
    if (cartCountEl) {
      cartCountEl.textContent = count > 0 ? count : "";
      cartCountEl.style.display = count > 0 ? "flex" : "none";
    }
  }

  function updateCartUI() {
    cartItemsContainer.innerHTML = "";
    let totalPrice = 0;

    cart.forEach(({ id, name, size, price, image, qty }) => {
      totalPrice += price * qty;
      const itemEl = document.createElement("div");
      itemEl.className = "cart-item";
      itemEl.innerHTML = `
        <img src="${image}" alt="${name}" />
        <div class="cart-item-info">
          <div>${name}</div>
          <div class="cart-item-size">Size: ${size}</div>
          <div class="cart-item-price">Rp${(price * qty).toLocaleString("id-ID")}</div>
        </div>
        <div class="cart-item-qty">${qty}</div>
        <div class="cart-item-remove text-red-500 text-xl cursor-pointer" title="Hapus item">
          <i class="ri-delete-bin-line"></i>
        </div>
      `;

      itemEl.querySelector(".cart-item-remove").addEventListener("click", () => {
        removeFromCart(id, size);
      });

      cartItemsContainer.appendChild(itemEl);
    });

    cartTotalEl.textContent = "Rp" + totalPrice.toLocaleString("id-ID");
    updateCartCount();
  }

  function addToCart(product) {
    const index = cart.findIndex(i => i.id === product.id && i.size === product.size);
    if (index > -1) {
      cart[index].qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    saveCart();
    updateCartUI();
  }

  function removeFromCart(id, size) {
    cart = cart.filter(item => !(item.id === id && item.size === size));
    saveCart();
    updateCartUI();
  }

  // === RENDER PRODUK ===
  renderProducts(products, 'product');

  // === AKTIFKAN UKURAN & ADD TO CART ===
  document.querySelectorAll(".product-card").forEach((card) => {
    const sizeButtons = card.querySelectorAll(".size-btn");
    sizeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        sizeButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
      if (btn.textContent.trim() === "M") {
        btn.classList.add("active");
      }
    });

    const btnAdd = card.querySelector(".add-to-cart-btn");
    btnAdd?.addEventListener("click", () => {
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseInt(card.dataset.price);
      const image = card.dataset.image;
      const sizeBtn = card.querySelector(".size-btn.active");

      if (!sizeBtn) {
        alert("Pilih ukuran terlebih dahulu!");
        return;
      }

      const size = sizeBtn.textContent.trim();
      addToCart({ id, name, size, price, image });
    });
  });

  // === CHECKOUT ===
  checkoutBtn?.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Keranjang kosong!");
      return;
    }
    window.location.href = "checkout.html";
  });

  // === MODAL LOGIN ===
  loginBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "block";
  });

  closeBtn?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // === INIT ===
  updateCartUI();
});
