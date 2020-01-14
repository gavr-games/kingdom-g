<template>
  <div id="arena-my-profile">
    <div class="heading">- {{ $t("profile.profile") }} -</div>
    <a href="#" class="red-button" @click="exitArena">{{ $t("arena.game.exit") }}</a>
  </div>
</template>

<script>
import logoutUser from "../../lib/concepts/user/operations/logout";

export default {
  data() {
    return {};
  },
  created() {},
  beforeDestroy() {},
  methods: {
    exitArena() {
      logoutUser();
    }
  }
};
</script>

<style lang="scss">
#arena-my-profile {
}
</style>