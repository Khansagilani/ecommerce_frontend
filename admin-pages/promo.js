const BASE = 'http://localhost:8000';
const token = () => AdminNav.getToken();

function formatDate(iso) {
    try { return new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return iso; }
}

function renderPromos(promos) {
    const container = document.getElementById('promo-container');
    if (!promos.length) {
        container.innerHTML = '<p class="table-empty">No promo codes yet.</p>';
        return;
    }

    container.innerHTML = `
    <table>
        <thead>
            <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Uses Left</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${promos.map(p => `
            <tr id="promo-row-${p.id}">
                <td><strong>${p.code}</strong></td>
                <td>${p.discount_percent}%</td>
                <td>${p.uses_remaining !== null ? p.uses_remaining : '∞'}</td>
                <td>
                    <span class="status-badge ${p.active ? 'status-delivered' : 'status-cancelled'}">
                        ${p.active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>${formatDate(p.created_at)}</td>
                <td style="display:flex;gap:8px">
                    <button class="btn-outline" style="font-size:11px;padding:5px 12px" onclick="togglePromo(${p.id}, ${p.active})">
                        ${p.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn-outline" style="font-size:11px;padding:5px 12px;border-color:var(--rose);color:var(--rose)" onclick="deletePromo(${p.id})">Delete</button>
                </td>
            </tr>`).join('')}
        </tbody>
    </table>`;
}

async function createPromo() {
    const code = (document.getElementById('promo-code').value || '').trim().toUpperCase();
    const discount = parseInt(document.getElementById('promo-discount').value);
    const usesVal = document.getElementById('promo-uses').value.trim();
    const msgEl = document.getElementById('promo-create-msg');
    msgEl.textContent = '';

    if (!code || !discount || discount < 1 || discount > 100) {
        msgEl.style.color = 'var(--rose)';
        msgEl.textContent = 'Please enter a valid code and discount percentage (1–100).';
        return;
    }

    const payload = { code, discount_percent: discount, uses_remaining: usesVal ? parseInt(usesVal) : null };

    try {
        const r = await fetch(`${BASE}/api/admin/promo/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
            body: JSON.stringify(payload)
        });
        const data = await r.json();
        if (r.ok) {
            msgEl.style.color = '#4a7c59';
            msgEl.textContent = `Promo code "${code}" created!`;
            document.getElementById('promo-code').value = '';
            document.getElementById('promo-discount').value = '';
            document.getElementById('promo-uses').value = '';
            loadPromos();
        } else {
            msgEl.style.color = 'var(--rose)';
            msgEl.textContent = data.detail || 'Failed to create promo code.';
        }
    } catch (e) {
        msgEl.style.color = 'var(--rose)';
        msgEl.textContent = 'Server error.';
    }
}

async function togglePromo(id, currentlyActive) {
    try {
        const r = await fetch(`${BASE}/api/admin/promo/${id}/toggle`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token()}` }
        });
        if (r.ok) { loadPromos(); }
        else { alert('Could not toggle promo code.'); }
    } catch (e) { console.error(e); }
}

async function deletePromo(id) {
    if (!confirm('Delete this promo code? This cannot be undone.')) return;
    try {
        const r = await fetch(`${BASE}/api/admin/promo/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token()}` }
        });
        if (r.ok) {
            const row = document.getElementById(`promo-row-${id}`);
            if (row) row.remove();
        } else {
            alert('Could not delete promo code.');
        }
    } catch (e) { console.error(e); }
}

async function loadPromos() {
    try {
        const r = await fetch(`${BASE}/api/admin/promo/`, {
            headers: { Authorization: `Bearer ${token()}` }
        });
        if (!r.ok) {
            if (r.status === 401) { window.location.href = '/static/admin-pages/login.html'; return; }
            document.getElementById('promo-container').innerHTML = '<p class="table-empty">Failed to load promo codes.</p>';
            return;
        }
        const promos = await r.json();
        renderPromos(promos);
    } catch (e) {
        document.getElementById('promo-container').innerHTML = '<p class="table-empty">Server error.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadPromos);
