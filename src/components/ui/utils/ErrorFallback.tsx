import { Link } from '@chakra-ui/next-js';
import { Box, Button, Center, Flex, Text } from '@chakra-ui/react';
import { Alert } from '@decent-org/fractal-ui';
import { Trans, useTranslation } from 'react-i18next';
import { CONTENT_HEIGHT } from '../../../constants/common';
import { URL_DISCORD } from '../../../constants/url';
import { InfoBox } from '../containers/InfoBox';

export function ErrorFallback() {
  const { t } = useTranslation();
  return (
    <Center h={CONTENT_HEIGHT}>
      <Box maxWidth="fit-content">
        <InfoBox>
          <Flex
            alignItems="center"
            direction="column"
            padding="1rem"
          >
            <Alert />
            <Text
              textStyle="text-2xl-mono-regular"
              color="grayscale.100"
              marginTop="1.5rem"
              marginBottom="1.5rem"
            >
              {t('errorSentryFallbackTitle')}
            </Text>
            <Text marginBottom="1.5rem">
              <Trans i18nKey="errorSentryFallbackMessage">
                placeholder
                <Link
                  color="gold.500"
                  href={URL_DISCORD}
                  target="_blank"
                />
              </Trans>
            </Text>
            <Button onClick={() => window.location.reload()}>{t('reload')}</Button>
          </Flex>
        </InfoBox>
      </Box>
    </Center>
  );
}
