import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { URL_DECENT } from '../../../constants/url';
import ExternalLink, { ExtrernalLinkWrappable } from '../links/ExternalLink';
import { DecentFooterLogo } from '../proposal/Icons';

export function Footer() {
  const { t } = useTranslation('home');
  const commitHash = import.meta.env.VITE_APP_GIT_HASH;
  return (
    <Flex
      w="100%"
      flexWrap="wrap"
      alignSelf="flex-end"
      justifyContent="center"
      py="1rem"
      px="3rem"
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
      <Flex
        backgroundImage="/images/footer-logo-border.svg"
        alignItems="center"
        justifyContent="center"
        gap="0.5rem"
        height="38px"
        width="278px"
      >
        <Text
          color="neutral-6"
          as="span"
        >
          {t('homeAttribution')}
        </Text>
        <Flex
          as="a"
          target="_blank"
          rel="noreferrer"
          textDecoration="none"
          href={URL_DECENT}
          color="neutral-6"
          alignItems="center"
          gap="0.5rem"
        >
          <DecentFooterLogo />
          <Text
            as="span"
            color="neutral-7"
          >
            DAO
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}
