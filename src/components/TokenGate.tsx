import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { TextButton } from './ui/forms/Button';

type POAPEvent = {
  [id: string]: number;
};

type POAPApiResponse = {
  [event: string]: POAPEvent;
};

function ToastContent({
  message,
  actionLabel,
  action,
}: {
  message: string;
  actionLabel: string;
  action: any;
}) {
  return (
    <div className="flex flex-col items-center">
      <div>{message}</div>
      <TextButton
        label={actionLabel}
        onClick={action}
      />
    </div>
  );
}

/**
 * @param featureName a string describing the feature being gated
 * @param alwaysRequireConnected whether this feature should continue to require a connected wallet, even on production
 * @returns null the component can display a Toast notification, but doesn't itself render anything
 */
function TokenGate({
  featureName,
  alwaysRequireConnected,
}: {
  featureName: string;
  alwaysRequireConnected: boolean;
}) {
  const {
    state: { account },
    connect,
  } = useWeb3Provider();

  const poapId = process.env.REACT_APP_POAP_GATE_ID;
  const poapDetails = useCallback(async () => {
    if (!account) return;

    const url = `https://api.poap.tech/actions/scan/${account}/${poapId}`;
    const { data } = await axios.get<POAPApiResponse>(url, {
      headers: {
        accept: 'application/json',
        'X-API-Key': process.env.REACT_APP_POAP_API_KEY!,
      },
    });
    return data;
  }, [account, poapId]);

  // TODO does this cache time make sense?
  const tenMin = 10 * 60 * 1000;
  const { data } = useQuery(['poapAccess:' + account], poapDetails, {
    refetchInterval: tenMin,
    staleTime: tenMin,
  });

  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'menu']);

  useEffect(() => {
    let message: string, actionLabel: string, action;
    if (!account && (process.env.NODE_ENV === 'development' || alwaysRequireConnected)) {
      message = t('tokenGateNotConnectedMessage', { feature: featureName });
      actionLabel = t('connectWallet', { ns: 'menu' });
      action = connect;
    } else if (process.env.NODE_ENV === 'development' && data?.event?.id != Number(poapId)) {
      message = t('tokenGateNoPOAPMessage', { feature: featureName });
      actionLabel = t('tokenGateActionNoPOAP');
      action = () => window.open(process.env.REACT_APP_POAP_GATE_SIGNUP_URL, '_blank');
    } else {
      // we are both connected and have the POAP (or are on production)
      return;
    }

    // redirect out of here
    navigate('/');

    toast(
      <ToastContent
        message={message}
        actionLabel={actionLabel}
        action={action}
      />,
      {
        autoClose: 5000,
      }
    );
  }, [account, navigate, data, poapId, featureName, t, connect, alwaysRequireConnected]);

  return null;
}

export default TokenGate;
