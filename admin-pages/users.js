const BASE = 'http://localhost:8000';

function getToken() {
    return localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
}

let allUsers = [];

// ── Topbar date ────────────────────────────────────────────────────────────────
const dateEl = document.getElementById('topbar-date');
if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-PK', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
}

// ── Render ─────────────────────────────────────────────────────────────────────
function renderUsers(users) {
    const container = document.getElementById('users-container');
    if (!container) return;

    const badge = document.getElementById('user-count-badge');
    if (badge) badge.textContent = `${users.length} shown`;

    if (!users || !users.length) {
        container.innerHTML = '<p class="table-empty">No customers found.</p>';
        return;
    }

    container.innerHTML = `
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Joined</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${users.map(u => `
            <tr id="user-row-${u.id}">
                <td style="color:var(--muted)">${u.id}</td>
                <td><strong>${u.name || '—'}</strong></td>
                <td style="font-size:11px">${u.email}</td>
                <td style="font-size:11px">${u.phone || '—'}</td>
                <td style="font-size:11px;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.address || '—'}</td>
                <td style="font-size:11px;color:var(--muted)">${new Date(u.created_at).toLocaleDateString('en-PK')}</td>
                <td>
                    <button class="btn-danger" onclick="deleteUser(${u.id}, '${u.name || u.email}')">Delete</button>
                </td>
            </tr>`).join('')}
        </tbody>
    </table>`;
}

// ── Filter ─────────────────────────────────────────────────────────────────────
function filterUsers() {
    const input = document.getElementById('user-search');
    if (!input) return;
    const q = input.value.toLowerCase().trim();
    if (!q) { renderUsers(allUsers); return; }
    renderUsers(allUsers.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    ));
}

// ── Load ───────────────────────────────────────────────────────────────────────
async function loadUsers() {
    const container = document.getElementById('users-container');
    if (!container) return;
    try {
        const r = await fetch(`${BASE}/api/admin/users/`, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (r.status === 401 || r.status === 403) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('token');
            window.location.href = '/static/admin-pages/login.html';
            return;
        }
        if (!r.ok) {
            container.innerHTML = `<p class="table-empty">Error ${r.status} loading customers.</p>`;
            return;
        }
        allUsers = await r.json();
        renderUsers(allUsers);
    } catch (e) {
        container.innerHTML = '<p class="table-empty">Cannot reach server — is the backend running on port 8000?</p>';
        console.error('loadUsers:', e);
    }
}

// ── Delete ─────────────────────────────────────────────────────────────────────
async function deleteUser(id, label) {
    if (!confirm(`Delete customer "${label}"? This cannot be undone.`)) return;
    try {
        const r = await fetch(`${BASE}/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (r.ok) {
            allUsers = allUsers.filter(u => u.id !== id);
            renderUsers(allUsers);
        } else {
            alert('Delete failed — please try again.');
        }
    } catch (e) { console.error('deleteUser:', e); }
}

// ── Boot ───────────────────────────────────────────────────────────────────────
loadUsers();
