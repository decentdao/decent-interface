import { Box, Button, Center, Flex, Text, Icon } from '@chakra-ui/react';
import { Warning } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { CONTENT_HEIGHT } from '../../../constants/common';

export function TopErrorFallback() {
  const { t } = useTranslation();
  return (
    <Center h={CONTENT_HEIGHT}>
      <Box maxWidth="fit-content">
        <Box
          minWidth="100%"
          h="100%"
          minHeight="10.6rem"
          bg="black.900-semi-transparent"
          p="1rem"
          borderRadius="0.5rem"
        >
          <Flex
            alignItems="center"
            direction="column"
            padding="1rem"
            gap="1.5rem"
          >
            <Icon
              as={Warning}
              boxSize="2rem"
            />
            <Text
              textStyle="display-2xl"
              marginTop="1.5rem"
              marginBottom="1.5rem"
            >
              {t('errorSentryFallbackTitle')}
            </Text>
            <Text textStyle="body-base">
              {t('errorSentryFallbackMessage')}
            </Text>
            <Button onClick={() => window.location.reload()}>{t('reload')}</Button>
          </Flex>
        </Box>
      </Box>
    </Center>
  );
}
