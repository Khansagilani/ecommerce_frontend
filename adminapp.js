function showSection(id) {
    // Hide all sections
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    // Show the one clicked
    document.getElementById(id).style.display = 'block';
}
async function fetchData() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:8000/api/admin/products/getallproducts",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }

        const data = await response.json();

        console.log("hi Admin!!!", data);

        const container = document.getElementById("productsList");

        if (!container) {
            console.error("productsList container not found in HTML");
            return;
        }

        container.innerHTML = "";

        data.forEach(function (product) {
            const card = document.createElement("div");
            card.className = "product-card";

            card.innerHTML = `
                <h3>${product.product_name}</h3>
                <p><b>Price:</b> ${product.price}</p>
                <p>${product.product_Description}</p>
                <img src="${product.img}" width="120" />
                <button>Add to Cart</button>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    showSection('allproducts');

    // wait a tiny bit to ensure DOM is visible
    setTimeout(() => {
        fetchData();
    }, 50);
});


document.getElementById("addProductForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const product = {
        product_name: document.getElementById("prod-name").value,
        product_Description: document.getElementById("prod-description").value,
        price: document.getElementById("prod-price").value,
        quantity: document.getElementById("prod-stock").value,
    };

    const imgValue = document.getElementById("prod-image").value;
    if (imgValue) {
        product.img = imgValue;
    }

    const response = await fetch("http://localhost:8000/api/admin/products/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
    });

    const data = await response.json();
    console.log(data);

    alert("Product Added!");
    fetchData();
});

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}