import { Center, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../constants/common';
import { useNetworkConfig } from '../providers/NetworkConfig/NetworkConfigProvider';

function LoadingProblem({ type }: { type: 'invalidSafe' | 'wrongNetwork' | 'badQueryParam' }) {
  const { chain } = useNetworkConfig();
  const { t } = useTranslation('common');

  return (
    <Center
      padding="3rem"
      textColor="neutral-7"
    >
      <VStack padding="3rem" bg={BACKGROUND_SEMI_TRANSPARENT}>
        <Text
          textStyle="display-2xl"
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
