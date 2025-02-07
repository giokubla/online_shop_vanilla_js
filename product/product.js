import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { getToken, isAuthenticated, logOut } from '../auth/auth';
import { getCart } from '../cart/cart';
let cartIsExist = false;
function getProductInfo(id) {
  fetch(`https://api.everrest.educata.dev/shop/products/id/${id}`)
    .then((res) => res.json())
    .then((productInfo) => {
      const corouselnnerCont = document.querySelector('.carousel-inner');
      const productInfoCont = document.getElementById('product-info');
      const purchaseCont = document.getElementById('purchase');
      productInfo.images.forEach((imageUrl, i) => {
        corouselnnerCont.innerHTML += `
         <div class="carousel-item ${i == 0 ? 'active' : ''}">
            <img src="${imageUrl}" class="d-block w-100" alt="..." />
         </div>
        `;
      });
      productInfoCont.innerHTML = productInfoCard(productInfo);
      purchaseCont.innerHTML = purchaseCard(productInfo);
    });
}
function productInfoCard(product) {
  let ratings = ``;
  Array.from({ length: Math.round(product.rating) }, () => {
    ratings += `<i class="fa-regular fa-star" style="color: #FFD43B;"></i>`;
  });
  return `
      <div class="card-body">
      <h5 class="card-title">${product.title}</h5>
      <p class="card-text">${ratings} ${product.rating}</p>
      <p class="card-text text-${product.stock ? 'success' : 'danger'}">
        ${product.stock ? product.stock : '<i class="fa-solid fa-x"></i> not'}
        in stock
      </p>
      <p class="card-text">
        <ul class="list-group">
            <li class="list-group-item">Category: ${product.category.name}</li>
            <li class="list-group-item">Brand: ${product.brand}</li>
            <li class="list-group-item">issue Date: ${product.issueDate}</li>
        </ul>
        <br>
        <h5 class="text-center">Description</h5>
        <hr/>
        <p class="card-text">${product.description}</p>
    </div>
    `;
}
function purchaseCard(product) {
  return `
     <div class="card p-4">
        <div class="card-body">
            <h1>$ ${product.price.current}.00</h1>
            <br>
            <input type="number" id="quantity" class="form-control w-25" value="1" placeholder="Server" aria-label="Server">
            <br>
            <button type="button" class="form-control btn btn-secondary w-100" onclick="addToCart('${product._id}')">
                <i class="fa-solid fa-cart-shopping"></i> Add To Cart
            </button>
            <p class="text-danger d-none mt-2 fw-bold" id="cart_add_error"></p>
            <br/>
            <br/>
            <hr/>
            <br/>
            <br/>
            <p class="text-secondary"> <i class="fa-solid fa-car"></i> Worldwide shipping </p>
            <p class="text-secondary"> <i class="fa-solid fa-lock"></i> Secure payment </p>
            <p class="text-secondary"> ${product.warranty} years full warranty</p>
        </div>
     </div>
    `;
}
window.addToCart = function (id) {
  const quantity = document.getElementById('quantity').value;
  fetch(`https://api.everrest.educata.dev/shop/cart/product`, {
    method: cartIsExist ? 'PATCH' : 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      quantity,
      id,
    }),
  })
    .then((res) => {
      if (res.ok) return res.json();
      return res.json().then((error) => {
        throw error;
      });
    })
    .then((data) => {
      alert(`${!cartIsExist ? 'added' : 'changed'} succesfully`);
      getCart().then(() => {
        updateAuthButtons();
      });
    })
    .catch((err) => {
      const cartAddError = document.getElementById('cart_add_error');
      console.log(cartAddError);
      cartAddError.innerText = err.error;
      cartAddError.classList.add('d-unset');
      cartAddError.classList.remove('d-none');
    });
};
window.logIn = function () {
  window.location.href = '/auth/';
};
window.logOut = function () {
  logOut();
  updateAuthButtons();
};
function updateAuthButtons() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userAvatar = document.getElementById('user_avatar');
  const fullName = document.getElementById('userFullName');
  const cartBtn = document.getElementById('cartBtn');
  const cartQuantity = document.getElementById('cart_item_quantity');
  if (isAuthenticated()) {
    const user = JSON.parse(localStorage.getItem('user'));
    const cart = JSON.parse(localStorage.getItem('cart'));
    const avatarURL = user.avatar;
    const fullNameLabel = user.firstName + ' ' + user.lastName;
    cartQuantity.innerText = cart.total.quantity;
    cartIsExist = JSON.parse(localStorage.getItem('user')).cartID;
    fullName.innerText = fullNameLabel;
    userAvatar.setAttribute('src', avatarURL);
    cartBtn.classList.add('d-unset');
    userAvatar.classList.add('d-unset');
    fullName.classList.add('d-unset');
    loginBtn.classList.add('d-none');
    logoutBtn.classList.remove('d-none');
  } else {
    fullName.classList.add('d-none');
    cartBtn.classList.add('d-none');
    userAvatar.classList.add('d-none');
    loginBtn.classList.remove('d-none');
    logoutBtn.classList.add('d-none');
  }
}
window.goToCart = function () {
  location.href = '/cart/';
};
document.addEventListener('DOMContentLoaded', () => {
  const productID = localStorage.getItem('productID');
  if (productID) {
    getProductInfo(productID);
  }
  getCart();
  updateAuthButtons();
});
window.updateUserInfo = function (user) {
  const userInfo = document.getElementById('user_info');
  if (user) {
    userInfo.classList.add('d-unset');
    const avatar = userInfo.children[0];
    const userName = userInfo.children[1];
    avatar.setAttribute('src', user.avatar);
    userName.innerText = user.firstName;
  } else {
    userInfo.classList.add('d-none');
  }
};
window.updateAuthButtons = function () {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  if (isAuthenticated()) {
    loginBtn.classList.add('d-none');
    logoutBtn.classList.remove('d-none');
  } else {
    loginBtn.classList.remove('d-none');
    logoutBtn.classList.add('d-none');
  }
};
window.goToCart = function () {
  location.href = '/cart/';
};
window.cardButtonVisible = function (show) {
  const btn = document.getElementById('cartBtn');
  const cart_item_quantity = document.getElementById('cart_item_quantity');
  if (show) {
    getCart().then((cart) => {
      cart_item_quantity.innerText = cart.total.quantity;
    });
    btn.classList.add('d-unset');
  } else {
    btn.classList.add('d-none');
  }
};
document.addEventListener('userUpdated', (event) => {
  const user = event.detail;
  updateUserInfo(user);
  updateAuthButtons();
  cardButtonVisible(!!user);
});
