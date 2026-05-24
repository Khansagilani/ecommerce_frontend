// Redirect already-logged-in admins straight to dashboard
if (localStorage.getItem('admin_token') || localStorage.getItem('token')) {
    window.location.href = '/static/admin-pages/index.html';
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('loginMsg');
    msg.textContent = '';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        msg.textContent = 'Please enter your email and password.';
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Signing in…';

    try {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch('http://localhost:8000/api/admin/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            msg.textContent = data.detail === 'Forbidden'
                ? 'This account does not have admin access.'
                : 'Invalid email or password.';
            btn.disabled = false;
            btn.textContent = 'Sign In';
            return;
        }

        const token = data.access_token || data.token;
        if (!token) {
            msg.textContent = 'Login failed — no token received.';
            btn.disabled = false;
            btn.textContent = 'Sign In';
            return;
        }

        localStorage.setItem('admin_token', token);
        localStorage.setItem('token', token);
        window.location.href = '/static/admin-pages/index.html';

    } catch (error) {
        msg.textContent = 'Server error. Is the backend running?';
        btn.disabled = false;
        btn.textContent = 'Sign In';
        console.error(error);
    }
});
