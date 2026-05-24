const BASE = 'http://localhost:8000';

function switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const msg = document.getElementById('login-msg');
    msg.textContent = '';
    msg.className = 'auth-msg';

    const body = new URLSearchParams();
    body.append('username', email);
    body.append('password', password);

    try {
        const res = await fetch(BASE + '/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body
        });
        const data = await res.json();

        if (!res.ok) {
            msg.textContent = data.detail || 'Invalid email or password.';
            return;
        }

        const token = data.access_token || data.token;
        if (!token) { msg.textContent = 'Login failed. Please try again.'; return; }

        localStorage.setItem('token', token);

        const redirect = new URLSearchParams(window.location.search).get('next');
        window.location.href = redirect || '/static/customer-pages/index.html';
    } catch (err) {
        msg.textContent = 'Server error. Please try again later.';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const msg = document.getElementById('register-msg');
    msg.textContent = '';
    msg.className = 'auth-msg';

    if (password.length < 6) {
        msg.textContent = 'Password must be at least 6 characters.';
        return;
    }

    try {
        const res = await fetch(BASE + '/users/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone: phone || null, address: null })
        });
        const data = await res.json();

        if (!res.ok) {
            msg.textContent = data.detail || 'Registration failed. Please try again.';
            return;
        }

        msg.className = 'auth-msg success';
        msg.textContent = 'Account created! Logging you in…';

        const loginBody = new URLSearchParams();
        loginBody.append('username', email);
        loginBody.append('password', password);

        const loginRes = await fetch(BASE + '/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: loginBody
        });
        const loginData = await loginRes.json();

        if (loginRes.ok && (loginData.access_token || loginData.token)) {
            localStorage.setItem('token', loginData.access_token || loginData.token);
            window.location.href = '/static/customer-pages/index.html';
        } else {
            msg.textContent = 'Registered! Please login.';
            setTimeout(() => switchTab('login'), 1500);
        }
    } catch (err) {
        msg.textContent = 'Server error. Please try again later.';
    }
}

/* redirect already-logged-in users */
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('token')) {
        window.location.href = '/static/customer-pages/account.html';
    }
});