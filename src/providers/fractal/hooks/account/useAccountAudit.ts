import { useEffect, useState, useCallback } from 'react';
import { AccountAction } from './../../constants/actions';
import { CacheKeys } from './useLocalStorage';

interface IUseAccountAudit {
  safeAddress?: string;
  accountDispatch: any;
}

export const useAccountAudit = ({ accountDispatch }: IUseAccountAudit) => {
  const [hasAccepted, setAcceptedAudit] = useState<boolean>();

  const acceptAudit = useCallback(() => {
    localStorage.setItem(CacheKeys.AUDIT, JSON.stringify(true));
    setAcceptedAudit(true);
  }, []);

  useEffect(() => {
    const cachedValue = localStorage.getItem(CacheKeys.AUDIT);
    let updatedAudit = false;
    if (cachedValue) {
      const parseValue = JSON.parse(cachedValue);
      updatedAudit = parseValue;
    }
    setAcceptedAudit(updatedAudit);
  }, []);

  useEffect(() => {
    accountDispatch({
      type: AccountAction.UPDATE_AUDIT_MESSAGE,
      payload: {
        hasAccepted,
        acceptAudit,
      },
    });
  }, [hasAccepted, acceptAudit, accountDispatch]);
};
