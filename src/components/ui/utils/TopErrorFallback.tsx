import { Box, Button, Center, Flex, Text, Link, Icon } from '@chakra-ui/react';
import { Warning } from '@phosphor-icons/react'
import { Trans, useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT, CONTENT_HEIGHT } from '../../../constants/common';
import { URL_DISCORD } from '../../../constants/url';

export function TopErrorFallback() {
  const { t } = useTranslation();
  return (
    <Center h={CONTENT_HEIGHT}>
      <Box maxWidth="fit-content">
        <Box
          minWidth="100%"
          h="100%"
          minHeight="10.6rem"
          bg={BACKGROUND_SEMI_TRANSPARENT}
          p="1rem"
          borderRadius="0.5rem"
        >
          <Flex
            alignItems="center"
            direction="column"
            padding="1rem"
          >
            <Icon as={Warning} boxSize="2rem" />
            <Text
              textStyle="display-2xl"
              marginTop="1.5rem"
              marginBottom="1.5rem"
            >
              {t('errorSentryFallbackTitle')}
            </Text>
            <Text marginBottom="1.5rem">
              <Trans i18nKey="errorSentryFallbackMessage">
                placeholder
                <Link
                  color="celery-0"
                  href={URL_DISCORD}
                  target="_blank"
                />
              </Trans>
            </Text>
            <Button onClick={() => window.location.reload()}>{t('reload')}</Button>
          </Flex>
        </Box>
      </Box>
    </Center>
  );
}
