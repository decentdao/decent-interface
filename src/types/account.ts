export interface IConnectedAccount {
  favorites: IFavorites;
  audit: IAudit;
}

export interface IAudit {
  hasAccepted?: boolean;
  acceptAuditWarning: () => void;
}

export interface IFavorites {
  favoritesList: string[];
  isConnectedFavorited: boolean;
  toggleFavorite: (key: string) => void;
}
