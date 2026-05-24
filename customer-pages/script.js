const API = 'http://localhost:8000/products/';
const token = () => localStorage.getItem('token');

let wishlistIds = new Set();

async function loadWishlistIds() {
    const t = token();
    if (!t) return;
    try {
        const r = await fetch('http://localhost:8000/wishlist/ids', {
            headers: { 'Authorization': 'Bearer ' + t }
        });
        if (r.ok) {
            const data = await r.json();
            wishlistIds = new Set(data.ids || []);
            document.querySelectorAll('.wish-btn').forEach(btn => {
                const pid = parseInt(btn.dataset.productId);
                updateHeartBtn(btn, wishlistIds.has(pid));
            });
        }
    } catch (e) {}
}

function updateHeartBtn(btn, active) {
    btn.setAttribute('data-wishlisted', active ? '1' : '0');
    btn.style.color = active ? '#c0516f' : 'rgba(255,255,255,.7)';
    btn.title = active ? 'Remove from Wishlist' : 'Save to Wishlist';
}

/* ── build one product card ── */
function makeCard(p, badgeText) {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.onclick = (e) => {
        if (e.target.closest('.add-to-cart-btn') || e.target.closest('.wish-btn')) return;
        window.location.href = `/static/customer-pages/product.html?id=${p.id}`;
    };
    const sizesAttr = p.sizes ? `data-sizes="${p.sizes}"` : '';
    const nameAttr = `data-product-name="${p.product_name.replace(/"/g, '&quot;')}"`;
    div.innerHTML = `
        <div class="prod-img-wrap">
            <img src="${p.img || '/static/public/img2.jpg'}" alt="${p.product_name}" loading="lazy">
            <div class="prod-overlay">
                <button class="btn-outline add-to-cart-btn" data-product-id="${p.id}" ${sizesAttr} ${nameAttr}
                    style="color:white;border-color:rgba(255,255,255,.6);font-size:10px"
                    ${Number(p.quantity) <= 0 ? 'disabled' : ''}>
                    ${Number(p.quantity) > 0 ? 'Quick Add' : 'Out of Stock'}
                </button>
            </div>
            <button class="wish-btn" data-product-id="${p.id}" data-wishlisted="0" title="Save to Wishlist"
                style="position:absolute;top:10px;right:10px;background:rgba(28,20,20,.45);border:none;border-radius:50%;width:34px;height:34px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.7);backdrop-filter:blur(4px);transition:color .2s,background .2s">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            </button>
        </div>
        <div class="prod-info">
            ${badgeText ? `<span class="prod-badge">${badgeText}</span>` : ''}
            <p class="prod-name">${p.product_name}</p>
            <p class="prod-desc">${p.product_Description || 'Premium seasonal piece'}</p>
            <p class="prod-price">PKR ${Number(p.price).toLocaleString()}</p>
            <p class="prod-stock">${Number(p.quantity) > 0 ? `${p.quantity} in stock` : 'Out of stock'}</p>
            <button class="btn-outline add-to-cart-btn" data-product-id="${p.id}" ${sizesAttr} ${nameAttr}
                style="width:100%;margin-top:8px"
                ${Number(p.quantity) <= 0 ? 'disabled' : ''}>
                ${Number(p.quantity) > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
        </div>`;
    const wishBtn = div.querySelector('.wish-btn');
    updateHeartBtn(wishBtn, wishlistIds.has(p.id));
    return div;
}

function renderProducts(gridId, products, emptyText) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';
    if (!products || !products.length) {
        grid.innerHTML = `<p class="empty-state">${emptyText || 'No products found for this filter.'}</p>`;
        return;
    }
    products.forEach(p => grid.appendChild(makeCard(p, gridId === 'eid-grid' ? 'New Season' : '')));
}

/* ── load eid collection ── */
async function loadEidCollection() {
    try {
        const r = await fetch(API + '?limit=8');
        if (!r.ok) return;
        renderProducts('eid-grid', await r.json());
    } catch (e) { console.error(e); }
}

/* ── load trending ── */
async function loadTrending(fabric, btn) {
    if (btn) {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
    }
    let url = API + '?limit=6';
    if (fabric) url += '&fabric_type=' + fabric;
    try {
        const r = await fetch(url);
        if (!r.ok) return;
        const data = await r.json();
        data.sort(() => Math.random() - 0.5);
        renderProducts('trending-grid', data, 'No trending products found.');
    } catch (e) { console.error(e); }
}

/* ── filter products — all 4 params, any can be null ── */
function filterProducts(category, fabric_type, style, pieces) {
    let url = API + '?limit=24';
    if (category) url += '&category=' + category;
    if (fabric_type) url += '&fabric_type=' + fabric_type;
    if (style) url += '&style=' + style;
    if (pieces) url += '&pieces=' + pieces;

    fetch(url)
        .then(r => r.json())
        .then(data => {
            renderProducts('eid-grid', data);
            document.getElementById('eid').scrollIntoView({ behavior: 'smooth' });
        })
        .catch(console.error);
}

function filterAndScroll(category) {
    filterProducts(category, null, null, null);
}

/* ── wishlist toggle (event delegation) ── */
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.wish-btn');
    if (!btn) return;
    e.stopPropagation();
    e.preventDefault();

    const t = token();
    if (!t) { window.location.href = '/static/customer-pages/login.html'; return; }

    const pid = parseInt(btn.dataset.productId);
    try {
        const r = await fetch(`http://localhost:8000/wishlist/${pid}`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + t }
        });
        if (r.ok) {
            const data = await r.json();
            if (data.wishlisted) wishlistIds.add(pid); else wishlistIds.delete(pid);
            updateHeartBtn(btn, data.wishlisted);
        } else if (r.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/static/customer-pages/login.html';
        }
    } catch (e) { console.error(e); }
});

/* ── add to cart (event delegation) ── */
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn) return;
    e.stopPropagation();
    e.preventDefault();

    const t = token();
    if (!t) { window.location.href = '/static/customer-pages/login.html'; return; }

    const id = parseInt(btn.dataset.productId);
    const rawSizes = (btn.dataset.sizes || '').trim();
    const productName = btn.dataset.productName || '';

    const sizes = rawSizes
        ? rawSizes.split(',').map(s => s.trim()).filter(Boolean)
        : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    showSizePicker(id, productName, sizes);
});

/* ── size picker popup ── */
function showSizePicker(productId, productName, sizes) {
    const el = document.createElement('div');
    el.className = 'popup-overlay';
    el.innerHTML = `
        <div class="popup-box">
            <h3>Select Size</h3>
            <p style="font-size:13px;color:var(--text-muted);margin-bottom:18px;line-height:1.5">${productName}</p>
            <div class="size-picker-grid">
                ${sizes.map(s => `<button class="size-pick-btn" data-size="${s}">${s}</button>`).join('')}
            </div>
            <p class="size-pick-error" id="size-pick-err"></p>
            <div class="popup-actions" style="margin-top:20px">
                <button class="btn-outline" id="size-cancel">Cancel</button>
                <button class="btn-fill" id="size-confirm">Add to Bag</button>
            </div>
        </div>`;
    document.body.appendChild(el);

    let chosen = null;

    el.querySelectorAll('.size-pick-btn').forEach(btn => {
        btn.onclick = () => {
            el.querySelectorAll('.size-pick-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            chosen = btn.dataset.size;
            document.getElementById('size-pick-err').textContent = '';
        };
    });

    el.querySelector('#size-cancel').onclick = () => el.remove();
    el.querySelector('#size-confirm').onclick = async () => {
        if (!chosen) {
            document.getElementById('size-pick-err').textContent = 'Please select a size.';
            return;
        }
        el.remove();
        await doAddToCart(productId, chosen);
    };
    el.addEventListener('click', ev => { if (ev.target === el) el.remove(); });
}

/* ── actual cart API call ── */
async function doAddToCart(productId, size) {
    const t = token();
    if (!t) { window.location.href = '/static/customer-pages/login.html'; return; }
    try {
        const body = { product_id: productId, quantity: 1 };
        if (size) body.size = size;
        const r = await fetch('http://localhost:8000/cart/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + t },
            body: JSON.stringify(body)
        });
        if (r.ok) {
            showCartPopup();
            if (window.KairosNav) KairosNav.loadCartBadge();
        } else if (r.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/static/customer-pages/login.html';
        }
    } catch (err) { console.error('Add to cart error:', err); }
}

/* ── cart added popup ── */
function showCartPopup() {
    const el = document.createElement('div');
    el.className = 'popup-overlay';
    el.innerHTML = `
        <div class="popup-box">
            <h3>Added to Bag</h3>
            <p>Item has been added to your cart.</p>
            <div class="popup-actions">
                <button class="btn-outline" id="continueBtn">Continue Shopping</button>
                <button class="btn-fill" id="checkoutBtn">View Cart</button>
            </div>
        </div>`;
    document.body.appendChild(el);
    el.querySelector('#continueBtn').onclick = () => el.remove();
    el.querySelector('#checkoutBtn').onclick = () => window.location.href = '/static/customer-pages/checkout.html';
    el.addEventListener('click', e => { if (e.target === el) el.remove(); });
}

/* ── newsletter ── */
function subscribeNewsletter() {
    const email = document.getElementById('newsletter-email').value.trim();
    const msg = document.getElementById('newsletter-msg');
    if (!email || !email.includes('@')) {
        msg.textContent = 'Please enter a valid email address.';
        return;
    }
    msg.textContent = 'Thank you for subscribing!';
    document.getElementById('newsletter-email').value = '';
}

/* ── init: read URL params and load ── */
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const fabric_type = params.get('fabric_type');
    const style = params.get('style');
    const pieces = params.get('pieces');

    if (category || fabric_type || style || pieces) {
        filterProducts(category, fabric_type, style, pieces);
    } else {
        loadEidCollection();
    }
    loadTrending('printed', null);
    loadWishlistIds();
});
