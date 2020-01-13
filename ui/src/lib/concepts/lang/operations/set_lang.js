export default function(lang) {
  let localStorage = window.localStorage;
  if (lang != "en" && lang != "ru") {
    lang = "end";
  }
  localStorage.setItem("lang", lang);
}
