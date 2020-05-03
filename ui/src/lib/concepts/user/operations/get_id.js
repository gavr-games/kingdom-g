export default function() {
  let localStorage = window.localStorage;
  let id = localStorage.getItem("id");
  return id;
}
