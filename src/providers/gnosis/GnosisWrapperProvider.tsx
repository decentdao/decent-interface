import { GnosisWrapperContext } from './hooks/useGnosisWrapper';

import { ReactNode, useMemo } from 'react';
import useGnosisWrapperContract from './hooks/useGnosisWrapperContract';
import useGnosisSafeAddress from './hooks/useGnosisSafeAddress';

export function GnosisWrapperProvider({
  moduleAddress,
  children,
}: {
  moduleAddress: string | null;
  children: ReactNode;
}) {
  const gnosisWrapperContract = useGnosisWrapperContract(moduleAddress);
  const gnosisSafeAddress = useGnosisSafeAddress(gnosisWrapperContract);

  const value = useMemo(
    () => ({
      gnosisWrapperContract,
      gnosisSafeAddress,
    }),
    [gnosisWrapperContract, gnosisSafeAddress]
  );
  return <GnosisWrapperContext.Provider value={value}>{children}</GnosisWrapperContext.Provider>;
}
