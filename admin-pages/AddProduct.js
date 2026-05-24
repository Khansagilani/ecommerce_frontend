// Image preview
document.getElementById('prod-image').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const preview = document.getElementById('preview');
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
});

document.getElementById('addProductForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const msg = document.getElementById('form-msg');
    const btn = document.getElementById('submit-btn');
    msg.className = 'form-msg';
    msg.textContent = '';

    const fileInput = document.getElementById('prod-image');
    const file = fileInput.files[0];
    if (!file) {
        msg.className = 'form-msg error';
        msg.textContent = 'Please select a product image.';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Adding…';

    const formData = new FormData();
    formData.append('product_name', document.getElementById('prod-name').value.trim());
    formData.append('category',     document.getElementById('prod-category').value);
    formData.append('style',        document.getElementById('prod-style').value);
    formData.append('fabric_type',  document.getElementById('prod-fabric').value);
    formData.append('pieces',       document.getElementById('prod-pieces').value);
    formData.append('product_Description', document.getElementById('prod-description').value.trim());
    formData.append('price',    document.getElementById('prod-price').value);
    formData.append('quantity', document.getElementById('prod-stock').value);
    formData.append('sizes',    document.getElementById('prod-sizes').value.trim());
    formData.append('img', file);

    try {
        const token = AdminNav.getToken();
        const response = await fetch('http://localhost:8000/api/admin/products/', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            msg.className = 'form-msg success';
            msg.textContent = `"${data.product_name}" added successfully!`;
            e.target.reset();
            document.getElementById('preview').style.display = 'none';
        } else {
            msg.className = 'form-msg error';
            msg.textContent = data.detail || 'Failed to add product. Please try again.';
        }
    } catch (error) {
        msg.className = 'form-msg error';
        msg.textContent = 'Server error. Is the backend running?';
        console.error(error);
    }

    btn.disabled = false;
    btn.textContent = 'Add Product';
});
