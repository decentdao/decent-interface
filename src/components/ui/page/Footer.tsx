import { Flex, Link, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { URL_DECENT } from '../../../constants/url';
import ExternalLink from '../links/ExternalLink';

export function Footer() {
  const { t } = useTranslation('home');
  return (
    <Flex
      w="100%"
      flexWrap="wrap"
      justifyContent={{ base: 'flex-start', md: 'center' }}
      alignItems="center"
      gap={{ base: 4, md: 8 }}
    >
      <Flex gap={4}>
        <ExternalLink href="/docs/fractal_audit.pdf">{t('audit')}</ExternalLink>
        <ExternalLink
          href={`https://github.com/decentdao/decent-interface/releases/tag/v${import.meta.env.PACKAGE_VERSION}`}
        >
          v{import.meta.env.PACKAGE_VERSION}
        </ExternalLink>
      </Flex>
      <Link
        mx={{ base: '0.75rem', md: '0rem' }}
        target="_blank"
        rel="noreferrer"
        href={URL_DECENT}
      >
        <Text
          fontSize="1.2rem"
          color="neutral-6"
        >
          {t('madeWithLove')}
        </Text>
      </Link>
    </Flex>
  );
}
