import { FractalAccount } from './../../../types/fractal';
import { AccountAction, AccountActions } from './action';

export const initialAccountState: FractalAccount = {
  favorites: {
    favoritesList: [],
    isConnectedFavorited: false,
    // update to actual function
    toggleFavorite: (key: string) => {},
  },
};
export const accountReducer = (state: FractalAccount, action: AccountActions) => {
  const { votesToken, favorites } = state;
  switch (action.type) {
    case AccountAction.SET_FAVORITES:
      return {
        ...state,
        favorites: { ...favorites, favoritesList: action.payload },
      };
    case AccountAction.UPDATE_FAVORITE:
      // @todo update this to add or remove favorite
      return {
        ...state,
        favorites: { ...favorites, favoritesList: [action.payload] },
      };
    case AccountAction.SET_VOTES_TOKEN:
      return { ...state, votesToken: action.payload };
    case AccountAction.UPDATE_TOKEN_BALANCE:
      return { ...state, votesToken: { ...votesToken!, balance: action.payload } };
    case AccountAction.UPDATE_TOKEN_VOTING_WEIGHT:
      return { ...state, votesToken: { ...votesToken!, votingWeight: action.payload } };
    case AccountAction.UPDATE_VOTING_DELEGATEE:
      return { ...state, votesToken: { ...votesToken!, delegatee: action.payload } };
    case AccountAction.RESET:
      return initialAccountState;
    default:
      return state;
  }
};
