const params = new URLSearchParams(location.search);
const id = params.get('id');
const product = PRODUCTS.find(p => p.id === id);

if (product) {
  const img = document.getElementById('prodImage');
  const name = document.getElementById('prodName');
  const priceEl = document.getElementById('prodPrice');
  const desc = document.getElementById('prodDesc');
  const sizes = document.getElementById('prodSizes');
  const addBtn = document.getElementById('addBtn');

  img.src = product.image;
  img.alt = product.name;
  name.textContent = product.name;
  priceEl.textContent = price(product.price);
  desc.textContent = product.description || '';

  sizes.innerHTML = SIZES.map(s => `<button class="size-btn" data-size="${s}">${s}</button>`).join('');

  let selectedSize = null;
  sizes.addEventListener('click', (e) => {
    const btn = e.target.closest('.size-btn');
    if (!btn) return;
    sizes.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedSize = btn.getAttribute('data-size');
  });

  addBtn.addEventListener('click', () => {
    if (!selectedSize) {
      sizes.classList.add('shake');
      setTimeout(() => sizes.classList.remove('shake'), 400);
      return;
    }
    addToCart(product, selectedSize);
    openDrawer();
  });
} else {
  const container = document.querySelector('.product-detail');
  if (container) container.innerHTML = '<p>Sản phẩm không tồn tại.</p>';
}
