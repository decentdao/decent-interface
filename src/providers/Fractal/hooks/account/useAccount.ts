import { useAccountAudit } from './useAccountAudit';
import { useAccountFavorites } from './useAccountFavorites';

interface IUseAccount {
  safeAddress?: string;
  accountDispatch: any;
}

export const useAccount = ({ safeAddress, accountDispatch }: IUseAccount) => {
  useAccountFavorites({
    safeAddress,
    accountDispatch,
  });

  useAccountAudit({
    safeAddress,
    accountDispatch,
  });
};
