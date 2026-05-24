const BASE = 'http://localhost:8000';
const token = () => AdminNav.getToken();

let allOrders = [];

function formatDate(iso) {
    try {
        return new Date(iso).toLocaleDateString('en-PK', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    } catch { return iso; }
}

function statusBadge(status) {
    return `<span class="status-badge status-${status}">${status}</span>`;
}

function renderOrders(orders) {
    const container = document.getElementById('orders-container');
    const countEl = document.getElementById('orders-count');
    if (countEl) countEl.textContent = `${orders.length} order${orders.length !== 1 ? 's' : ''}`;

    if (!orders.length) {
        container.innerHTML = '<p class="table-empty">No orders in this category.</p>';
        return;
    }

    container.innerHTML = `
    <table>
        <thead>
            <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Shipping Address</th>
                <th>Total (PKR)</th>
                <th>Status</th>
                <th>Update</th>
            </tr>
        </thead>
        <tbody>
            ${orders.map(o => `
            <tr id="order-row-${o.id}">
                <td><strong>#${o.id}</strong></td>
                <td>${formatDate(o.created_at)}</td>
                <td>
                    <strong>${o.customer_name || '—'}</strong>
                    ${o.customer_email ? `<br><span style="font-size:11px;color:var(--muted)">${o.customer_email}</span>` : ''}
                </td>
                <td style="font-size:12px">${o.customer_phone || '—'}</td>
                <td style="font-size:11px;max-width:200px;white-space:pre-wrap">${o.shipping_addr || '—'}</td>
                <td><strong>PKR ${Number(o.total_amount).toLocaleString()}</strong></td>
                <td>${statusBadge(o.status)}</td>
                <td>
                    <select class="status-select" data-order-id="${o.id}" onchange="updateStatus(this)">
                        <option value="">Change…</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </td>
            </tr>`).join('')}
        </tbody>
    </table>`;
}

async function updateStatus(selectEl) {
    const orderId = selectEl.dataset.orderId;
    const newStatus = selectEl.value;
    if (!newStatus) return;

    selectEl.disabled = true;
    try {
        const r = await fetch(`${BASE}/api/admin/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token()}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (r.ok) {
            const order = allOrders.find(o => o.id === parseInt(orderId));
            if (order) order.status = newStatus;
            const row = document.getElementById(`order-row-${orderId}`);
            if (row) {
                const badgeCell = row.querySelector('td:nth-child(7)');
                if (badgeCell) badgeCell.innerHTML = statusBadge(newStatus);
            }
        } else {
            alert('Failed to update status.');
        }
    } catch (e) {
        alert('Server error.');
        console.error(e);
    }

    selectEl.value = '';
    selectEl.disabled = false;
}

function filterOrders(status, btn) {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const filtered = status === 'all' ? allOrders : allOrders.filter(o => o.status === status);
    renderOrders(filtered);
}

async function loadOrders() {
    try {
        const r = await fetch(`${BASE}/api/admin/orders/?limit=500`, {
            headers: { Authorization: `Bearer ${token()}` }
        });

        if (!r.ok) {
            if (r.status === 401) { window.location.href = '/static/admin-pages/login.html'; return; }
            document.getElementById('orders-container').innerHTML = '<p class="table-empty">Failed to load orders.</p>';
            return;
        }

        allOrders = await r.json();
        renderOrders(allOrders);
    } catch (e) {
        document.getElementById('orders-container').innerHTML = '<p class="table-empty">Server error. Is the backend running?</p>';
        console.error(e);
    }
}

document.addEventListener('DOMContentLoaded', loadOrders);
