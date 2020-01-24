<template>
  <div id="arena-games-list">
    <div class="heading">- {{ $t("arena.gamelist.game_list") }} -</div>
    <table>
      <tr>
        <th>{{ $t("arena.gamelist.creator") }}</th>
        <th>{{ $t("arena.gamelist.name") }}</th>
        <th>{{ $t("arena.gamelist.mode") }}</th>
        <th>{{ $t("arena.gamelist.players_count") }}</th>
        <th>{{ $t("arena.gamelist.observers_count") }}</th>
        <th></th>
        <th></th>
      </tr>
      <tr
        class="arena-list-game"
        v-for="game in games"
        v-bind:key="game.game_id"
      >
        <td>{{ game.owner.username }}</td>
        <td>{{ game.title }}</td>
        <td>{{ game.mode_id }}</td>
        <td>{{ game.player_count }}</td>
        <td>{{ game.spectator_count }}</td>
        <td>
          <div
            v-bind:class="[
              'pass-flag',
              parseInt(game.pass_flag) == 1 ? 'closed' : 'open'
            ]"
          />
        </td>
        <td>
          <a href="#" class="join-game" @click="joinGame(game.id)"></a>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import { EventBus } from "../../lib/event_bus";

export default {
  data() {
    return {
      games: []
    };
  },
  created() {
    this.$WSClient.sendMsg("arena", {
      action: "get_games",
      data: {}
    });
    EventBus.$on("received-arena-msg", this.handleArenaMsg);
    EventBus.$on("received-arena-error", this.handleArenaError);
  },
  beforeDestroy() {
    EventBus.$off("received-arena-msg", this.handleArenaMsg);
    EventBus.$off("received-arena-error", this.handleArenaError);
  },
  methods: {
    joinGame(gameId) {
      this.$WSClient.sendMsg("arena", {
        action: "join_game",
        data: {
          game_id: gameId
        }
      });
    },
    handleArenaMsg(payload) {
      if (payload["action"] == "get_games") {
        this.games = payload.data;
      }
    },
    handleArenaError(payload) {
      console.log(payload);
    }
  }
};
</script>

<style lang="scss">
#arena-games-list {
  table {
    margin-top: 20px;
    color: rgb(218, 228, 240);
    font-size: 14px;
    th,
    td {
      border-bottom: 2px solid rgba($color: #ffffff, $alpha: 0.1);
    }
    th {
      font-size: 11px;
    }
    td {
      border-right: 2px solid rgba($color: #ffffff, $alpha: 0.1);
    }
  }

  .pass-flag {
    &.open {
      width: 20px;
      height: 20px;
      background: right url("../../assets/arena_open_game_icon.png") no-repeat;
    }
    &.closed {
      width: 14px;
      height: 18px;
      background: right url("../../assets/arena_closed_game_icon.png") no-repeat;
    }
  }

  .join-game {
    display: block;
    width: 19px;
    height: 19px;
    background: right url("../../assets/arena_join_game_icon.png") no-repeat;
  }
}
</style>
