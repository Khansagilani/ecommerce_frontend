const BASE = 'http://localhost:8000';
const token = () => localStorage.getItem('token');
let cartData = null;
let appliedPromo = null;

/* ── Load Cart ── */
async function loadCart() {
    const t = token();
    const cartItemsEl = document.getElementById('cart-items');
    const placeOrderBtn = document.getElementById('place-order');

    if (!t) {
        cartItemsEl.innerHTML = `<p class="cart-empty">Please <a href="/static/customer-pages/login.html" style="color:var(--rose)">login</a> to view your cart.</p>`;
        placeOrderBtn.disabled = true;
        return;
    }

    try {
        const r = await fetch(BASE + '/cart/', {
            headers: { 'Authorization': 'Bearer ' + t }
        });
        const data = await r.json();

        if (!r.ok) {
            if (r.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/static/customer-pages/login.html?next=/static/customer-pages/checkout.html';
                return;
            }
            cartItemsEl.innerHTML = `<p class="cart-empty">${data.detail || 'Unable to load cart.'}</p>`;
            placeOrderBtn.disabled = true;
            return;
        }

        cartData = data;
        const items = data.items || [];
        const subtotal = Number(data.total || 0);

        document.getElementById('cart-total').textContent = subtotal.toLocaleString();
        updateDiscountDisplay(subtotal);

        if (!items.length) {
            cartItemsEl.innerHTML = `<p class="cart-empty">Your cart is empty. <a href="/static/customer-pages/index.html" style="color:var(--rose)">Shop now</a></p>`;
            placeOrderBtn.disabled = true;
            return;
        }

        placeOrderBtn.disabled = false;

        cartItemsEl.innerHTML = items.map(item => {
            const stockWarn = item.in_stock === false
                ? `<span class="stock-warn">Out of stock</span>`
                : (item.low_stock ? `<span class="stock-warn low">Low stock</span>` : '');
            return `
            <div class="cart-line" id="cart-line-${item.cart_item_id}">
                <img class="cart-line-img"
                     src="${item.product_img || '/static/public/img2.jpg'}"
                     alt="${item.product_name || ''}">
                <div class="cart-line-info">
                    <strong>${item.product_name || 'Unknown Product'}</strong>
                    ${item.size ? `<span class="line-size">Size: ${item.size}</span>` : ''}
                    ${stockWarn}
                    <div class="qty-control">
                        <button class="qty-btn" onclick="changeQty(${item.cart_item_id}, ${item.quantity - 1})">−</button>
                        <span class="qty-num">${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQty(${item.cart_item_id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <div class="cart-line-right">
                    <b>PKR ${Number(item.subtotal || 0).toLocaleString()}</b>
                    <button class="remove-btn" onclick="removeItem(${item.cart_item_id})" title="Remove">&times;</button>
                </div>
            </div>`;
        }).join('');

    } catch (e) {
        cartItemsEl.innerHTML = `<p class="cart-empty">Error loading cart. Please try again.</p>`;
        document.getElementById('place-order').disabled = true;
        console.error(e);
    }
}

function updateDiscountDisplay(subtotal) {
    const discountRow = document.getElementById('discount-row');
    if (!appliedPromo || !discountRow) return;
    const pct = appliedPromo.discount_percent;
    const discountAmt = Math.round(subtotal * pct / 100);
    document.getElementById('discount-pct').textContent = pct;
    document.getElementById('discount-amt').textContent = discountAmt.toLocaleString();
    discountRow.style.display = 'flex';
}

/* ── Promo Code ── */
async function applyPromo() {
    const code = (document.getElementById('promo-input').value || '').trim().toUpperCase();
    const msgEl = document.getElementById('promo-msg');
    msgEl.textContent = '';
    msgEl.className = 'promo-msg';

    if (!code) { msgEl.textContent = 'Please enter a promo code.'; return; }

    try {
        const r = await fetch(`${BASE}/promo/validate?code=${encodeURIComponent(code)}`);
        const data = await r.json();
        if (r.ok) {
            appliedPromo = data;
            msgEl.className = 'promo-msg success';
            msgEl.textContent = `Code applied! ${data.discount_percent}% off your order.`;
            const subtotal = cartData ? Number(cartData.total || 0) : 0;
            updateDiscountDisplay(subtotal);
        } else {
            appliedPromo = null;
            document.getElementById('discount-row').style.display = 'none';
            msgEl.textContent = data.detail || 'Invalid promo code.';
        }
    } catch (e) {
        msgEl.textContent = 'Could not validate promo code.';
    }
}

/* ── Change Quantity ── */
async function changeQty(cartItemId, newQty) {
    if (newQty < 1) { removeItem(cartItemId); return; }
    const t = token();
    if (!t) return;
    try {
        const r = await fetch(`${BASE}/cart/items/${cartItemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + t },
            body: JSON.stringify({ quantity: newQty })
        });
        if (r.ok) {
            loadCart();
            if (window.KairosNav) KairosNav.loadCartBadge();
        } else {
            const err = await r.json();
            alert(err.detail || 'Could not update quantity.');
        }
    } catch (e) { console.error(e); }
}

/* ── Remove Item ── */
async function removeItem(cartItemId) {
    const t = token();
    if (!t) return;
    try {
        const r = await fetch(`${BASE}/cart/items/${cartItemId}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + t }
        });
        if (r.ok) {
            loadCart();
            if (window.KairosNav) KairosNav.loadCartBadge();
        }
    } catch (e) { console.error(e); }
}

/* ── Place Order ── */
async function placeOrder() {
    const t = token();
    const address = document.getElementById('customer-address').value.trim();
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('phone-no').value.trim();
    const msg = document.getElementById('order-message');

    msg.textContent = '';
    msg.className = 'order-msg';

    if (!t) { window.location.href = '/static/customer-pages/login.html'; return; }
    if (!name || !phone || !address) {
        msg.textContent = 'Please fill in all shipping fields.';
        return;
    }

    const btn = document.getElementById('place-order');
    btn.disabled = true;
    btn.textContent = 'Placing Order…';

    const payload = { shipping_addr: `${name} | ${phone} | ${address}` };
    if (appliedPromo) payload.promo_code = appliedPromo.code;

    try {
        const r = await fetch(BASE + '/orders/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + t },
            body: JSON.stringify(payload)
        });
        const data = await r.json();

        if (r.ok) {
            msg.className = 'order-msg success';
            msg.textContent = `Order #${data.id} placed! We'll contact you to confirm.`;
            document.getElementById('cart-total').textContent = '0';
            document.getElementById('cart-items').innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
            btn.textContent = 'Order Placed';
            if (window.KairosNav) KairosNav.loadCartBadge();
            setTimeout(() => { window.location.href = '/static/customer-pages/order.html'; }, 2500);
        } else {
            msg.textContent = data.detail || 'Order failed. Please try again.';
            btn.disabled = false;
            btn.textContent = 'Place Order (COD)';
        }
    } catch (e) {
        msg.textContent = 'Server error. Please try again later.';
        btn.disabled = false;
        btn.textContent = 'Place Order (COD)';
        console.error(e);
    }
}

document.addEventListener('DOMContentLoaded', loadCart);
