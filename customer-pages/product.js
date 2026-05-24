const BASE = 'http://localhost:8000';
const token = () => localStorage.getItem('token');
let selectedSize = null;
let currentProduct = null;
let selectedRating = 0;
let isWishlisted = false;

/* ── Size Guide Modal ── */
function openSizeGuide() {
    document.getElementById('size-guide-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function closeSizeGuide() {
    document.getElementById('size-guide-modal').style.display = 'none';
    document.body.style.overflow = '';
}

/* ── Wishlist Toggle ── */
async function toggleWishlist() {
    const t = token();
    if (!t) {
        const page = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/static/customer-pages/login.html?next=${page}`;
        return;
    }
    if (!currentProduct) return;

    try {
        const r = await fetch(`${BASE}/wishlist/${currentProduct.id}`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + t }
        });
        if (r.ok) {
            const data = await r.json();
            isWishlisted = data.wishlisted;
            updateHeartIcon();
        }
    } catch (e) { console.error(e); }
}

function updateHeartIcon() {
    const btn = document.getElementById('wishlist-btn');
    const icon = document.getElementById('heart-icon');
    if (!btn || !icon) return;
    if (isWishlisted) {
        icon.style.fill = '#c0516f';
        icon.style.stroke = '#c0516f';
        btn.title = 'Remove from Wishlist';
    } else {
        icon.style.fill = 'none';
        icon.style.stroke = 'currentColor';
        btn.title = 'Add to Wishlist';
    }
}

async function checkWishlistState(productId) {
    const t = token();
    if (!t) return;
    try {
        const r = await fetch(`${BASE}/wishlist/ids`, {
            headers: { 'Authorization': 'Bearer ' + t }
        });
        if (r.ok) {
            const data = await r.json();
            isWishlisted = (data.ids || []).includes(productId);
            updateHeartIcon();
        }
    } catch (e) {}
}

/* ── Star Rating Input ── */
function setupStarInput() {
    const stars = document.querySelectorAll('.star-pick');
    stars.forEach(star => {
        star.addEventListener('mouseover', () => highlightStars(parseInt(star.dataset.v)));
        star.addEventListener('mouseout', () => highlightStars(selectedRating));
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.v);
            highlightStars(selectedRating);
        });
    });
}

function highlightStars(count) {
    document.querySelectorAll('.star-pick').forEach((s, i) => {
        s.style.color = i < count ? '#b8965a' : '#d4c4b8';
    });
}

/* ── Reviews ── */
async function loadReviews(productId) {
    try {
        const r = await fetch(`${BASE}/products/${productId}/reviews`);
        if (!r.ok) return;
        const reviews = await r.json();

        const section = document.getElementById('reviews-section');
        section.style.display = '';

        const listEl = document.getElementById('reviews-list');
        const avgEl = document.getElementById('avg-rating-display');
        const pdRatingRow = document.getElementById('pd-rating-row');

        if (reviews.length) {
            const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
            const avgRounded = avg.toFixed(1);
            const stars = '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));

            avgEl.innerHTML = `<span class="avg-stars">${stars}</span> <span class="avg-num">${avgRounded}</span> <span class="avg-label">/ 5 (${reviews.length} review${reviews.length !== 1 ? 's' : ''})</span>`;

            if (pdRatingRow) {
                pdRatingRow.style.display = 'flex';
                document.getElementById('pd-stars').innerHTML = stars.split('').map(s =>
                    `<span style="color:${s==='★'?'#b8965a':'#d4c4b8'}">${s}</span>`).join('');
                document.getElementById('pd-review-count').textContent = `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`;
            }

            listEl.innerHTML = reviews.map(rev => `
                <div class="review-card">
                    <div class="review-top">
                        <span class="reviewer-name">${rev.reviewer_name || 'Anonymous'}</span>
                        <span class="review-stars">${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</span>
                        <span class="review-date">${new Date(rev.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    ${rev.content ? `<p class="review-text">${rev.content}</p>` : ''}
                </div>`).join('');
        } else {
            avgEl.innerHTML = '<span style="color:var(--text-muted);font-size:14px">No reviews yet. Be the first!</span>';
            listEl.innerHTML = '';
        }

        setupStarInput();

    } catch (e) { console.error(e); }
}

async function submitReview() {
    const t = token();
    const msgEl = document.getElementById('review-msg');
    msgEl.textContent = '';

    if (!t) {
        msgEl.style.color = 'var(--rose)';
        msgEl.textContent = 'Please login to submit a review.';
        return;
    }
    if (!selectedRating) {
        msgEl.style.color = 'var(--rose)';
        msgEl.textContent = 'Please select a rating.';
        return;
    }
    if (!currentProduct) return;

    const content = document.getElementById('review-text').value.trim();

    try {
        const r = await fetch(`${BASE}/products/${currentProduct.id}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + t },
            body: JSON.stringify({ rating: selectedRating, content })
        });
        const data = await r.json();
        if (r.ok) {
            msgEl.style.color = '#4a7c59';
            msgEl.textContent = 'Review submitted! Thank you.';
            document.getElementById('review-text').value = '';
            selectedRating = 0;
            highlightStars(0);
            loadReviews(currentProduct.id);
        } else {
            msgEl.style.color = 'var(--rose)';
            msgEl.textContent = data.detail || 'Could not submit review.';
        }
    } catch (e) {
        msgEl.style.color = 'var(--rose)';
        msgEl.textContent = 'Error submitting review.';
    }
}

/* ── Related Products ── */
async function loadRelated(product) {
    if (!product.category) return;
    try {
        const params = new URLSearchParams({ limit: '5' });
        if (product.category) params.set('category', product.category);

        const r = await fetch(`${BASE}/products/?${params}`);
        if (!r.ok) return;
        const all = await r.json();
        const related = all.filter(p => p.id !== product.id).slice(0, 4);
        if (!related.length) return;

        const section = document.getElementById('related-section');
        const grid = document.getElementById('related-grid');
        section.style.display = '';

        grid.innerHTML = related.map(p => `
            <div class="prod-card" onclick="window.location.href='/static/customer-pages/product.html?id=${p.id}'">
                <div class="prod-img-wrap">
                    <img src="${p.img || '/static/public/img2.jpg'}" alt="${p.product_name}" loading="lazy">
                </div>
                <div class="prod-info">
                    <h3 class="prod-name">${p.product_name}</h3>
                    <p class="prod-price">PKR ${Number(p.price).toLocaleString()}</p>
                </div>
            </div>`).join('');
    } catch (e) { console.error(e); }
}

/* ── Main Product Loader ── */
async function loadProduct() {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { document.getElementById('pd-name').textContent = 'Product not found.'; return; }

    try {
        const r = await fetch(`${BASE}/products/${id}`);
        if (!r.ok) { document.getElementById('pd-name').textContent = 'Product not found.'; return; }
        const p = await r.json();
        currentProduct = p;

        // SEO meta
        document.title = p.product_name + ' — Kairos';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.content = p.product_Description || `${p.product_name} — Premium Pakistani fashion by Kairos.`;

        // Breadcrumb
        if (p.category) {
            const bcCat = document.getElementById('bc-category');
            bcCat.textContent = p.category.toUpperCase();
            bcCat.href = `/static/customer-pages/index.html?category=${p.category}`;
        }
        document.getElementById('bc-name').textContent = p.product_name;

        // Main info
        document.getElementById('pd-img').src = p.img || '/static/public/img2.jpg';
        document.getElementById('pd-img').alt = p.product_name;
        document.getElementById('pd-category').textContent = p.category ? p.category.toUpperCase() : '';
        document.getElementById('pd-name').textContent = p.product_name;
        document.getElementById('pd-price').textContent = 'PKR ' + Number(p.price).toLocaleString();
        document.getElementById('pd-description').textContent = p.product_Description || 'Premium seasonal piece.';

        const stockEl = document.getElementById('pd-stock');
        stockEl.textContent = Number(p.quantity) > 0 ? `${p.quantity} pieces available` : 'Out of stock';

        if (p.fabric_type) { document.getElementById('pd-fabric').textContent = p.fabric_type; document.getElementById('pd-fabric-row').style.display = 'flex'; }
        if (p.style)       { document.getElementById('pd-style').textContent = p.style;         document.getElementById('pd-style-row').style.display = 'flex'; }
        if (p.pieces)      { document.getElementById('pd-pieces').textContent = p.pieces;        document.getElementById('pd-pieces-row').style.display = 'flex'; }

        // Size selector
        if (p.sizes && p.sizes.trim()) {
            const sizeSection = document.getElementById('size-section');
            const sizeContainer = document.getElementById('size-options');
            sizeSection.style.display = 'block';
            p.sizes.split(',').map(s => s.trim()).filter(Boolean).forEach(size => {
                const btn = document.createElement('button');
                btn.className = 'size-pill';
                btn.textContent = size;
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.size-pill').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedSize = size;
                    document.getElementById('size-error').textContent = '';
                });
                sizeContainer.appendChild(btn);
            });
        }

        // Add to cart button
        const addBtn = document.getElementById('pd-add-cart');
        addBtn.disabled = Number(p.quantity) <= 0;
        if (Number(p.quantity) <= 0) addBtn.textContent = 'Out of Stock';
        addBtn.onclick = () => addToCart(p.id, p.sizes);

        // Load async data
        checkWishlistState(p.id);
        loadReviews(p.id);
        loadRelated(p);

    } catch (e) {
        document.getElementById('pd-name').textContent = 'Failed to load product.';
        console.error(e);
    }
}

async function addToCart(productId, sizesField) {
    const t = token();
    if (!t) {
        const page = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/static/customer-pages/login.html?next=${page}`;
        return;
    }

    if (sizesField && sizesField.trim() && !selectedSize) {
        document.getElementById('size-error').textContent = 'Please select a size before adding to cart.';
        document.getElementById('size-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    try {
        const body = { product_id: parseInt(productId), quantity: 1 };
        if (selectedSize) body.size = selectedSize;

        const r = await fetch(`${BASE}/cart/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + t },
            body: JSON.stringify(body)
        });

        if (r.ok) {
            showCartPopup();
            if (window.KairosNav) KairosNav.loadCartBadge();
        } else {
            const err = await r.json();
            alert(err.detail || 'Could not add to cart.');
        }
    } catch (e) { console.error('Add to cart error:', e); }
}

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

document.addEventListener('DOMContentLoaded', loadProduct);
