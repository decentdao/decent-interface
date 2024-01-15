'use client';

import { Button, Center, Text, VStack, ChakraProvider, extendTheme } from '@chakra-ui/react';
import { theme } from '@decent-org/fractal-ui';
import { ReactNode, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useNetwork } from 'wagmi';
import ClientOnly from '../../../src/components/ui/utils/ClientOnly';
import { APP_NAME } from '../../../src/constants/common';
import useDAOController from '../../../src/hooks/DAO/useDAOController';
import useDAOMetadata from '../../../src/hooks/DAO/useDAOMetadata';
import { useFractal } from '../../../src/providers/App/AppProvider';
import {
  disconnectedChain,
  supportedChains,
} from '../../../src/providers/NetworkConfig/NetworkConfigProvider';

function InvalidSafe() {
  const { chain } = useNetwork();
  const { t } = useTranslation('common');
  const router = useRouter();
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
        <Button onClick={router.refresh}>{t('refresh')}</Button>
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
  const { nodeLoading, reloadingDAO } = useDAOController({ daoAddress });
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
    if (nodeLoading || reloadingDAO || validSafe) {
      display = children;
    } else {
      display = <InvalidSafe />;
    }
  } else {
    // if we're connected
    const invalidChain = !supportedChains.map(c => c.chainId).includes(chain.id);
    if (invalidChain) {
      display = <InvalidChain />;
    } else if (nodeLoading || reloadingDAO || validSafe) {
      display = children;
    } else {
      display = <InvalidSafe />;
    }
  }

  return (
    <ClientOnly>
      <title>{node?.daoName ? `${node.daoName} | ${APP_NAME}` : APP_NAME}</title>
      {display}
    </ClientOnly>
  );
}
