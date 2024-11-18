import * as amplitude from '@amplitude/analytics-browser';
import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Layout } from '../Layout';

const useUserTracking = () => {
  const { address } = useAccount();

  useEffect(() => {
    Sentry.setUser(address ? { id: address } : null);
    if (address) {
      amplitude.setUserId(address);
    } else {
      amplitude.reset();
    }
  }, [address]);
};

export function Global() {
  useUserTracking();
  return <Layout />;
}
