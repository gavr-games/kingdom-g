import GameState from "@/lib/game/game_state";

class PlayersPanelState {
  get players() {
    return window.client.api.get_player_ids().map(id => {
      let enginePlayer = window.client.api.get_player(id);
      let activePlayerId = window.client.api.get_active_player();
      enginePlayer.active = id === activePlayerId;
      let gamePlayer = GameState.players.find(p => p.id === id);
      return {
        ...enginePlayer,
        ...gamePlayer
      };
    });
  }
}

export default PlayersPanelState;
