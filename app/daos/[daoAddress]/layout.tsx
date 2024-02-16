'use client';

import { Button, Center, Text, VStack, ChakraProvider, extendTheme, Box } from '@chakra-ui/react';
import { theme } from '@decent-org/fractal-ui';
import Script from 'next/script';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useChainId, useClient } from 'wagmi';
import { APP_NAME } from '../../../src/constants/common';
import useDAOController from '../../../src/hooks/DAO/useDAOController';
import useDAOMetadata from '../../../src/hooks/DAO/useDAOMetadata';
import { useFractal } from '../../../src/providers/App/AppProvider';
import {
  disconnectedChain,
  supportedChains,
} from '../../../src/providers/NetworkConfig/NetworkConfigProvider';

function InvalidSafe() {
  const client = useClient();
  const { t } = useTranslation('common');
  return (
    <Center
      padding="3rem"
      textColor="grayscale.100"
    >
      <VStack>
        <Text
          paddingTop="3rem"
          textStyle="text-6xl-mono-regular"
        >
          {t('errorSentryFallbackTitle')}
        </Text>
        <Text>
          {t('invalidSafe1', { chain: client ? client.chain.name : disconnectedChain.name })}
        </Text>
        <Text paddingBottom="1rem">{t('invalidSafe2')}</Text>
        <Button onClick={() => window.location.reload()}>{t('refresh')}</Button>
      </VStack>
    </Center>
  );
}

function InvalidChain() {
  const { t } = useTranslation(['common', 'menu']);
  const supportedChainNames = supportedChains.map(c => c.name).join(', ');
  return (
    <Center
      padding="3rem"
      textColor="grayscale.100"
    >
      <VStack>
        <Text
          paddingTop="3rem"
          textStyle="text-6xl-mono-regular"
        >
          {t('errorSentryFallbackTitle')}
        </Text>
        <Text paddingBottom="1rem">{t('invalidChain')}</Text>
        <Text paddingBottom="1rem">
          {t('toastSwitchChain', { ns: 'menu', chainNames: supportedChainNames })}
        </Text>
      </VStack>
    </Center>
  );
}

export default function DaoPageLayout({
  children,
  params: { daoAddress },
}: {
  children: ReactNode;
  params: { daoAddress?: string };
}) {
  const { node } = useFractal();
  const { nodeLoading, reloadingDAO, errorLoading } = useDAOController({ daoAddress });
  const daoMetadata = useDAOMetadata();
  const chainId = useChainId();
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
              background: 'none',
            },
          },
        },
      });
    }
    return theme;
  }, [daoMetadata]);

  const validSafe = node.safe;
  let display;
  const childrenDisplay = <ChakraProvider theme={activeTheme}>{children}</ChakraProvider>;

  if (process.env.NEXT_PUBLIC_TESTING_ENVIRONMENT) {
    display = childrenDisplay;
  } else if (!chainId) {
    // if we're disconnected
    if (nodeLoading || reloadingDAO || validSafe || !errorLoading) {
      display = children;
    } else {
      display = <InvalidSafe />;
    }
  } else {
    // if we're connected
    const invalidChain = !supportedChains.map(c => c.chainId).includes(chainId);
    if (invalidChain) {
      display = <InvalidChain />;
    } else if (nodeLoading || reloadingDAO || validSafe || !errorLoading) {
      display = children;
    } else {
      display = <InvalidSafe />;
    }
  }

  return (
    <Box>
      <title>{node?.daoName ? `${node.daoName} | ${APP_NAME}` : APP_NAME}</title>
      {node && node.daoAddress === '0x167bE4073f52aD2Aa0D6d6FeddF0F1f79a82B98e' && (
        <Script
          id="ethlizards-hotjar-tracking"
          strategy="afterInteractive"
        >
          {`(function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:3776270,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
        </Script>
      )}
      {display}
    </Box>
  );
}
