import { Button, Box, Flex, Text, Image, Hide, Show } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BASE_ROUTES } from '../../../constants/routes';

export function TopErrorFallback() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Flex
      alignItems="center"
      justifyContent="center"
    >
      <Box
        borderRadius="0.5rem"
        bg="neutral-2"
        py="2rem"
        px={{ base: '1.25rem', md: '2rem' }}
      >
        <Flex gap="4rem">
          <Flex
            flexDir="column"
            gap="1rem"
            justifyContent="center"
          >
            <Text textStyle="display-4xl">{t('errorSentryFallbackTitle')}</Text>
            <Text textStyle="display-xl">{t('errorSentryFallbackMessage')}</Text>
            <Flex
              flexDir="column"
              gap="1rem"
            >
              <Hide above="md">
                <Image
                  src="/images/tools.svg"
                  alt={t('errorSentryFallbackTitle')}
                  w="60%"
                  mx="auto"
                />
              </Hide>
              <Button
                w="fit-content"
                mx={{ base: 'auto', md: 'unset' }}
                onClick={() => navigate(BASE_ROUTES.landing)}
              >
                {t('goHome')}
              </Button>
            </Flex>
          </Flex>
          <Show above="md">
            <Image
              src="/images/tools.svg"
              alt={t('errorSentryFallbackTitle')}
              width="50%"
            />
          </Show>
        </Flex>
      </Box>
    </Flex>
  );
}
