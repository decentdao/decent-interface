import { Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { URL_DECENT } from '../../../constants/url';
import ExternalLink from '../../ui/links/ExternalLink';
import { DecentFooterLogo } from '../../ui/proposal/Icons';

export function AppFooter() {
  const { t } = useTranslation('home');
  const commitHash = import.meta.env.VITE_APP_GIT_HASH;
  return (
    <Flex
      w="100%"
      flexWrap="wrap"
      alignSelf="flex-end"
      justifyContent="flex-end"
      py="1rem"
      mt="2rem"
    >
      <ExternalLink href="/docs/fractal_audit.pdf">{t('audit')}</ExternalLink>
      <ExternalLink href={`https://github.com/decentdao/decent-interface/commit/${commitHash}`}>
        {commitHash.substring(0, 7)}
      </ExternalLink>
      <Flex
        alignItems="center"
        ml="2rem"
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
          ml="0.5rem"
          alignItems="center"
        >
          {/* @todo This should be replaced with proper logo that will include DAO word */}
          <DecentFooterLogo />
          <Text
            display="inline-flex"
            pt="2px"
            ml="0.25rem"
          >
            DAO
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}
