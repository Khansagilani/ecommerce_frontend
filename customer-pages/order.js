const BASE = 'http://localhost:8000';
const token = () => localStorage.getItem('token');
const expandedOrders = new Set();

function statusClass(status) {
    const map = {
        pending: 'status-pending',
        paid: 'status-paid',
        shipped: 'status-shipped',
        delivered: 'status-delivered',
        cancelled: 'status-cancelled',
    };
    return map[status] || 'status-pending';
}

function formatDate(iso) {
    try {
        return new Date(iso).toLocaleDateString('en-PK', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    } catch { return iso; }
}

async function toggleOrderDetail(orderId) {
    const detailEl = document.getElementById(`order-detail-${orderId}`);
    if (!detailEl) return;

    if (expandedOrders.has(orderId)) {
        detailEl.style.display = 'none';
        expandedOrders.delete(orderId);
        const btn = document.getElementById(`toggle-btn-${orderId}`);
        if (btn) btn.textContent = 'View Details ▾';
        return;
    }

    expandedOrders.add(orderId);
    const btn = document.getElementById(`toggle-btn-${orderId}`);
    if (btn) btn.textContent = 'Hide Details ▴';

    detailEl.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:12px 0">Loading items…</p>';
    detailEl.style.display = 'block';

    try {
        const r = await fetch(`${BASE}/orders/${orderId}`, {
            headers: { 'Authorization': 'Bearer ' + token() }
        });
        if (!r.ok) {
            detailEl.innerHTML = '<p style="color:var(--rose);font-size:13px;padding:12px 0">Could not load order details.</p>';
            return;
        }
        const detail = await r.json();
        const items = detail.items || [];

        detailEl.innerHTML = `
            <div class="order-items-table">
                <div class="oi-header">
                    <span>Item</span>
                    <span>Size</span>
                    <span>Qty</span>
                    <span>Price</span>
                </div>
                ${items.map(item => `
                <div class="oi-row">
                    <div class="oi-product">
                        <img src="${item.product_img || '/static/public/img2.jpg'}" alt="${item.product_name}" class="oi-img">
                        <span class="oi-name">${item.product_name}</span>
                    </div>
                    <span class="oi-size">${item.size || '—'}</span>
                    <span class="oi-qty">×${item.quantity}</span>
                    <span class="oi-price">PKR ${Number(item.subtotal).toLocaleString()}</span>
                </div>`).join('')}
            </div>`;
    } catch (e) {
        detailEl.innerHTML = '<p style="color:var(--rose);font-size:13px;padding:12px 0">Error loading items.</p>';
    }
}

async function loadOrders() {
    const t = token();
    const container = document.getElementById('orders-container');
    const loading = document.getElementById('orders-loading');

    if (!t) {
        if (loading) loading.remove();
        container.innerHTML = `
            <div class="orders-empty">
                <h3>Not Logged In</h3>
                <p>Please login to view your order history.</p>
                <a href="/static/customer-pages/login.html?next=/static/customer-pages/order.html" class="btn-fill" style="display:inline-block;text-decoration:none">Login</a>
            </div>`;
        return;
    }

    try {
        const r = await fetch(BASE + '/orders/', {
            headers: { 'Authorization': 'Bearer ' + t }
        });

        if (loading) loading.remove();

        if (!r.ok) {
            const err = await r.json();
            container.innerHTML = `<p class="orders-state">${err.detail || 'Could not load orders.'}</p>`;
            return;
        }

        const orders = await r.json();

        if (!orders.length) {
            container.innerHTML = `
                <div class="orders-empty">
                    <h3>No orders yet</h3>
                    <p>You haven't placed any orders. Start shopping!</p>
                    <a href="/static/customer-pages/index.html" class="btn-fill" style="display:inline-block;text-decoration:none">Shop Now</a>
                </div>`;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-card-header">
                    <div class="order-num">Order <span>#${order.id}</span></div>
                    <div class="order-date">${formatDate(order.created_at)}</div>
                    <span class="order-status ${statusClass(order.status)}">${order.status}</span>
                </div>
                <div class="order-card-body">
                    <div class="order-total-row">
                        <span class="order-total-label">Order Total</span>
                        <span class="order-total-val">PKR ${Number(order.total_amount).toLocaleString()}</span>
                    </div>
                    ${order.shipping_addr ? `
                    <div class="order-addr">
                        <span class="order-addr-label">Shipping Address</span>
                        ${order.shipping_addr}
                    </div>` : ''}
                    <button id="toggle-btn-${order.id}" class="order-detail-toggle" onclick="toggleOrderDetail(${order.id})">View Details ▾</button>
                    <div id="order-detail-${order.id}" class="order-items-detail" style="display:none"></div>
                </div>
            </div>
        `).join('');

    } catch (e) {
        if (loading) loading.remove();
        container.innerHTML = `<p class="orders-state">Error loading orders. Please try again.</p>`;
        console.error(e);
    }
}

document.addEventListener('DOMContentLoaded', loadOrders);
