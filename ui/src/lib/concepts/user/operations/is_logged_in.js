export default function() {
  let localStorage = window.localStorage;
  let token = localStorage.getItem("token");
  return token != null;
}
