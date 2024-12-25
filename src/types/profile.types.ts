export interface GameAccount {
  gameName: string;
  gameId: string;
  inGameName: string;
}

export interface Profile {
  username: string;
  email: string;
  gameAccounts: GameAccount[];
}
