import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { getToken, isAuthenticated, logOut } from '../auth/auth';
import './style.css';
const page_size_container = document.getElementById('page_size');
window.logIn = function () {
  window.location.href = '/auth/';
};
window.logOut = function () {
  logOut();
  getUser();
};

function productCard(product) {
  let ratings = ``;
  Array.from({ length: Math.round(product.rating) }, () => {
    ratings += `<i class="fa-regular fa-star" style="color: #FFD43B;"></i>`;
  });

  return `<div class="card product " style="width: 18rem">
            <img  src="${product.thumbnail}" class="card-img-top object-fit-contain p-4" style="height: 200px"/>
            <div class="card-body d-flex flex-column justify-content-between">
              <h5 class="card-title">${product.title}</h5>
              <p class="card-text">
                ${product.description}
              </p>
              <p class="d-flex justify-content-end">${product.price.current} ${product.price.currency}</p>
              <div class="d-flex justify-content-end">
               ${ratings}
              </div>
              <br>
              <button class="btn btn-secondary" onclick="saveToLocalStorage('${product._id}')">See Info <i class="fa-regular fa-eye ms-3"></i></button>
            </div>
          </div>`;
}
window.saveToLocalStorage = function (id) {
  localStorage.setItem('productID', id);
  location.href = '/product/';
};
function getProductsAll(
  pageIndex = sessionStorage.getItem('page_index') || 1,
  pageSize = sessionStorage.getItem('page_size') || 5
) {
  fetch(
    `https://api.everrest.educata.dev/shop/products/all?page_index=${pageIndex}&page_size=${pageSize}`
  )
    .then((res) => res.json())
    .then(({ products, total, page, skip, limit }) => {
      sessionStorage.setItem('all', true);
      renderListAndPagination(products, total, page, skip, limit);
    });
}
function renderListAndPagination(products, total, page, skip, limit) {
  const content = document.getElementById('content');
  const pagination = document.getElementById('pagination');
  content.innerHTML = pagination.innerHTML = '';
  Array.from({ length: Math.ceil(total / limit) }, (_, index) => {
    pagination.innerHTML += pagItem(total, limit, page, ++index);
  });
  products.forEach((product) => {
    content.innerHTML += productCard(product);
  });
}

function getProductsByBrand(
  brandName = sessionStorage.getItem('brandName') || '',
  pageIndex = sessionStorage.getItem('page_index') || 1,
  pageSize = sessionStorage.getItem('page_size') || 5
) {
  fetch(
    `https://api.everrest.educata.dev/shop/products/brand/${brandName.toLowerCase()}?page_index=${pageIndex}&page_size=${pageSize}`
  )
    .then((res) => res.json())
    .then(({ products, total, page, skip, limit }) => {
      sessionStorage.setItem('all', false);
      renderListAndPagination(products, total, page, skip, limit);
    });
}
function pagItem(total, limit, page, index) {
  return `<li class="page-item" aria-current="page">
                <span class="page-link mouse-pointer ${
                  page == index ? 'active' : ''
                }" onclick="pageChange(${index}, ${limit})">${index}</span>
           </li>`;
}
window.pageChange = function (index, limit) {
  sessionStorage.setItem('page_index', index);
  sessionStorage.setItem('page_size', limit);
  if (JSON.parse(sessionStorage.getItem('all').toLowerCase())) {
    getProductsAll();
  } else {
    getProductsByBrand();
  }
};
function getCategories() {
  const ul = document.getElementById('category-buttons');
  fetch('https://api.everrest.educata.dev/shop/products/categories')
    .then((res) => res.json())
    .then((data) => {
      ul.innerHTML = '';
      data.forEach((category) => {
        ul.innerHTML += categoryButton(category);
      });
    });
}

function getBrands() {
  const ul = document.getElementById('brand-list');
  fetch('https://api.everrest.educata.dev/shop/products/brands')
    .then((res) => res.json())
    .then((data) => {
      ul.innerHTML = '';
      ul.innerHTML += ulBrandItem('ALL');
      data.forEach((brandName) => {
        ul.innerHTML += ulBrandItem(brandName.toUpperCase());
      });
    });
}
function categoryButton(category) {
  return `<button type="button" onclick="categoryClick(${category.id})" class="btn btn-outline-secondary">${category.name}</button>`;
}
export async function getUser() {
  try {
    const response = await fetch('https://api.everrest.educata.dev/auth', {
      headers: {
        authorization: `Bearer ${getToken()}`,
      },
    });

    // Check if the response is OK (status 200-299)
    if (!response.ok) {
      throw new Error(response);
    }

    const user = await response.json();

    // Store the user data in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    document.dispatchEvent(new CustomEvent('userUpdated', { detail: user }));
    return user; // Return user data
  } catch (error) {
    console.error('Error fetching user data:', error);
    document.dispatchEvent(new CustomEvent('userUpdated', { detail: null }));
    return null; // Return null if an error occurs
  }
}

window.categoryClick = function (categoryId) {
  fetch(`https://api.everrest.educata.dev/shop/products/category/${categoryId}`)
    .then((res) => res.json())
    .then(({ products, total, page, skip, limit }) => {
      sessionStorage.setItem('all', true);
      renderListAndPagination(products, total, page, skip, limit);
    });
};
function ulBrandItem(brandName) {
  const currentBrandName = sessionStorage.getItem('brandName') || null;
  return `<li onclick="brandItemClick('${brandName}')" class="list-group-item ${
    currentBrandName === brandName ? 'active' : ''
  }">${brandName}</li>`;
}
window.brandItemClick = function (brandName) {
  sessionStorage.setItem('brandName', brandName);
  if (brandName.toLowerCase() === 'all') {
    sessionStorage.setItem('all', true);
    getProductsAll();
  } else {
    sessionStorage.removeItem('page_index');
    getProductsByBrand();
  }
  getBrands();
};
window.pageSizeChange = function (size) {
  page_size_container.textContent = size;
  sessionStorage.setItem('page_size', size);
  sessionStorage.setItem('page_index', 1);
  if (JSON.parse(sessionStorage.getItem('all').toLowerCase())) {
    getProductsAll();
  } else {
    getProductsByBrand();
  }
};
document.addEventListener('DOMContentLoaded', () => {
  const page_size = sessionStorage.getItem('page_size') || 10;
  if (!sessionStorage.getItem('brandName')) {
    sessionStorage.setItem('brandName', 'ALL');
  }
  getBrands();
  getCategories();
  getUser();
  page_size_container.innerHTML = page_size;
  if (sessionStorage.getItem('brandName') !== 'ALL') {
    getProductsByBrand();
  } else {
    getProductsAll();
  }
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
    fetch('https://api.everrest.educata.dev/shop/cart', {
      headers: {
        authorization: `Bearer ${getToken()}`,
      },
    })
      .then((res) => res.json())
      .then((cart) => {
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
