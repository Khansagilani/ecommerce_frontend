(function () {
    'use strict';

    const BASE = 'http://localhost:8000';

    const NAV_HTML = `
    <div id="announce-bar">
        <p>Free delivery on orders over PKR 5,000 &nbsp;&bull;&nbsp; COD Available nationwide &nbsp;&bull;&nbsp; Easy 7-day returns</p>
    </div>
    <nav id="top-nav">
        <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
        </button>
        <div class="nav-links">
            <a href="/static/customer-pages/index.html">Women</a>
            <a href="#">Men</a>
            <a href="#">Fragrance</a>
        </div>
        <a class="logo" href="/static/customer-pages/index.html">Kairos</a>
        <div class="nav-actions">
            <button class="nav-icon-btn" id="nav-search-toggle" aria-label="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
            <a href="/static/customer-pages/login.html" id="nav-login-link" class="nav-text-btn">Login</a>
            <a href="/static/customer-pages/account.html" id="nav-account-link" class="nav-text-btn" style="display:none">My Account</a>
            <button id="nav-logout-btn" class="nav-text-btn" style="display:none">Logout</button>
            <div class="cart-wrapper" onclick="window.location.href='/static/customer-pages/checkout.html'" role="button" aria-label="Shopping cart">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                <span id="cart-badge">0</span>
            </div>
        </div>
    </nav>
    <nav id="cat-nav">
        <div class="cat-item">
            <a href="#" class="cat-link">RTW <svg viewBox="0 0 10 6"><polyline points="1,1 5,5 9,1"/></svg></a>
            <div class="dropdown">
                <div class="dd-col">
                    <h4>By Style</h4>
                    <a href="#" onclick="KairosNav.navFilter('rtw',null,'casual',null);return false">Casual</a>
                    <a href="#" onclick="KairosNav.navFilter('rtw',null,'formal',null);return false">Formal</a>
                </div>
                <div class="dd-col">
                    <h4>By Fabric</h4>
                    <a href="#" onclick="KairosNav.navFilter('rtw','printed',null,null);return false">Printed</a>
                    <a href="#" onclick="KairosNav.navFilter('rtw','embroidered',null,null);return false">Embroidered</a>
                </div>
                <div class="dd-col">
                    <h4>Browse</h4>
                    <a href="#" onclick="KairosNav.navFilter('rtw',null,null,null);return false">All RTW</a>
                </div>
            </div>
        </div>
        <div class="cat-item">
            <a href="#" class="cat-link">Unstitched <svg viewBox="0 0 10 6"><polyline points="1,1 5,5 9,1"/></svg></a>
            <div class="dropdown">
                <div class="dd-col">
                    <h4>By Style</h4>
                    <a href="#" onclick="KairosNav.navFilter('unstitched',null,'casual',null);return false">Casual</a>
                    <a href="#" onclick="KairosNav.navFilter('unstitched',null,'formal',null);return false">Formal</a>
                </div>
                <div class="dd-col">
                    <h4>By Pieces</h4>
                    <a href="#" onclick="KairosNav.navFilter('unstitched',null,null,'2piece');return false">2 Piece</a>
                    <a href="#" onclick="KairosNav.navFilter('unstitched',null,null,'3piece');return false">3 Piece</a>
                </div>
                <div class="dd-col">
                    <h4>By Fabric</h4>
                    <a href="#" onclick="KairosNav.navFilter('unstitched','printed',null,null);return false">Printed</a>
                    <a href="#" onclick="KairosNav.navFilter('unstitched','embroidered',null,null);return false">Embroidered</a>
                </div>
            </div>
        </div>
        <div class="cat-item"><a href="#" class="cat-link" onclick="KairosNav.navFilter(null,null,null,null);return false">New Arrivals</a></div>
        <div class="cat-item"><a href="#" class="cat-link">Sale</a></div>
        <div class="cat-item"><a href="/static/customer-pages/aboutus.html" class="cat-link">About</a></div>
    </nav>
    <div id="search-bar" class="hidden">
        <div class="search-inner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9a8080" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" id="search-input" placeholder="Search products, styles, fabrics…" autocomplete="off">
            <button id="search-close" aria-label="Close">&times;</button>
        </div>
        <div id="search-results"></div>
    </div>

    <!-- MOBILE MENU DRAWER -->
    <div id="mobile-overlay" style="display:none;position:fixed;inset:0;background:rgba(28,20,20,.55);z-index:9000;backdrop-filter:blur(2px)" onclick="closeMobileMenu()"></div>
    <div id="mobile-drawer" style="display:none;position:fixed;top:0;left:0;height:100%;width:290px;max-width:85vw;background:var(--cream);z-index:9001;overflow-y:auto;transform:translateX(-100%);transition:transform .28s cubic-bezier(.4,0,.2,1);box-shadow:4px 0 24px rgba(28,20,20,.15)">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 20px 16px;border-bottom:1px solid var(--border);background:var(--dark)">
            <span style="font-family:'Playfair Display',serif;font-style:italic;font-size:22px;color:var(--rose)">Kairos</span>
            <button onclick="closeMobileMenu()" style="background:none;border:none;color:rgba(255,255,255,.7);font-size:24px;cursor:pointer;line-height:1">&times;</button>
        </div>
        <div style="padding:8px 0">
            <p style="padding:14px 20px 6px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-muted);font-weight:600">Ready to Wear</p>
            <a href="#" onclick="KairosNav.navFilter('rtw',null,'casual',null);closeMobileMenu();return false" style="display:block;padding:12px 20px;color:var(--text);text-decoration:none;font-size:14px;border-bottom:1px solid #f0e8e4">Casual RTW</a>
            <a href="#" onclick="KairosNav.navFilter('rtw',null,'formal',null);closeMobileMenu();return false" style="display:block;padding:12px 20px;color:var(--text);text-decoration:none;font-size:14px;border-bottom:1px solid #f0e8e4">Formal RTW</a>
            <a href="#" onclick="KairosNav.navFilter('rtw','printed',null,null);closeMobileMenu();return false" style="display:block;padding:12px 20px;color:var(--text);text-decoration:none;font-size:14px;border-bottom:1px solid #f0e8e4">Printed RTW</a>
            <a href="#" onclick="KairosNav.navFilter('rtw','embroidered',null,null);closeMobileMenu();return false" style="display:block;padding:12px 20px;color:var(--text);text-decoration:none;font-size:14px;border-bottom:1px solid #f0e8e4">Embroidered RTW</a>
            <a href="#" onclick="KairosNav.navFilter('rtw',null,null,null);closeMobileMenu();return false" style="display:block;padding:12px 20px;color:var(--rose);text-decoration:none;font-size:14px;border-bottom:1px solid #f0e8e4;font-weight:500">All RTW →</a>

            <p style="padding:14px 20px 6px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-muted);font-weight:600">Unstitched</p>
            <a href="#" onclick="KairosNav.navFilter('unstitched',null,null,'2piece');closeMobileMenu();return false" style="display:block;padding:12px 20px;color:var(--text);text-decoration:none;font-size:14px;border-bottom:1px solid #f0e8e4">2 Piece</a>
            <a href="#" onclick="KairosNav.navFilter('unstitched',null,null,'3piece');closeMobileMenu();return false" style="display:block;padding:12px 20px;color:var(--text);text-decoration:none;font-size:14px;border-bottom:1px solid #f0e8e4">3 Piece</a>
            <a href="#" onclick="KairosNav.navFilter('unstitched','printed',null,null);closeMobileMenu();return false" style="display:block;padding:12px 20px;color:var(--text);text-decoration:none;font-size:14px;border-bottom:1px solid #f0e8e4">Printed Unstitched</a>
            <a href="#" onclick="KairosNav.navFilter('unstitched','embroidered',null,null);closeMobileMenu();return false" style="display:block;padding:12px 20px;color:var(--text);text-decoration:none;font-size:14px;border-bottom:1px solid #f0e8e4">Embroidered Unstitched</a>
            <a href="#" onclick="KairosNav.navFilter('unstitched',null,null,null);closeMobileMenu();return false" style="display:block;padding:12px 20px;color:var(--rose);text-decoration:none;font-size:14px;border-bottom:1px solid #f0e8e4;font-weight:500">All Unstitched →</a>

            <p style="padding:14px 20px 6px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-muted);font-weight:600">More</p>
            <a href="#" onclick="KairosNav.navFilter(null,null,null,null);closeMobileMenu();return false" style="display:block;padding:12px 20px;color:var(--text);text-decoration:none;font-size:14px;border-bottom:1px solid #f0e8e4">New Arrivals</a>
            <a href="/static/customer-pages/aboutus.html" style="display:block;padding:12px 20px;color:var(--text);text-decoration:none;font-size:14px;border-bottom:1px solid #f0e8e4">About Kairos</a>

            <p style="padding:14px 20px 6px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-muted);font-weight:600">Account</p>
            <a href="/static/customer-pages/account.html" id="mob-account-link" style="display:block;padding:12px 20px;color:var(--text);text-decoration:none;font-size:14px;border-bottom:1px solid #f0e8e4">My Account</a>
            <a href="/static/customer-pages/order.html" style="display:block;padding:12px 20px;color:var(--text);text-decoration:none;font-size:14px;border-bottom:1px solid #f0e8e4">My Orders</a>
            <a href="/static/customer-pages/login.html" id="mob-login-link" style="display:block;padding:12px 20px;color:var(--text);text-decoration:none;font-size:14px;border-bottom:1px solid #f0e8e4">Login / Register</a>
        </div>
    </div>
    `;

    const FOOTER_HTML = `
    <footer>
        <div class="footer-grid">
            <div class="footer-brand">
                <h3>Kairos</h3>
                <p>Rooted in tradition, crafted for the modern woman. Premium Pakistani fashion delivered to your door.</p>
            </div>
            <div class="footer-col">
                <h4>Shop</h4>
                <a href="#" onclick="KairosNav.navFilter('rtw',null,null,null);return false">Ready to Wear</a>
                <a href="#" onclick="KairosNav.navFilter('unstitched',null,null,null);return false">Unstitched</a>
                <a href="#" onclick="KairosNav.navFilter(null,'embroidered',null,null);return false">Embroidered</a>
                <a href="#" onclick="KairosNav.navFilter(null,'printed',null,null);return false">Printed</a>
            </div>
            <div class="footer-col">
                <h4>Help</h4>
                <a href="/static/customer-pages/aboutus.html">About Us</a>
                <a href="#">Contact Us</a>
                <a href="#">Size Guide</a>
                <a href="#">Returns Policy</a>
                <a href="/static/customer-pages/order.html">Track My Order</a>
            </div>
            <div class="footer-col">
                <h4>Connect</h4>
                <a href="https://www.instagram.com" target="_blank" rel="noopener">Instagram</a>
                <a href="#" target="_blank" rel="noopener">Facebook</a>
                <a href="#">WhatsApp</a>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 Kairos. All rights reserved.</p>
            <div class="social-links">
                <a href="https://www.instagram.com" target="_blank" rel="noopener">Instagram</a>
                <a href="#">Facebook</a>
                <a href="#">WhatsApp</a>
            </div>
        </div>
    </footer>
    `;

    function isHomepage() {
        const p = window.location.pathname;
        return p === '/' || p.endsWith('index.html');
    }

    function navFilter(category, fabric_type, style, pieces) {
        if (isHomepage() && typeof filterProducts === 'function') {
            filterProducts(category, fabric_type, style, pieces);
            const eidSection = document.getElementById('eid');
            if (eidSection) eidSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            const params = new URLSearchParams();
            if (category) params.set('category', category);
            if (fabric_type) params.set('fabric_type', fabric_type);
            if (style) params.set('style', style);
            if (pieces) params.set('pieces', pieces);
            window.location.href = '/static/customer-pages/index.html?' + params.toString();
        }
    }

    function setupAuthState() {
        const token = localStorage.getItem('token');
        const loginLink = document.getElementById('nav-login-link');
        const accountLink = document.getElementById('nav-account-link');
        const logoutBtn = document.getElementById('nav-logout-btn');
        const mobLogin = document.getElementById('mob-login-link');
        const mobAccount = document.getElementById('mob-account-link');

        if (token) {
            if (loginLink) loginLink.style.display = 'none';
            if (accountLink) accountLink.style.display = 'inline';
            if (logoutBtn) logoutBtn.style.display = 'inline';
            if (mobLogin) mobLogin.style.display = 'none';
        } else {
            if (mobAccount) mobAccount.style.display = 'none';
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => _logout());
        }
    }

    function clearStaleToken() {
        localStorage.removeItem('token');
        const loginLink = document.getElementById('nav-login-link');
        const accountLink = document.getElementById('nav-account-link');
        const logoutBtn = document.getElementById('nav-logout-btn');
        if (loginLink) loginLink.style.display = 'inline';
        if (accountLink) accountLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        const badge = document.getElementById('cart-badge');
        if (badge) badge.textContent = '0';
    }

    async function loadCartBadge() {
        const t = localStorage.getItem('token');
        if (!t) return;
        try {
            const r = await fetch(BASE + '/cart/count', {
                headers: { 'Authorization': 'Bearer ' + t }
            });
            if (r.ok) {
                const d = await r.json();
                const badge = document.getElementById('cart-badge');
                if (badge) badge.textContent = d.count;
            } else if (r.status === 401) {
                clearStaleToken();
            }
        } catch (e) {}
    }

    function setupSearch() {
        const toggleBtn = document.getElementById('nav-search-toggle');
        const searchBar = document.getElementById('search-bar');
        const closeBtn = document.getElementById('search-close');
        const input = document.getElementById('search-input');
        const resultsDiv = document.getElementById('search-results');
        if (!toggleBtn || !searchBar) return;

        toggleBtn.addEventListener('click', () => {
            searchBar.classList.toggle('hidden');
            if (!searchBar.classList.contains('hidden')) {
                setTimeout(() => input && input.focus(), 50);
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                searchBar.classList.add('hidden');
                if (input) input.value = '';
                if (resultsDiv) resultsDiv.innerHTML = '';
            });
        }

        let debounce;
        if (input) {
            input.addEventListener('input', () => {
                clearTimeout(debounce);
                const q = input.value.trim();
                if (q.length < 2) { if (resultsDiv) resultsDiv.innerHTML = ''; return; }
                debounce = setTimeout(() => doSearch(q), 320);
            });
        }
    }

    async function doSearch(q) {
        const resultsDiv = document.getElementById('search-results');
        if (!resultsDiv) return;
        try {
            const r = await fetch(`${BASE}/products/search?q=${encodeURIComponent(q)}&limit=6`);
            if (!r.ok) return;
            const data = await r.json();
            if (!data.length) {
                resultsDiv.innerHTML = '<p class="search-empty">No products found.</p>';
                return;
            }
            resultsDiv.innerHTML = data.map(p => `
                <a href="/static/customer-pages/product.html?id=${p.id}" class="search-result-item">
                    <img src="${p.img || '/static/public/img2.jpg'}" alt="${p.product_name}" loading="lazy">
                    <div class="search-result-info">
                        <strong>${p.product_name}</strong>
                        <span>PKR ${Number(p.price).toLocaleString()}</span>
                    </div>
                </a>
            `).join('');
        } catch (e) {}
    }

    function setupMobileMenu() {
        const hamburger = document.getElementById('nav-hamburger');
        if (!hamburger) return;
        hamburger.addEventListener('click', () => openMobileMenu());
    }

    function init() {
        const navHolder = document.getElementById('nav-placeholder');
        if (navHolder) navHolder.innerHTML = NAV_HTML;

        const footerHolder = document.getElementById('footer-placeholder');
        if (footerHolder) footerHolder.innerHTML = FOOTER_HTML;

        setupAuthState();
        loadCartBadge();
        setupSearch();
        setupMobileMenu();
    }

    async function _logout() {
        const t = localStorage.getItem('token');
        if (t) {
            try {
                await fetch(BASE + '/api/auth/logout', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + t }
                });
            } catch (e) {}
        }
        clearStaleToken();
        window.location.href = '/static/customer-pages/index.html';
    }

    window.KairosNav = { init, navFilter, loadCartBadge, _logout };

    // Global mobile menu functions (called from inline onclick in drawer HTML)
    window.openMobileMenu = function () {
        const overlay = document.getElementById('mobile-overlay');
        const drawer = document.getElementById('mobile-drawer');
        if (!overlay || !drawer) return;
        overlay.style.display = 'block';
        drawer.style.display = 'block';
        requestAnimationFrame(() => {
            drawer.style.transform = 'translateX(0)';
        });
        document.body.style.overflow = 'hidden';
    };

    window.closeMobileMenu = function () {
        const overlay = document.getElementById('mobile-overlay');
        const drawer = document.getElementById('mobile-drawer');
        if (!overlay || !drawer) return;
        drawer.style.transform = 'translateX(-100%)';
        setTimeout(() => {
            overlay.style.display = 'none';
            drawer.style.display = 'none';
        }, 280);
        document.body.style.overflow = '';
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
