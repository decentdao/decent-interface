'use client';

import { Activities } from '../../../src/components/pages/DaoDashboard/Activities';
import { ERCO20Claim } from '../../../src/components/pages/DaoDashboard/ERC20Claim';
import { Info } from '../../../src/components/pages/DaoDashboard/Info';
import InfoHeader from '../../../src/components/pages/DaoDashboard/Info/InfoHeader';
import ClientOnly from '../../../src/components/ui/utils/ClientOnly';
import useDAOMetadata from '../../../src/hooks/DAO/useDAOMetadata';

export default function DaoDashboardPage() {
  const daoMetadata = useDAOMetadata();

  return (
    <>
      <InfoHeader />
      <ClientOnly mt={!!daoMetadata ? 40 : 12}>
        <Info />
        <ERCO20Claim />
        <Activities />
      </ClientOnly>
    </>
  );
}
