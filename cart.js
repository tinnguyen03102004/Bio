/** Simple cart for static site (localStorage) — v2 white theme **/
const LS_KEY = 'kadie_cart';

const products = [
  {id:'kadie-hoodie', name:'Kadie.Nuwrld Classic Hoodie', price: 650000, image:'assets/p1.jpg', sizes:['S','M','L']},
  {id:'kadie-sweatpants', name:'Kadie.Nuwrld Classic Sweatpants', price: 479000, image:'assets/p2.jpg', sizes:['S','M','L']},
  {id:'classic-tee-green', name:'Classic T‑Shirt — Green', price: 349000, image:'assets/p3.jpg', sizes:['S','M','L']},
  {id:'classic-tee-orange', name:'Classic T‑Shirt — Orange', price: 349000, image:'assets/p4.jpg', sizes:['S','M','L']},
];

function formatCurrency(v){
  return (v||0).toLocaleString('vi-VN') + '₫';
}

function loadCart(){
  try{ return JSON.parse(localStorage.getItem(LS_KEY)) || {items:[]} }catch(e){ return {items:[]} }
}
function saveCart(cart){ localStorage.setItem(LS_KEY, JSON.stringify(cart)); }

function addToCart(id, size){
  const cart = loadCart();
  const p = products.find(x=>x.id===id);
  const key = id + '::' + (size||'');
  const found = cart.items.find(x=>x.key===key);
  if(found){ found.qty += 1; }
  else{
    cart.items.push({ key, id, name:p.name, price:p.price, image:p.image, size, qty:1 });
  }
  saveCart(cart);
  renderCart();
  openDrawer();
}

function removeFromCart(key){
  const cart = loadCart();
  const idx = cart.items.findIndex(x=>x.key===key);
  if(idx>-1){ cart.items.splice(idx,1); saveCart(cart); renderCart(); }
}
function changeQty(key, delta){
  const cart = loadCart();
  const it = cart.items.find(x=>x.key===key);
  if(!it) return;
  it.qty = Math.max(1, it.qty + delta);
  saveCart(cart); renderCart();
}

function calcSubtotal(){
  const cart = loadCart();
  return cart.items.reduce((s,i)=> s + i.price*i.qty, 0);
}

function renderGrid(){
  const el = document.getElementById('productGrid');
  if(!el) return;
  el.innerHTML = products.map(p => `
    <article class="card">
      <div class="imgwrap"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
      <h3 class="title">${p.name}</h3>
      <div class="price">From ${formatCurrency(p.price)}</div>
      <div class="size-row">
        ${p.sizes.map(s => `<button class="size-btn" onclick="addToCart('${p.id}','${s}')">${s}</button>`).join('')}
      </div>
    </article>
  `).join('');
}

function renderCart(){
  const itemsEl = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('subtotal');
  if(!itemsEl || !subtotalEl) return;

  const cart = loadCart();
  if(cart.items.length===0){
    itemsEl.innerHTML = `<p class="small">Giỏ trống.</p>`;
    subtotalEl.textContent = '0₫';
    return;
  }
  itemsEl.innerHTML = cart.items.map(it => `
    <div class="line">
      <img src="${it.image}" alt="${it.name}">
      <div class="meta">
        <div><strong>${it.name}</strong></div>
        <div class="small">Size: ${it.size||'-'}</div>
        <div class="qty">
          <button onclick="changeQty('${it.key}',-1)">-</button>
          <span>${it.qty}</span>
          <button onclick="changeQty('${it.key}',1)">+</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <strong>${formatCurrency(it.price*it.qty)}</strong>
        <button class="cart-button" onclick="removeFromCart('${it.key}')">Xoá</button>
      </div>
    </div>
  `).join('');

  subtotalEl.textContent = formatCurrency(calcSubtotal());
}

function openDrawer(){ 
  document.getElementById('drawer').classList.add('open'); 
  document.getElementById('overlay').classList.add('open'); 
}
function closeDrawer(){ 
  document.getElementById('drawer').classList.remove('open'); 
  document.getElementById('overlay').classList.remove('open'); 
}

function getOrderFromStorage(){
  const cart = loadCart();
  const total = calcSubtotal();
  let code = localStorage.getItem('kadie_order_code');
  if(!code){
    code = 'KADIE-' + new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14);
    localStorage.setItem('kadie_order_code', code);
  }
  return { items: cart.items, total, code };
}

function collectOrder(customer){
  const order = getOrderFromStorage();
  return {
    code: order.code,
    customer: customer || {},
    items: order.items,
    total: order.total,
    payment: (customer && customer.payment) || 'COD',
    createdAt: new Date().toISOString()
  };
}

function buildTextPayload(payload){
  const lines = [];
  lines.push('KADIE.NUWRLD — ORDER ' + payload.code);
  lines.push('Tên: ' + (payload.customer.fullname||''));
  lines.push('SĐT: ' + (payload.customer.phone||''));
  lines.push('Địa chỉ: ' + (payload.customer.address||''));
  lines.push('Phương thức: ' + (payload.payment||''));
  lines.push('--- Items ---');
  payload.items.forEach(i => lines.push(`- ${i.name} (${i.size||'-'}) x${i.qty} = ${formatCurrency(i.price*i.qty)}`));
  lines.push('Tổng: ' + formatCurrency(payload.total));
  lines.push('Ghi chú: ' + (payload.customer.note||''));
  return lines.join('\\n');
}

if(document.getElementById('openCart')){
  document.getElementById('openCart').addEventListener('click', openDrawer);
  document.getElementById('closeCart').addEventListener('click', closeDrawer);
  document.getElementById('overlay').addEventListener('click', closeDrawer);
  renderGrid();
  renderCart();
}