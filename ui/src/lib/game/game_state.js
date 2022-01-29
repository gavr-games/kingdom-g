class GameState {
  init(gameData, myUserId) {
    this.gameData = gameData;
    this.userId = myUserId;
  }

  getMyPlayerId() {
    let player = this.gameData.players.find(
      p => p.user_id === parseInt(this.userId)
    );
    return player.id;
  }

  isMyTurn() {
    return window.client.api
      .get_active_players()
      .includes(this.getMyPlayerId());
  }

  get players() {
    return this.gameData.players;
  }
}

const gameState = new GameState();

export default gameState;
