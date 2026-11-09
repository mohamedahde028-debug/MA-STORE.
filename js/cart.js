/* ==========================
MA STORE - SHOPPING CART
========================== */

const CART_PAGE_KEY = "ma_cart";

function getCart() {
try {
const cart = JSON.parse(
localStorage.getItem(CART_PAGE_KEY) || "[]"
);

    return Array.isArray(cart) ? cart : [];
} catch (error) {
    console.error("Cart Error:", error);
    return [];
}

}

function saveCart(cart) {
localStorage.setItem(CART_PAGE_KEY, JSON.stringify(cart));
updateCartCount();
}

function escapeHTML(value) {
return String(value ?? "").replace(/[&<>"']/g, char => ({
"&": "&",
"<": "<",
">": ">",
'"': """,
"'": "'"
})[char]);
}

function updateCartCount() {
const countElement = document.getElementById("cart-count");

if (!countElement) return;

const count = getCart().reduce((sum, item) => {
    const quantity = Number(item.quantity);

    return sum + (
        Number.isInteger(quantity) && quantity > 0
            ? quantity
            : 0
    );
}, 0);

countElement.textContent = count;

}

function removeFromCart(productId) {
const cart = getCart().filter(
item => String(item.id) !== String(productId)
);

saveCart(cart);
renderCart();

}

async function changeQuantity(productId, amount) {
const cart = getCart();

const item = cart.find(
    product => String(product.id) === String(productId)
);

if (!item) return;

const newQuantity = Number(item.quantity) + amount;

if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
}

try {
    const response = await fetch("/api/products");

    if (!response.ok) {
        throw new Error("تعذر التحقق من المخزون");
    }

    const products = await response.json();

    const product = products.find(
        p => String(p.id) === String(productId)
    );

    if (!product) {
        alert("هذا المنتج لم يعد متاحًا.");
        removeFromCart(productId);
        return;
    }

    if (newQuantity > Number(product.stock)) {
        alert("الكمية المطلوبة أكبر من المخزون المتاح.");
        return;
    }

    item.quantity = newQuantity;

    saveCart(cart);
    renderCart();

} catch (error) {
    console.error(error);
    alert(error.message || "حدث خطأ. حاول مرة أخرى.");
}

}

async function renderCart() {
const container = document.getElementById("cart-items");
const totalElement = document.getElementById("cart-total");

if (!container || !totalElement) return;

const cart = getCart();

if (cart.length === 0) {
    container.innerHTML = `
        <p class="empty-message">
            سلة المشتريات فارغة.
        </p>
    `;

    totalElement.textContent = "0 جنيه";
    updateCartCount();
    return;
}

container.innerHTML = "<p>جاري تحميل المنتجات...</p>";

try {
    const response = await fetch("/api/products");

    if (!response.ok) {
        throw new Error("تعذر تحميل المنتجات");
    }

    const products = await response.json();

    let total = 0;
    let validItems = 0;

    const itemsHTML = cart.map(item => {
        const product = products.find(
            p => String(p.id) === String(item.id)
        );

        if (!product) return "";

        const quantity = Number(item.quantity);
        const price = Number(product.price);

        if (
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            return "";
        }

        validItems++;
        total += price * quantity;

        const id = escapeHTML(item.id);
        const name = escapeHTML(product.name);

        const imageHTML = `
            <img
                src="${escapeHTML(product.image || "assets/images/product-placeholder.png")}"
                alt="${name}"
                class="cart-product-image"
                style="width:85px;height:85px;object-fit:contain;"
            >
        `;

        return `
            <div class="cart-item">

                ${imageHTML}

                <h3>${name}</h3>

                <p>
                    ${price.toLocaleString("ar-EG")} جنيه
                </p>

                <div class="quantity-controls">

                    <button
                        type="button"
                        data-action="increase"
                        data-id="${id}">
                        +
                    </button>

                    <span>${quantity}</span>

                    <button
                        type="button"
                        data-action="decrease"
                        data-id="${id}">
                        -
                    </button>

                </div>

                <p>
                    الإجمالي:
                    ${(price * quantity).toLocaleString("ar-EG")}
                    جنيه
                </p>

                <button
                    type="button"
                    class="remove-button"
                    data-action="remove"
                    data-id="${id}">
                    حذف
                </button>

            </div>
        `;
    }).join("");

    container.innerHTML = validItems
        ? itemsHTML
        : "<p class='empty-message'>المنتجات الموجودة في السلة غير متاحة.</p>";

    totalElement.textContent =
        total.toLocaleString("ar-EG") + " جنيه";

    updateCartCount();

} catch (error) {
    console.error(error);

    container.innerHTML = `
        <p class="empty-message">
            تعذر تحميل السلة. حاول مرة أخرى لاحقًا.
        </p>
    `;
}

}

// التعامل مع أزرار السلة
document.addEventListener("click", function(event) {
const button = event.target.closest("[data-action]");

if (!button) return;

const action = button.dataset.action;
const productId = button.dataset.id;

if (!productId) return;

if (action === "increase") {
    changeQuantity(productId, 1);
} else if (action === "decrease") {
    changeQuantity(productId, -1);
} else if (action === "remove") {
    removeFromCart(productId);
}

});

document.addEventListener("DOMContentLoaded", function() {
updateCartCount();
renderCart();
});