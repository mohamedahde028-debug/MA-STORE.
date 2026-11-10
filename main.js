let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let products = JSON.parse(localStorage.getItem('products') || '[]');
if(products.length===0){
products=[
{id:1,name:'تيشيرت MA',price:350,img:'https://via.placeholder.com/400'},
{id:2,name:'هودي MA',price:650,img:'https://via.placeholder.com/400'},
{id:3,name:'كاب MA',price:200,img:'https://via.placeholder.com/400'},
{id:4,name:'بنطلون MA',price:550,img:'https://via.placeholder.com/400'}
];
localStorage.setItem('products',JSON.stringify(products));
}
function addToCart(id){
let p=products.find(x=>x.id===id);
cart.push(p); localStorage.setItem('cart',JSON.stringify(cart));
alert('تمت الإضافة ✅ '+p.name);
}
function renderProducts(){
let g=document.getElementById('grid'); if(!g) return;
g.innerHTML=products.map(p=>`
<div class="card"><img src="${p.img}"><h3>${p.name}</h3><p>${p.price} ج</p><button onclick="addToCart(${p.id})">أضف للسلة</button></div>`).join('');
}
document.addEventListener('DOMContentLoaded',renderProducts);