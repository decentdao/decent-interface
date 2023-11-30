'use client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { theme } from '@decent-org/fractal-ui';
import { useMemo } from 'react';
import { Activities } from '../../../src/components/pages/DaoDashboard/Activities';
import { ERCO20Claim } from '../../../src/components/pages/DaoDashboard/ERC20Claim';
import { Info } from '../../../src/components/pages/DaoDashboard/Info';
import InfoHeader from '../../../src/components/pages/DaoDashboard/Info/InfoHeader';
import ClientOnly from '../../../src/components/ui/utils/ClientOnly';
import useDAOMetadata from '../../../src/hooks/DAO/useDAOMetadata';

export default function DaoDashboardPage() {
  const daoMetadata = useDAOMetadata();
  const activeTheme = useMemo(() => {
    if (daoMetadata && daoMetadata.bodyBackground) {
      return extendTheme({
        ...theme,
        styles: {
          ...theme.styles,
          global: {
            ...theme.styles.global,
            html: {
              ...theme.styles.global.html,
              background: daoMetadata.bodyBackground,
            },
            body: {
              ...theme.styles.global.body,
              background: daoMetadata.bodyBackground,
            },
          },
        },
      });
    }
    return theme;
  }, [daoMetadata]);

  return (
    <ChakraProvider theme={activeTheme}>
      <InfoHeader />
      <ClientOnly mt={!!daoMetadata ? 8 : 12}>
        <Info />
        <ERCO20Claim />
        <Activities />
      </ClientOnly>
    </ChakraProvider>
  );
}
