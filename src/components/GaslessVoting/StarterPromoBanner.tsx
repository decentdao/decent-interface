import { Flex, Image, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export function StarterPromoBanner() {
  const { t } = useTranslation('gaslessVoting');

  return (
    <Flex
      borderRadius="0.75rem"
      border="1px solid"
      borderColor="cosmic-nebula-4"
      bg="cosmic-nebula-5"
      p={4}
      display="flex"
      gap="1.5rem"
      alignItems="center"
    >
      <Image
        src="/images/sponsoredPromo.svg"
        alt=""
        width="3.7165rem"
        height="3.7165rem"
      />
      <Flex direction="column">
        <Text
          textStyle="labels-large"
          color="cosmic-nebula--1"
          fontWeight="bold"
        >
          {t('starterPromoTitle')}
        </Text>
        <Text
          textStyle="labels-large"
          color="cosmic-nebula--1"
        >
          {t('starterPromoDescription')}
        </Text>
      </Flex>
    </Flex>
  );
}
