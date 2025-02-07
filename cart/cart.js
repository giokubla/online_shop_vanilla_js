import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { getToken, isAuthenticated } from '../auth/auth';
import { getUser } from '../src/main.js';

export async function getCart() {
  return await fetch('https://api.everrest.educata.dev/shop/cart', {
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
    .then((res) => res.json())
    .then((cartInfo) => {
      localStorage.setItem('cart', JSON.stringify(cartInfo));
      return cartInfo;
    });
}
window.onQuantityChange = function (buttonElement, id) {
  console.log(buttonElement, id);
  const quantity = buttonElement.value;
  if (quantity) {
    fetch('https://api.everrest.educata.dev/shop/cart/product', {
      method: 'PATCH',
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
      .then((res) => res.json())
      .then(() => {
        getCart().then((cartData) => render(cartData));
      });
  }
};
window.render = function (cartData) {
  const tbody = document.querySelector('tbody');
  const record = document.getElementById('record');
  tbody.innerHTML = '';
  cartData.products.forEach((product) => {
    fetch(
      `https://api.everrest.educata.dev/shop/products/id/${product.productId}`
    )
      .then((res) => res.json())
      .then(({ title }) => {
        tbody.innerHTML += row({ ...product, title });
      });
  });
  record.innerHTML = `
    <li class="list-group-item">total items: ${cartData.total.quantity}</li>
    <li class="list-group-item">total products: ${cartData.total.products}</li>
    <li class="list-group-item text-danger">price before discount: ${cartData.total.price.beforeDiscount}</li>
    <li class="list-group-item text-success fw-bold">price after discount: ${cartData.total.price.current}</li>
    `;
};
window.onDelete = function (id) {
  fetch('https://api.everrest.educata.dev/shop/cart/product', {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ id }),
  })
    .then((res) => res.json())
    .then(() => {
      getCart().then((cartData) => render(cartData));
    });
};
window.row = function row(product) {
  return `
    <tr>
            <td>${product.title}</td>
            <td>${product.pricePerQuantity} $</td>
            <td>${product.beforeDiscountPrice} $</td>
            <td>
            <input class="form-control w-25" min="1" type="number" oninput="onQuantityChange(this, '${product.productId}')" value="${product.quantity}"/>
            </td>
            <td>
                <button class="btn btn-outline-danger" onclick="onDelete('${product.productId}')">delete</button>
            </td>
    </tr>
    `;
};
document.addEventListener('DOMContentLoaded', () => {
  getUser();
  updateAuthButtons();
  getCart().then((cartData) => render(cartData));
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

document.addEventListener('userUpdated', (event) => {
  const user = event.detail;
  updateUserInfo(user);
  updateAuthButtons();
});
