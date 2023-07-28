'use client';

import { Button, Center, Text, VStack } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNetwork } from 'wagmi';
import ClientOnly from '../../../src/components/ui/utils/ClientOnly';
import { APP_NAME } from '../../../src/constants/common';
import useDAOController from '../../../src/hooks/DAO/useDAOController';
import { useFractal } from '../../../src/providers/App/AppProvider';
import { supportedChains } from '../../../src/providers/NetworkConfig/NetworkConfigProvider';

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
        <Text>{t('invalidSafe1', { chain: chain?.name })}</Text>
        <Text paddingBottom="1rem">{t('invalidSafe2')}</Text>
        <Button
          onClick={() => {
            window.location.reload();
          }}
        >
          {t('refresh')}
        </Button>
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
  const loading = useDAOController({ daoAddress });
  const { chain } = useNetwork();

  const validSafe = node.safe;
  let display;

  if (!chain) {
    // if we're disconnected
    if (loading || validSafe) {
      display = children;
    } else {
      display = <InvalidSafe />;
    }
  } else {
    // if we're connected
    const invalidChain = !supportedChains.map(c => c.chainId).includes(chain.id);
    if (invalidChain) {
      display = <InvalidChain />;
    } else if (loading || validSafe) {
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
