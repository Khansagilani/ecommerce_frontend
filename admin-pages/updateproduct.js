const BASE = 'http://localhost:8000';
const id = new URLSearchParams(window.location.search).get('id');

function setSelect(id, value) {
    const el = document.getElementById(id);
    if (!el || !value) return;
    const opt = [...el.options].find(o => o.value === value);
    if (opt) el.value = value;
}

async function loadProduct() {
    if (!id) { window.location.href = '/static/admin-pages/index.html'; return; }
    try {
        const r = await fetch(`${BASE}/api/admin/products/${id}`, {
            headers: { Authorization: `Bearer ${AdminNav.getToken()}` }
        });
        if (!r.ok) { window.location.href = '/static/admin-pages/index.html'; return; }
        const p = await r.json();

        document.getElementById('prod-name').value        = p.product_name || '';
        document.getElementById('prod-price').value       = p.price || '';
        document.getElementById('prod-stock').value       = p.quantity ?? '';
        document.getElementById('prod-sizes').value       = p.sizes || '';
        document.getElementById('prod-description').value = p.product_Description || '';

        setSelect('prod-category', p.category);
        setSelect('prod-style',    p.style);
        setSelect('prod-fabric',   p.fabric_type);
        setSelect('prod-pieces',   p.pieces);

        const preview = document.getElementById('preview');
        if (p.img) { preview.src = p.img; preview.style.display = 'block'; }
        else preview.style.display = 'none';

    } catch (e) {
        console.error('Failed to load product', e);
    }
}

document.getElementById('updateform').addEventListener('submit', async function (e) {
    e.preventDefault();
    const msg = document.getElementById('form-msg');
    const btn = document.getElementById('submit-btn');
    msg.className = 'form-msg';
    msg.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Saving…';

    const payload = {
        product_name:        document.getElementById('prod-name').value.trim(),
        category:            document.getElementById('prod-category').value || null,
        style:               document.getElementById('prod-style').value    || null,
        fabric_type:         document.getElementById('prod-fabric').value   || null,
        pieces:              document.getElementById('prod-pieces').value   || null,
        product_Description: document.getElementById('prod-description').value.trim() || null,
        price:               Number(document.getElementById('prod-price').value),
        quantity:            Number(document.getElementById('prod-stock').value),
        sizes:               document.getElementById('prod-sizes').value.trim() || null,
    };

    try {
        const r = await fetch(`${BASE}/api/admin/products/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${AdminNav.getToken()}`
            },
            body: JSON.stringify(payload)
        });
        const data = await r.json();

        if (r.ok) {
            msg.className = 'form-msg success';
            msg.textContent = 'Product updated successfully!';
        } else {
            msg.className = 'form-msg error';
            msg.textContent = data.detail || 'Update failed. Please try again.';
        }
    } catch (err) {
        msg.className = 'form-msg error';
        msg.textContent = 'Server error. Is the backend running?';
        console.error(err);
    }

    btn.disabled = false;
    btn.textContent = 'Save Changes';
});

async function uploadImage() {
    const fileInput = document.getElementById('new-img');
    const msgEl = document.getElementById('img-msg');
    msgEl.textContent = '';

    if (!fileInput.files.length) {
        msgEl.style.color = 'var(--rose)';
        msgEl.textContent = 'Please select an image file first.';
        return;
    }
    if (!id) return;

    const formData = new FormData();
    formData.append('img', fileInput.files[0]);

    try {
        const r = await fetch(`${BASE}/api/admin/products/${id}/upload-image`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${AdminNav.getToken()}` },
            body: formData
        });
        const data = await r.json();
        if (r.ok) {
            msgEl.style.color = '#4a7c59';
            msgEl.textContent = 'Image updated!';
            const preview = document.getElementById('preview');
            if (preview) { preview.src = data.img; preview.style.display = 'block'; }
            fileInput.value = '';
        } else {
            msgEl.style.color = 'var(--rose)';
            msgEl.textContent = data.detail || 'Upload failed.';
        }
    } catch (e) {
        msgEl.style.color = 'var(--rose)';
        msgEl.textContent = 'Server error during upload.';
    }
}

document.addEventListener('DOMContentLoaded', loadProduct);
