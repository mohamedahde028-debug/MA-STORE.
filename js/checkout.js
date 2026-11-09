const WHATSAPP_NUMBER = "201206094511";
const CHECKOUT_CART_KEY = "ma_cart";

async function submitOrder(event) {
event.preventDefault();

const form = event.target;
const button = form.querySelector('[type="submit"]');
const originalText = button.textContent;

const name = form.querySelector('[name="name"]').value.trim();
const phone = form.querySelector('[name="phone"]').value.trim();
const governorate = form.querySelector('[name="governorate"]').value;
const address = form.querySelector('[name="address"]').value.trim();

if (!name || !phone || !governorate || !address) {
    alert("من فضلك أكمل جميع البيانات.");
    return;
}

if (!/^01[0-9]{9}$/.test(phone)) {
    alert("من فضلك أدخل رقم هاتف مصري صحيح.");
    return;
}

let cart;

try {
    cart = JSON.parse(localStorage.getItem(CHECKOUT_CART_KEY) || "[]");
} catch {
    alert("حدث خطأ في قراءة سلة المشتريات.");
    return;
}

if (!Array.isArray(cart) || cart.length === 0) {
    alert("سلة المشتريات فارغة.");
    return;
}

if (button.disabled) return;

button.disabled = true;
button.textContent = "جاري تسجيل الطلب...";

try {
    const productsResponse = await fetch("/api/products");

    if (!productsResponse.ok) {
        throw new Error("خدمة المنتجات غير متاحة حاليًا.");
    }

    const products = await productsResponse.json();

    if (!Array.isArray(products)) {
        throw new Error("بيانات المنتجات غير صحيحة.");
    }

    const orderItems = cart.map(item => {
        const product = products.find(
            p => String(p.id) === String(item.id)
        );

        if (!product) {
            throw new Error("أحد المنتجات الموجودة في السلة غير متاح.");
        }

        const quantity = Number(item.quantity);
        const price = Number(product.price);

        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new Error("كمية أحد المنتجات غير صحيحة.");
        }

        if (!Number.isFinite(price) || price < 0) {
            throw new Error("سعر أحد المنتجات غير صحيح.");
        }

        return {
            id: product.id,
            quantity,
            product,
            price
        };
    });

    const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            customer: {
                name,
                phone,
                governorate,
                address
            },
            items: orderItems.map(item => ({
                id: item.id,
                quantity: item.quantity
            })),
            paymentMethod: "cash_on_delivery"
        })
    });

    let result;

    try {
        result = await response.json();
    } catch {
        throw new Error("استجابة الخادم غير مفهومة.");
    }

    if (!response.ok) {
        throw new Error(result.message || "تعذر تسجيل الطلب.");
    }

    let total = 0;

    const productDetails = orderItems.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        return [
            "• " + item.product.name,
            "الكمية: " + item.quantity,
            "السعر: " + itemTotal.toLocaleString("ar-EG") + " جنيه"
        ].join("\n");
    });

    const message = [
        "طلب جديد من MA STORE",
        "رقم الطلب: " + (result.orderId || result.id || "غير محدد"),
        "----------------------",
        "اسم العميل: " + name,
        "رقم الهاتف: " + phone,
        "المحافظة: " + governorate,
        "العنوان: " + address,
        "----------------------",
        "تفاصيل المنتجات:",
        ...productDetails,
        "----------------------",
        "الإجمالي: " + total.toLocaleString("ar-EG") + " جنيه",
        "طريقة الدفع: الدفع عند الاستلام",
        "شكرًا لاختيارك MA STORE"
    ].join("\n");

    localStorage.removeItem(CHECKOUT_CART_KEY);

    alert("تم تسجيل طلبك بنجاح!");

    window.location.href =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(message);

} catch (error) {
    alert(error.message || "حدث خطأ أثناء تسجيل الطلب.");
    button.disabled = false;
    button.textContent = originalText;
}

}