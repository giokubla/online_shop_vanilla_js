import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Cookies from 'js-cookie';
const form = document.querySelector('form');
const feedBack = document.getElementById('feedback');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let formValue = Object.fromEntries(new FormData(e.target));
  fetch('https://api.everrest.educata.dev/auth/sign_in', {
    method: 'POST',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formValue),
  })
    .then((res) => {
      if (res.ok) return res.json();
      return res.json().then((error) => {
        throw error;
      });
    })
    .then(({ access_token, refresh_token }) => {
      console.log(access_token, refresh_token);
      Cookies.set('authToken', access_token);
      window.location.href = '/';
    })
    .catch((err) => {
      feedBack.classList.add('d-block');
      feedBack.innerHTML = err.error;
      console.log(err);
    });
});
export function getToken() {
  return Cookies.get('authToken');
}
export function isAuthenticated() {
  return !!Cookies.get('authToken');
}
export function logOut() {
  localStorage.removeItem('user');
  Cookies.remove('authToken');
}
