'use client';

import { Button, Center, Text, VStack, ChakraProvider, extendTheme } from '@chakra-ui/react';
import { theme } from '@decent-org/fractal-ui';
import Script from 'next/script';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNetwork } from 'wagmi';
import { APP_NAME } from '../constants/common';
import useDAOController from '../hooks/DAO/useDAOController';
import useDAOMetadata from '../hooks/DAO/useDAOMetadata';
import { useFractal } from '../providers/App/AppProvider';
import {
  disconnectedChain,
  supportedChains,
} from '../providers/NetworkConfig/NetworkConfigProvider';

function InvalidSafe() {
  const { chain } = useNetwork();
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
        <Text>{t('invalidSafe1', { chain: chain ? chain.name : disconnectedChain.name })}</Text>
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

export default function DAOController({ children }: { children: React.ReactNode }) {
  const { node } = useFractal();
  const { nodeLoading, errorLoading } = useDAOController();
  const daoMetadata = useDAOMetadata();
  const { chain } = useNetwork();
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
  } else if (!chain) {
    // if we're disconnected
    if (nodeLoading || validSafe || !errorLoading) {
      display = children;
    } else {
      display = <InvalidSafe />;
    }
  } else {
    // if we're connected
    const invalidChain = !supportedChains.map(c => c.chainId).includes(chain.id);
    if (invalidChain) {
      display = <InvalidChain />;
    } else if (nodeLoading || validSafe || !errorLoading) {
      display = children;
    } else {
      display = <InvalidSafe />;
    }
  }

  return (
    <>
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
    </>
  );
}
