export default function(context, payload) {
  if (payload.location == "arena") {
    context.$router.push("arena");
  }
  if (payload.location == "game") {
    context.$router.push("game");
  }
}
