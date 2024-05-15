import { Box, Button, Center, Flex, Text, Image } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { CONTENT_HEIGHT } from '../../../constants/common';

export function TopErrorFallback() {
  const { t } = useTranslation();
  return (
    <Center h={CONTENT_HEIGHT}>
      <Box
        borderRadius="0.5rem"
        overflow="hidden"
        bg="neutral-2"
        my="12.8rem"
        ml="9.44rem"
        mr="9.5rem"
      >
        <Flex ml="3.06rem">
          <Flex
            mt="5.37rem"
            mr="7.16rem"
            flexDir="column"
            gap="0.5rem"
          >
            <Text textStyle="display-4xl">{t('errorSentryFallbackTitle')}</Text>
            <Text textStyle="display-xl">{t('errorSentryFallbackMessage')}</Text>
            <Button
              mr="5.84rem"
              mt="1rem"
              onClick={() => window.location.reload()}
            >
              {t('goHome')}
            </Button>
          </Flex>
          <Image
            mt="1.56rem"
            mr="3.19rem"
            p="0"
            fit="cover"
            src="/images/tools.svg"
            alt="Something went wrong"
          />
        </Flex>
      </Box>
    </Center>
  );
}
