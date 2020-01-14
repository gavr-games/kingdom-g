<template>
  <div id="arena-players-list-cont">
    <div class="heading">- {{ $t("arena.chat.arena") }} -</div>
    <div id="arena-players-list-search"></div>
    <div id="arena-players-list-th">
      <div class="level">{{ $t("arena.players.level") }}</div>
      <div class="nickname">{{ $t("arena.players.nickname") }}</div>
    </div>
    <div id="arena-players-list">
      <div
        class="arena-player"
        v-for="player in players"
        v-bind:key="player.user_id"
      >
        <div class="level">1</div>
        <div class="nickname" @click="showPlayerProfile(player.user_id)">
          {{ player.nick }}
        </div>
        <div class="status">
          {{ player.status_id }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from "../../lib/event_bus";
import { mapState, mapActions } from "vuex";

export default {
  computed: mapState({
    players: state => state.players.all
  }),
  data() {
    return {};
  },
  created() {},
  beforeDestroy() {},
  methods: {
    ...mapActions("players", [
      "addPlayer",
      "removePlayer",
      "updatePlayer",
      "setPlayers"
    ]),
    showPlayerProfile(playerId) {
      EventBus.$emit("show-player-profile", playerId);
    }
  }
};
</script>

<style lang="scss">
#arena-players-list-cont {
  background: 55px 50px url("../../assets/playerlist_vertical_line.png")
    no-repeat;
}
#arena-players-list {
  height: 254px;
  overflow-y: scroll;
  overflow-x: hidden;
  margin-bottom: 8px;
}
#arena-players-list-search {
  margin-top: 7px;
  height: 18px;
  background: right url("../../assets/playerlist_search_background.png")
    no-repeat;
}
#arena-players-list-th {
  height: 20px;
  display: flex;
  color: white;
  font-size: 10px;
  line-height: 20px;
  border-bottom: 2px solid rgba($color: #ffffff, $alpha: 0.1);
  padding-bottom: 5px;
  .level {
    padding-top: 5px;
    padding-bottom: 5px;
    flex: 2;
    text-align: center;
  }
  .nickname {
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 20px;
    flex: 9;
  }
}
.arena-player {
  color: white;
  display: flex;
  font-size: 10px;
  line-height: 20px;
  border-bottom: 2px solid rgba($color: #ffffff, $alpha: 0.1);
  .level {
    padding-top: 5px;
    padding-bottom: 5px;
    flex: 2;
    text-align: center;
  }
  .nickname {
    cursor: pointer;
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 20px;
    flex: 8;
  }
  .status {
    flex: 1;
  }
}
</style>
