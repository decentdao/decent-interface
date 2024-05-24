import { Flex, Link, Image } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { URL_DECENT } from '../../../constants/url';
import ExternalLink from '../links/ExternalLink';

export function Footer() {
  const { t } = useTranslation('home');
  return (
    <Flex
      w="100%"
      flexWrap="wrap"
      justifyContent="center"
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
        target="_blank"
        rel="noreferrer"
        href={URL_DECENT}
      >
        <Image
          src="/images/footer-logo.svg"
          alt="Made with love by Decent DAO"
        />
      </Link>
    </Flex>
  );
}
