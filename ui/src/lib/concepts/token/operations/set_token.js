export default function(token) {
  let localStorage = window.localStorage;
  localStorage.setItem("token", token);
}
