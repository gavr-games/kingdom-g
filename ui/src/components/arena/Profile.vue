<template>
  <div
    id="arena-profile"
    v-bind:class="['profile-overlay', showProfile ? 'active' : '']"
  >
    <div class="profile-container">
      <a href="#" class="close-profile" @click="hideProfileWindow"></a>
      <div class="content">
        <div class="left-col">
          <div class="avatar">
            <div class="default-avatar"></div>
          </div>
          <div class="login">
            {{ login }}
          </div>
        </div>
        <div class="right-col">
          <div class="stats-heading">{{ $t("profile.statistics") }}</div>
          <div
            class="stats-mode"
            v-for="modStat in stats"
            v-bind:key="modStat.mode_name"
          >
            <div class="row">
              <div class="stat-name">{{ $t("profile.mode") }}:</div>
              <div class="stat-value">{{ modStat.mode_name }}</div>
            </div>
            <div class="row">
              <div class="stat-name">{{ $t("profile.total_games") }}:</div>
              <div class="stat-value">{{ modStat.games_played }}</div>
            </div>
            <div class="row">
              <div class="stat-name">{{ $t("profile.victories") }}:</div>
              <div class="stat-value">{{ modStat.win }}</div>
            </div>
            <div class="row">
              <div class="stat-name">{{ $t("profile.defeats") }}:</div>
              <div class="stat-value">{{ modStat.lose }}</div>
            </div>
            <div class="row">
              <div class="stat-name">{{ $t("profile.draws") }}:</div>
              <div class="stat-value">{{ modStat.draw }}</div>
            </div>
            <div class="row">
              <div class="stat-name">{{ $t("profile.left_the_game") }}:</div>
              <div class="stat-value">{{ modStat.exit }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//import { EventBus } from "../../lib/event_bus";

export default {
  data() {
    return {
      showProfile: false,
      avatarFilename: "",
      lastPlayedGame: null,
      login: "",
      stats: []
    };
  },
  created() {},
  beforeDestroy() {},
  methods: {
    showProfileWindow(playerId) {
      // Send get profile
      console.log(playerId);
    },
    hideProfileWindow() {
      this.showProfile = false;
    }
  }
};
</script>

<style lang="scss">
.profile-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  transition: opacity 500ms;
  visibility: hidden;
  opacity: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  &.active {
    visibility: visible;
    opacity: 1;
  }
  .profile-container {
    width: 506px;
    height: 503px;
    background: center url("../../assets/profile_window_background.png")
      no-repeat;
    transition: all 1s ease-in-out;
    .close-profile {
      opacity: 0.5;
      display: block;
      position: relative;
      background: url("../../assets/close_button.png") no-repeat;
      width: 29px;
      height: 28px;
      left: 380px;
      top: 105px;
      &:hover {
        opacity: 1;
      }
    }
    .content {
      padding: 110px 110px 50px 100px;
      display: flex;
      flex-direction: row;
      .left-col {
        width: 120px;
        display: flex;
        flex-direction: column;
      }
      .right-col {
        height: 180px;
        overflow-y: scroll;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .login {
        font-size: 16px;
        text-align: center;
      }
      .avatar {
        width: 120px;
        height: 120px;
        background: center url("../../assets/profile_avatar_border.png")
          no-repeat;
        .default-avatar {
          width: 120px;
          height: 120px;
          background: center url("../../assets/guest_user.png") no-repeat;
        }
      }
      .stats-heading {
        font-size: 14px;
        text-align: center;
      }
      .stats-mode {
        margin-left: 10px;
        margin-top: 10px;
        .row {
          display: flex;
          flex-direction: row;
          font-size: 10px;
          .stat-name {
            width: 100px;
          }
        }
      }
    }
  }
}
</style>
