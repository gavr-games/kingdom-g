const IDLE = 0,
  MY_TURN = 1,
  NOT_MY_TURN = 2;

class GameState {
  init(gameData, myUserId) {
    this.gameData = gameData;
    this.userId = myUserId;
    this.state = IDLE;
    this.setDefaultState();
  }

  setDefaultState() {
    if (this.getMyPlayerId() == window.client.api.get_active_player()) {
      this.state = MY_TURN;
    } else {
      this.state = NOT_MY_TURN;
    }
  }

  getMyPlayerId() {
    let player = this.gameData.players.find(
      p => p.user_id === parseInt(this.userId)
    );
    return player.id;
  }

  isMyTurn() {
    return this.state == MY_TURN;
  }

  get players() {
    return this.gameData.players;
  }
}

const gameState = new GameState();

export default gameState;
