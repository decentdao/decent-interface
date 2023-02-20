import { useEffect, useState, useCallback } from 'react';
import { AccountAction } from '../../constants/actions';
import { CacheKeys, useLocalStorage } from './useLocalStorage';

interface IUseAccountAudit {
  safeAddress?: string;
  accountDispatch: any;
}

export const useAccountAudit = ({ accountDispatch }: IUseAccountAudit) => {
  const [hasAccepted, setAcceptedAudit] = useState<boolean>();
  const { setValue, getValue } = useLocalStorage();

  const acceptAudit = useCallback(() => {
    setValue(CacheKeys.AUDIT, JSON.stringify(true));
    setAcceptedAudit(true);
  }, [setValue]);

  useEffect(() => {
    const cachedValue = getValue(CacheKeys.AUDIT);
    let updatedAudit = false;
    if (cachedValue) {
      const parseValue = JSON.parse(cachedValue);
      updatedAudit = parseValue;
    }
    setAcceptedAudit(updatedAudit);
  }, [getValue]);

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
