import { Flex, Link, Tooltip, Image } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { URL_DECENT } from '../../../constants/url';
import ExternalLink, { ExtrernalLinkWrappable } from '../links/ExternalLink';

export function Footer() {
  const { t } = useTranslation('home');
  const commitHash = import.meta.env.VITE_APP_GIT_HASH;
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
        <Tooltip
          placement="top"
          label={t('currentBuild', { hash: commitHash })}
        >
          <ExtrernalLinkWrappable
            href={`https://github.com/decentdao/decent-interface/commit/${commitHash}`}
          >
            {commitHash.substring(0, 7)}
          </ExtrernalLinkWrappable>
        </Tooltip>
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
