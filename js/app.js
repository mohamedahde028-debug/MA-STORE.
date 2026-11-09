/* ==========================
MA STORE - MAIN APP
========================== */

const CART_KEY = "ma_cart";

// قراءة السلة بأمان
function getCartData() {
try {
const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
return Array.isArray(cart) ? cart : [];
} catch (error) {
console.error("Cart Error:", error);
return [];
}
}

// حفظ السلة
function saveCartData(cart) {
localStorage.setItem(CART_KEY, JSON.stringify(cart));
updateCartCount();
}

// إضافة منتج للسلة
async function addToCart(productId) {
try {
const response = await fetch("/api/products");

    if (!response.ok) {
        throw new Error("تعذر تحميل المنتجات.");
    }

    const products = await response.json();

    const product = products.find(
        item => String(item.id) === String(productId)
    );

    if (!product) {
        alert("هذا المنتج غير متاح حالياً.");
        return;
    }

    const stock = Number(product.stock);

    if (!Number.isFinite(stock) || stock <= 0) {
        alert("هذا المنتج غير متوفر في المخزون حالياً.");
        return;
    }

    const cart = getCartData();

    const existingProduct = cart.find(
        item => String(item.id) === String(productId)
    );

    if (existingProduct) {
        if (Number(existingProduct.quantity) >= stock) {
            alert("لا توجد كمية إضافية متاحة من هذا المنتج.");
            return;
        }

        existingProduct.quantity =
            Number(existingProduct.quantity) + 1;

    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }

    saveCartData(cart);

    alert("تمت إضافة المنتج إلى السلة بنجاح.");

} catch (error) {
    console.error("Add To Cart Error:", error);
    alert(error.message || "حدث خطأ أثناء إضافة المنتج.");
}

}

// تحديث عداد السلة
function updateCartCount() {
const cart = getCartData();

const count = cart.reduce((total, item) => {
    const quantity = Number(item.quantity);

    return total + (
        Number.isInteger(quantity) && quantity > 0
            ? quantity
            : 0
    );
}, 0);

const counter = document.getElementById("cart-count");

if (counter) {
    counter.textContent = count;
}

}

// تفريغ السلة
function clearCart() {
localStorage.removeItem(CART_KEY);
updateCartCount();
}

// حفظ إعدادات المتجر
function saveStoreSetting(key, value) {
localStorage.setItem(
"ma_store_" + key,
JSON.stringify(value)
);
}

// قراءة إعدادات المتجر
function getStoreSetting(key, defaultValue = null) {
const value = localStorage.getItem("ma_store_" + key);

if (!value) return defaultValue;

try {
    return JSON.parse(value);
} catch {
    return defaultValue;
}

}

// تشغيل النظام
document.addEventListener("DOMContentLoaded", function() {
updateCartCount();
});

// تحديث العداد عند تغيير السلة من تبويب آخر
window.addEventListener("storage", updateCartCount);