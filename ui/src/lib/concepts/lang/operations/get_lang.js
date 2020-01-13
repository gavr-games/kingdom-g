export default function() {
  let localStorage = window.localStorage;
  let lang = localStorage.getItem("lang");
  if (lang != "en" && lang != "ru") {
    lang = "en";
  }
  return lang;
}
