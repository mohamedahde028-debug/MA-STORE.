/* ==========================
   MA STORE - PRODUCTS SYSTEM
========================== */

const API_URL = "/api";

async function getProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
            throw new Error("تعذر تحميل المنتجات");
        }

        const products = await response.json();
        return Array.isArray(products) ? products : [];

    } catch (error) {
        console.error("Products Error:", error);
        return [];
    }
}

function formatPrice(price) {
    const value = Number(price);

    if (!Number.isFinite(value)) {
        return "السعر غير متاح";
    }

    return value.toLocaleString("ar-EG") + " جنيه";
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function displayProducts(products) {
    const container = document.getElementById("products-container");

    if (!container) return;

    if (!products.length) {
        container.innerHTML = `
            <div class="loading">
                لا توجد منتجات متاحة حالياً.
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => {
        const id = escapeHTML(product.id);
        const name = escapeHTML(product.name);
        const image = escapeHTML(
            product.image || "assets/images/product-placeholder.png"
        );

        return `
            <article class="product-card">
                <a href="product.html?id=${encodeURIComponent(product.id)}">
                    <img
                        class="product-image"
                        src="${image}"
                        alt="${name}"
                        loading="lazy"
                        onerror="this.onerror=null;this.src='assets/images/product-placeholder.png'"
                    >
                </a>

                <div class="product-info">
                    <h3>${name}</h3>

                    <div class="product-price">
                        ${formatPrice(product.price)}
                    </div>

                    <button
                        class="add-to-cart"
                        type="button"
                        data-product-id="${id}"
                    >
                        أضف إلى السلة
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

document.addEventListener("click", function(event) {
    const button = event.target.closest(".add-to-cart");

    if (!button) return;

    const productId = button.dataset.productId;

    if (!productId) return;

    if (typeof addToCart !== "function") {
        alert("نظام السلة غير جاهز حالياً.");
        return;
    }

    addToCart(productId);
});

async function loadProducts() {
    const container = document.getElementById("products-container");

    if (container) {
        container.innerHTML = `
            <div class="loading">
                جاري تحميل المنتجات...
            </div>
        `;
    }

    const products = await getProducts();
    displayProducts(products);
}

document.addEventListener("DOMContentLoaded", loadProducts);