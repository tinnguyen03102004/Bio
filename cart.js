/* Kadie.Nuwrld – cart.js (full)
   - Grid sản phẩm
   - Modal chi tiết + chọn size
   - Giỏ hàng (drawer) + localStorage
   - Badge số lượng giỏ (#cartCount)
*/

/* -----------------------
   CONFIG & UTIL
------------------------*/

// TODO: Cập nhật danh sách sản phẩm theo bộ sưu tập của bạn
const PRODUCTS = [
  {
    id: 'studios-basic-tee-white',
    name: 'Studios Basic T‑Shirt (White)',
    price: 390000,
    image: '/assets/p1.png',
    description: 'Chiếc áo thun trắng tối giản phù hợp mọi hoàn cảnh.'
  },
  {
    id: 'studios-basic-tee-black',
    name: 'Studios Basic T‑Shirt (Black)',
    price: 390000,
    image: '/assets/p2.png',
    description: 'Phiên bản màu đen của mẫu áo thun cơ bản.'
  },
  {
    id: 'studios-cap',
    name: 'Studios Cap',
    price: 320000,
    image: '/assets/p3.png',
    description: 'Mũ lưỡi trai phong cách thể thao.'
  },
  {
    id: 'studios-hoodie',
    name: 'Studios Hoodie',
    price: 690000,
    image: '/assets/p4.png',
    description: 'Áo hoodie ấm áp cho mùa lạnh.'
  }
];

const SIZES = ['S', 'M', 'L', 'XL'];

const CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

function price(v) {
  return CURRENCY_FORMATTER.format(v);
}

function qs(sel) {
  return document.querySelector(sel);
}
function qsa(sel) {
  return Array.from(document.querySelectorAll(sel));
}

/* -----------------------
   STATE
------------------------*/

let cart = loadCart(); // [{id, name, price, image, size, qty}]

/* -----------------------
   STORAGE
------------------------*/

function loadCart() {
  try {
    const raw = localStorage.getItem('kadie_cart_v2');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Cannot parse cart from storage', e);
    return [];
  }
}

function saveCart() {
  localStorage.setItem('kadie_cart_v2', JSON.stringify(cart));
}

/* -----------------------
   BADGE COUNT
------------------------*/

// Cập nhật badge – tương thích với header mới
const cartCountEl = qs('#cartCount');

// Cho phép các file khác gọi updateCartCount (nếu cần)
// n mặc định = tổng hiện tại trong giỏ
window.updateCartCount = function (n = getCartCount()) {
  if (!cartCountEl) return;
  cartCountEl.textContent = n;
  cartCountEl.style.display = n > 0 ? 'inline-block' : 'none';
  // bắn event cho nơi khác nếu muốn lắng nghe
  window.dispatchEvent(new CustomEvent('cart:count', { detail: n }));
};

// Tính tổng số item
function getCartCount() {
  return cart.reduce((s, it) => s + it.qty, 0);
}

/* -----------------------
   PRODUCT GRID
------------------------*/

function renderProductGrid() {
  const grid = qs('#productGrid');
  if (!grid) return;

  grid.innerHTML = PRODUCTS.map(p => `
    <a class="card" href="products/product.html?id=${p.id}">
      <div class="thumb">
        <img src="${p.image}" alt="${p.name}">
      </div>
      <div class="meta">
        <h3 class="name">${p.name}</h3>
        <div class="price">${price(p.price)}</div>
      </div>
    </a>
  `).join('');
}

/* -----------------------
   CART (DRAWER)
------------------------*/

const drawer = qs('#drawer');
const overlay = qs('#overlay');

function openDrawer() {
  drawer?.classList.add('open');
  overlay?.classList.add('open');
}

function closeDrawer() {
  drawer?.classList.remove('open');
  overlay?.classList.remove('open');
}

qs('#openCart')?.addEventListener('click', () => {
  renderCart();
  openDrawer();
});

qs('#closeCart')?.addEventListener('click', closeDrawer);
overlay?.addEventListener('click', closeDrawer);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDrawer();
});

/* -----------------------
   CART CORE
------------------------*/

function addToCart(product, size) {
  // nếu đã có item cùng id + size => tăng qty
  const idx = cart.findIndex(it => it.id === product.id && it.size === size);
  if (idx > -1) {
    cart[idx].qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      qty: 1
    });
  }
  saveCart();
  renderCart();
  window.updateCartCount(getCartCount());
}

function changeQty(id, size, delta) {
  const idx = cart.findIndex(it => it.id === id && it.size === size);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  renderCart();
  window.updateCartCount(getCartCount());
}

function removeItem(id, size) {
  const idx = cart.findIndex(it => it.id === id && it.size === size);
  if (idx === -1) return;
  cart.splice(idx, 1);
  saveCart();
  renderCart();
  window.updateCartCount(getCartCount());
}

function renderCart() {
  const list = qs('#cartItems');
  const subtotalEl = qs('#subtotal');
  if (!list || !subtotalEl) return;

  if (cart.length === 0) {
    list.innerHTML = `<p class="small" style="opacity:.7">Giỏ hàng trống.</p>`;
    subtotalEl.textContent = price(0);
    return;
  }

  list.innerHTML = cart.map(it => `
    <div class="cart-row" data-id="${it.id}" data-size="${it.size}">
      <img class="cart-thumb" src="${it.image}" alt="${it.name}">
      <div class="cart-info">
        <div class="cart-name">${it.name}</div>
        <div class="cart-opts small">Size: <strong>${it.size}</strong></div>
        <div class="cart-price">${price(it.price)}</div>
        <div class="cart-qty">
          <button class="qty dec" aria-label="Giảm">−</button>
          <span class="q">${it.qty}</span>
          <button class="qty inc" aria-label="Tăng">+</button>
        </div>
      </div>
      <button class="remove" aria-label="Xoá">×</button>
    </div>
  `).join('');

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  subtotalEl.textContent = price(subtotal);

  // lắng nghe các nút trong list (event delegation)
  list.onclick = (e) => {
    const row = e.target.closest('.cart-row');
    if (!row) return;
    const id = row.getAttribute('data-id');
    const size = row.getAttribute('data-size');

    if (e.target.closest('.remove')) {
      removeItem(id, size);
      return;
    }
    if (e.target.closest('.inc')) {
      changeQty(id, size, +1);
      return;
    }
    if (e.target.closest('.dec')) {
      changeQty(id, size, -1);
      return;
    }
  };
}

/* -----------------------
   INIT
------------------------*/

function init() {
  renderProductGrid();
  renderCart();
  window.updateCartCount(getCartCount());
  // Auto close modal/drawer khi resize lớn (tránh stuck)
  window.addEventListener('resize', () => {
    // tuỳ bạn muốn xử lý gì thêm cho desktop
  });
}

document.addEventListener('DOMContentLoaded', init);

/* -----------------------
   MINIMAL STYLES HOOKS (tuỳ bạn)
   (Nếu cần style nhanh cho cart-row/size-btn)
------------------------*/

/* 
Gợi ý CSS đã dùng trong HTML hiện tại:
.size-btn { border:1px solid #000; padding:8px 12px; margin-right:6px; border-radius:6px; background:#fff; }
.size-btn.active { background:#000; color:#fff; }
.modal-cta { margin:12px 0 8px; }
.modal-cta .add-to-cart { width:100%; padding:12px 16px; border-radius:8px; border:1px solid #000; background:#000; color:#fff; }

.cart-row { display:flex; gap:12px; align-items:center; padding:10px 0; border-bottom:1px solid #eee; }
.cart-thumb { width:64px; height:64px; object-fit:cover; border-radius:8px; border:1px solid #eee; }
.cart-info { flex:1; }
.cart-name { font-weight:600; }
.cart-qty { display:flex; align-items:center; gap:8px; margin-top:6px; }
.qty { width:28px; height:28px; border:1px solid #000; border-radius:6px; background:#fff; display:grid; place-items:center; }
.qty.inc, .qty.dec { width:28px; height:28px; }
.remove { border:1px solid #000; border-radius:6px; width:28px; height:28px; background:#fff; }
*/
