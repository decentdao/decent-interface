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
      alignSelf="flex-end"
      justifyContent="center"
      p="3rem"
      pt="1.5rem"
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
          width="279px"
          height="38px"
          alt="Made with love by Decent DAO"
        />
      </Link>
    </Flex>
  );
}
