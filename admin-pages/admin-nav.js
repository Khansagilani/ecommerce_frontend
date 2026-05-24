(function () {
    'use strict';

    const SIDEBAR_HTML = `
    <aside class="admin-sidebar">
        <div class="admin-brand">
            <span class="brand-logo">Kairos</span>
            <span class="brand-tag">Admin Panel</span>
        </div>
        <nav class="admin-nav">
            <span class="nav-section-label">Overview</span>
            <a href="/static/admin-pages/index.html" class="admin-nav-item" data-key="dashboard">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                Dashboard
            </a>
            <span class="nav-section-label">Catalogue</span>
            <a href="/static/admin-pages/AddProduct.html" class="admin-nav-item" data-key="add">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                Add Product
            </a>
            <span class="nav-section-label">Operations</span>
            <a href="/static/admin-pages/orders.html" class="admin-nav-item" data-key="orders">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
                Orders
            </a>
            <a href="/static/admin-pages/users.html" class="admin-nav-item" data-key="users">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                Customers
            </a>
            <a href="/static/admin-pages/promo.html" class="admin-nav-item" data-key="promo">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                Promo Codes
            </a>
        </nav>
        <div class="admin-sidebar-footer">
            <a href="/" target="_blank" class="view-store-link">&#8592; View Store</a>
            <button id="admin-logout-btn" class="admin-logout-btn">Logout</button>
        </div>
    </aside>`;

    function init() {
        // Inject sidebar
        const placeholder = document.getElementById('admin-nav-placeholder');
        if (placeholder) placeholder.outerHTML = SIDEBAR_HTML;

        // Auth guard — skip on login page
        if (!window.location.pathname.includes('login')) {
            const t = localStorage.getItem('admin_token') || localStorage.getItem('token');
            if (!t) {
                window.location.href = '/static/admin-pages/login.html';
                return;
            }
        }

        // Highlight active nav item
        const path = window.location.pathname;
        document.querySelectorAll('.admin-nav-item').forEach(link => {
            const key = link.dataset.key;
            const active =
                (key === 'dashboard' && (path.endsWith('index.html') || path === '/' || path.endsWith('/'))) ||
                (key === 'add'       && path.includes('AddProduct')) ||
                (key === 'orders'    && path.includes('orders')) ||
                (key === 'users'     && path.includes('users')) ||
                (key === 'promo'     && path.includes('promo'));
            if (active) link.classList.add('active');
        });

        // Logout
        const logoutBtn = document.getElementById('admin-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                const t = localStorage.getItem('admin_token') || localStorage.getItem('token');
                if (t) {
                    try {
                        await fetch('http://localhost:8000/api/admin/auth/logout', {
                            method: 'POST',
                            headers: { Authorization: 'Bearer ' + t }
                        });
                    } catch (e) {}
                }
                localStorage.removeItem('admin_token');
                localStorage.removeItem('token');
                window.location.href = '/static/admin-pages/login.html';
            });
        }
    }

    // Scripts are at end of body — DOM is ready, call init directly
    init();

    window.AdminNav = {
        getToken: () => localStorage.getItem('admin_token') || localStorage.getItem('token') || ''
    };
})();
