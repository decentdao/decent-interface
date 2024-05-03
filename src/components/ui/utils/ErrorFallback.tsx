import { Box, Button, Center, Flex, Icon, Text } from '@chakra-ui/react';
import { Warning } from "@phosphor-icons/react";
import { useTranslation } from 'react-i18next';
import { CONTENT_HEIGHT } from '../../../constants/common';
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
            gap="1.5rem"
          >
            <Icon as={Warning} color="red-0" boxSize="4rem" />
            <Text
              textStyle="display-xl"
              color="lilac-0"
            >
              {t('errorSentryFallbackTitle')}
            </Text>
            <Text textStyle="body-base">
              {t('errorSentryFallbackMessage')}
            </Text>
            <Button onClick={() => window.location.reload()}>{t('reload')}</Button>
          </Flex>
        </InfoBox>
      </Box>
    </Center>
  );
}
