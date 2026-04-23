async function fetchData() {
    const response = await fetch('http://localhost:8000/products');
    const data = await response.json();
    console.log('hi ecommerce app!!!')

    const container = document.getElementById('allproducts');

    data.forEach(function (product) {
        const card = document.createElement('div')
        card.className = 'product-card'
        card.innerHTML = `
        <h3>${product.product_name}</h3>
        <p>${product.price}</p>
        <p>${product.product_Description}</p>
        <img src="${product.img}">
        <button>Add to Cart</button>`
        container.appendChild(card)

    })
}
document.addEventListener("DOMContentLoaded", fetchData)