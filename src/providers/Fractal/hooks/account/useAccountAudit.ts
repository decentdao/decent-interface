import { useEffect, useState, useCallback } from 'react';
import { AccountAction } from '../../constants/actions';
import { CacheExpiry, CacheKeys, useLocalStorage } from './useLocalStorage';

interface IUseAccountAudit {
  safeAddress?: string;
  accountDispatch: any;
}

export const useAccountAudit = ({ accountDispatch }: IUseAccountAudit) => {
  const { setValue, getValue } = useLocalStorage();
  const [hasAccepted, setAcceptedAudit] = useState<boolean>(
    getValue(CacheKeys.AUDIT_WARNING_SHOWN)
  );

  const acceptAuditWarning = useCallback(() => {
    setValue(CacheKeys.AUDIT_WARNING_SHOWN, true, CacheExpiry.NEVER);
    setAcceptedAudit(true);
  }, [setValue]);

  useEffect(() => {
    accountDispatch({
      type: AccountAction.UPDATE_AUDIT_MESSAGE,
      payload: {
        hasAccepted,
        acceptAuditWarning,
      },
    });
  }, [hasAccepted, acceptAuditWarning, accountDispatch]);
};
