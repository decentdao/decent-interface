import { Center, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNetworkConfig } from '../providers/NetworkConfig/NetworkConfigProvider';

function LoadingProblem({ type }: { type: 'invalidSafe' | 'wrongNetwork' | 'badQueryParam' }) {
  const { chain } = useNetworkConfig();
  const { t } = useTranslation('common');

  return (
    <Center
      padding="3rem"
      textColor="neutral-7"
    >
      <VStack>
        <Text
          paddingTop="3rem"
          textStyle="text-6xl-mono-regular"
        >
          {t('errorSentryFallbackTitle')}
        </Text>
        <Text>{t(`${type}1`, { chain: chain.name })}</Text>
        <Text paddingBottom="1rem">{t(`${type}2`)}</Text>
      </VStack>
    </Center>
  );
}

export default LoadingProblem;
