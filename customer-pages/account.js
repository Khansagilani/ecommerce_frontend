const BASE = 'http://localhost:8000';
const token = () => localStorage.getItem('token');
let currentProfile = null;
let editMode = false;

function showSection(id, linkEl) {
    document.querySelectorAll('.account-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.account-nav-link').forEach(l => l.classList.remove('active'));
    const sec = document.getElementById('section-' + id);
    if (sec) sec.style.display = '';
    if (linkEl) linkEl.classList.add('active');
}

function doLogout() {
    if (window.KairosNav) {
        KairosNav._logout();
    } else {
        localStorage.removeItem('token');
        window.location.href = '/static/customer-pages/login.html';
    }
}

function toggleEditMode() {
    editMode = !editMode;
    const viewEl = document.getElementById('profile-info');
    const editEl = document.getElementById('edit-profile-form');
    const btn = document.getElementById('edit-toggle-btn');

    if (editMode) {
        viewEl.style.display = 'none';
        editEl.style.display = 'block';
        btn.textContent = 'Cancel Edit';
        if (currentProfile) {
            document.getElementById('edit-name').value = currentProfile.name || '';
            document.getElementById('edit-phone').value = currentProfile.phone || '';
            document.getElementById('edit-address').value = currentProfile.address || '';
        }
    } else {
        viewEl.style.display = '';
        editEl.style.display = 'none';
        btn.textContent = 'Edit Profile';
        document.getElementById('edit-msg').textContent = '';
    }
}

async function saveProfile() {
    const t = token();
    if (!t) return;
    const msgEl = document.getElementById('edit-msg');
    msgEl.textContent = '';
    msgEl.style.color = 'var(--rose)';

    const payload = {
        name: document.getElementById('edit-name').value.trim() || null,
        phone: document.getElementById('edit-phone').value.trim() || null,
        address: document.getElementById('edit-address').value.trim() || null,
    };

    try {
        const r = await fetch(BASE + '/users/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + t },
            body: JSON.stringify(payload)
        });
        const data = await r.json();
        if (r.ok) {
            currentProfile = { ...currentProfile, ...data };
            populateProfile(data);
            msgEl.style.color = '#4a7c59';
            msgEl.textContent = 'Profile updated successfully!';
            setTimeout(() => {
                editMode = true;
                toggleEditMode();
            }, 1200);
        } else {
            msgEl.textContent = data.detail || 'Could not update profile.';
        }
    } catch (e) {
        msgEl.textContent = 'Error saving profile.';
        console.error(e);
    }
}

function populateProfile(p) {
    document.getElementById('prof-name').textContent    = p.name    || '—';
    document.getElementById('prof-email').textContent   = p.email   || '—';
    document.getElementById('prof-phone').textContent   = p.phone   || '—';
    document.getElementById('prof-address').textContent = p.address || '—';
    document.getElementById('prof-since').textContent   = p.created_at
        ? new Date(p.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—';

    const displayName = p.name || 'My Account';
    document.getElementById('sidebar-name').textContent  = displayName;
    document.getElementById('sidebar-email').textContent = p.email || '';

    const initials = displayName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
    document.getElementById('avatar-initials').textContent = initials || '?';
}

async function loadProfile() {
    const t = token();
    const loading = document.getElementById('profile-loading');
    const infoEl  = document.getElementById('profile-info');
    const errEl   = document.getElementById('profile-error');

    if (!t) {
        window.location.href = '/static/customer-pages/login.html?next=/static/customer-pages/account.html';
        return;
    }

    try {
        const r = await fetch(BASE + '/users/profile', {
            headers: { 'Authorization': 'Bearer ' + t }
        });

        if (!r.ok) {
            if (r.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/static/customer-pages/login.html?next=/static/customer-pages/account.html';
                return;
            }
            const err = await r.json();
            loading.style.display = 'none';
            errEl.textContent = err.detail || 'Could not load profile.';
            return;
        }

        const p = await r.json();
        currentProfile = p;

        loading.style.display = 'none';
        infoEl.style.display = '';

        populateProfile(p);

    } catch (e) {
        loading.style.display = 'none';
        errEl.textContent = 'Error loading profile. Please try again.';
        console.error(e);
    }
}

async function loadWishlist() {
    const t = token();
    const container = document.getElementById('wishlist-container');
    if (!container || !t) return;

    container.innerHTML = '<p class="profile-state">Loading wishlist…</p>';

    try {
        const r = await fetch(BASE + '/wishlist/', {
            headers: { 'Authorization': 'Bearer ' + t }
        });
        if (!r.ok) { container.innerHTML = '<p class="profile-state">Could not load wishlist.</p>'; return; }
        const items = await r.json();

        if (!items.length) {
            container.innerHTML = `
                <div style="text-align:center;padding:40px 20px">
                    <p style="color:var(--text-muted);margin-bottom:16px">Your wishlist is empty.</p>
                    <a href="/static/customer-pages/index.html" class="btn-fill" style="text-decoration:none;display:inline-block">Shop Now</a>
                </div>`;
            return;
        }

        container.innerHTML = `<div class="wishlist-grid">${items.map(item => `
            <div class="wishlist-card" id="wl-${item.product_id}">
                <a href="/static/customer-pages/product.html?id=${item.product_id}">
                    <img src="${item.img || '/static/public/img2.jpg'}" alt="${item.product_name}" class="wishlist-img">
                </a>
                <div class="wishlist-info">
                    <a href="/static/customer-pages/product.html?id=${item.product_id}" class="wishlist-name">${item.product_name}</a>
                    <p class="wishlist-price">PKR ${Number(item.price).toLocaleString()}</p>
                    <p class="wishlist-stock" style="color:${item.quantity > 0 ? '#4a7c59' : 'var(--rose)'}">
                        ${item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </p>
                    <button class="btn-outline wishlist-remove-btn" onclick="removeFromWishlist(${item.product_id})">Remove</button>
                </div>
            </div>`).join('')}</div>`;
    } catch (e) {
        container.innerHTML = '<p class="profile-state">Error loading wishlist.</p>';
    }
}

async function removeFromWishlist(productId) {
    const t = token();
    if (!t) return;
    try {
        const r = await fetch(`${BASE}/wishlist/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + t }
        });
        if (r.ok) {
            const card = document.getElementById(`wl-${productId}`);
            if (card) card.remove();
            const grid = document.querySelector('.wishlist-grid');
            if (grid && !grid.children.length) {
                document.getElementById('wishlist-container').innerHTML = `
                    <div style="text-align:center;padding:40px 20px">
                        <p style="color:var(--text-muted);margin-bottom:16px">Your wishlist is empty.</p>
                        <a href="/static/customer-pages/index.html" class="btn-fill" style="text-decoration:none;display:inline-block">Shop Now</a>
                    </div>`;
            }
        }
    } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', loadProfile);
