function login(){
let u=document.getElementById('user').value;
let p=document.getElementById('pass').value;
if(u==='admin' && p==='1234'){
document.getElementById('loginBox').style.display='none';
document.getElementById('adminBox').style.display='block';
showProducts();
}else{alert('بيانات غلط! جرب admin / 1234');}
}
function showProducts(){
let products=JSON.parse(localStorage.getItem('products')||'[]');
let el=document.getElementById('list'); if(!el) return;
el.innerHTML=products.map(pr=>`<div>${pr.name} - ${pr.price} ج <button onclick="del(${pr.id})">حذف</button></div>`).join('');
}
function addProduct(){
let name=document.getElementById('pname').value;
let price=document.getElementById('pprice').value;
let img=document.getElementById('pimg').value || 'https://via.placeholder.com/400';
let products=JSON.parse(localStorage.getItem('products')||'[]');
products.push({id:Date.now(),name,price,img});
localStorage.setItem('products',JSON.stringify(products));
showProducts(); alert('تمت الإضافة ✅');
}
function del(id){
let products=JSON.parse(localStorage.getItem('products')||'[]').filter(x=>x.id!==id);
localStorage.setItem('products',JSON.stringify(products));
showProducts();
}