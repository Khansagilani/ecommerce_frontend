const BASE = 'http://localhost:8000';

function getToken() {
    return localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
}

let allProducts = [];

// ── Date in topbar ─────────────────────────────────────────────────────────────
function setTopbarDate() {
    const dateEl = document.getElementById('topbar-date');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-PK', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    }
}

// ── Render products table ──────────────────────────────────────────────────────
function renderTable(products) {
    const container = document.getElementById('products-container');
    if (!container) return;
    if (!products || !products.length) {
        container.innerHTML = '<p class="table-empty">No products found.</p>';
        return;
    }
    container.innerHTML = `
    <table>
        <thead>
            <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Fabric</th>
                <th>Price (PKR)</th>
                <th>Stock</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${products.map(p => `
            <tr id="row-${p.id}">
                <td>
                    ${p.img
                        ? `<img src="${p.img}" class="prod-thumb" alt="${p.product_name}" onerror="this.style.display='none'">`
                        : `<div class="prod-no-img">No Img</div>`}
                </td>
                <td>
                    <strong>${p.product_name}</strong>
                    ${p.sizes ? `<div style="font-size:10px;color:var(--muted);margin-top:2px">${p.sizes}</div>` : ''}
                </td>
                <td>${p.category ? `<span class="tag rose">${p.category}</span>` : '—'}</td>
                <td>${p.fabric_type ? `<span class="tag gold">${p.fabric_type}</span>` : '—'}</td>
                <td><strong>PKR ${Number(p.price).toLocaleString()}</strong></td>
                <td class="${Number(p.quantity) === 0 ? 'stock-zero' : Number(p.quantity) <= 5 ? 'stock-low' : 'stock-ok'}">
                    ${p.quantity}
                </td>
                <td>
                    <a href="/static/admin-pages/updateproduct.html?id=${p.id}" class="btn-edit">Edit</a>
                    <button class="btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
                </td>
            </tr>`).join('')}
        </tbody>
    </table>`;
}

// ── Search / filter ────────────────────────────────────────────────────────────
function filterTable() {
    const input = document.getElementById('prod-search');
    if (!input) return;
    const q = input.value.toLowerCase().trim();
    if (!q) { renderTable(allProducts); return; }
    renderTable(allProducts.filter(p =>
        p.product_name.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.fabric_type || '').toLowerCase().includes(q)
    ));
}

// ── Load products ──────────────────────────────────────────────────────────────
async function loadProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    container.innerHTML = '<p class="table-empty">Loading products…</p>';
    try {
        const r = await fetch(`${BASE}/api/admin/products/getallproducts?skip=0&limit=500`, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (r.status === 401 || r.status === 403) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('token');
            window.location.href = '/static/admin-pages/login.html';
            return;
        }
        if (!r.ok) {
            container.innerHTML = `<p class="table-empty">Error ${r.status} loading products.</p>`;
            return;
        }
        allProducts = await r.json();
        renderTable(allProducts);
        updateStatCard('stat-products', allProducts.length);
        updateStatCard('stat-low', allProducts.filter(p => Number(p.quantity) <= 5).length);
    } catch (e) {
        container.innerHTML = '<p class="table-empty">Cannot reach server — is the backend running on port 8000?</p>';
        console.error('loadProducts:', e);
    }
}

// ── Stats helpers ──────────────────────────────────────────────────────────────
function updateStatCard(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

async function loadOrderStats() {
    try {
        const r = await fetch(`${BASE}/api/admin/orders/?limit=1000`, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (!r.ok) return;
        const orders = await r.json();
        updateStatCard('stat-orders', orders.length);
        const pending = orders.filter(o => o.status === 'pending').length;
        const sub = document.getElementById('stat-pending-sub');
        if (sub) sub.textContent = `${pending} pending`;
    } catch (e) {}
}

async function loadUserStats() {
    try {
        const r = await fetch(`${BASE}/api/admin/users/`, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (!r.ok) return;
        const users = await r.json();
        updateStatCard('stat-users', users.length);
    } catch (e) {}
}

// ── Delete product ─────────────────────────────────────────────────────────────
async function deleteProduct(id) {
    if (!confirm('Permanently delete this product? This cannot be undone.')) return;
    try {
        const r = await fetch(`${BASE}/api/admin/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (r.ok) {
            allProducts = allProducts.filter(p => p.id !== id);
            renderTable(allProducts);
            updateStatCard('stat-products', allProducts.length);
            updateStatCard('stat-low', allProducts.filter(p => Number(p.quantity) <= 5).length);
        } else {
            alert('Delete failed — please try again.');
        }
    } catch (e) { console.error('deleteProduct:', e); }
}

// ── Boot — called directly, no DOMContentLoaded needed (scripts at end of body)
setTopbarDate();
loadProducts();
loadOrderStats();
loadUserStats();
