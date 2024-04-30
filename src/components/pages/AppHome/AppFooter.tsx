import { Box, BoxProps, Flex, Link, Spacer, Text } from '@chakra-ui/react';
import { Trans, useTranslation } from 'react-i18next';
import { URL_DECENT } from '../../../constants/url';
import ExternalLink from '../../ui/links/ExternalLink';
import Divider from '../../ui/utils/Divider';

export function AppFooter({ ...rest }: BoxProps) {
  const { t } = useTranslation('home');
  return (
    <Box
      w="100%"
      {...rest}
    >
      <Divider paddingTop="2.5rem" />
      <Flex paddingTop="2rem">
        <Text>
          <Trans
            t={t}
            i18nKey="homeAttribution"
          >
            Made with 💜 by
            <Link
              target="_blank"
              rel="noreferrer"
              textDecoration="underline"
              href={URL_DECENT}
            >
              Decent DAO
            </Link>
          </Trans>
        </Text>
        <Spacer />
        <ExternalLink href="/docs/fractal_audit.pdf">{t('audit')}</ExternalLink>
        <Text
          paddingStart="1rem"
          paddingEnd="1rem"
        >
          |
        </Text>
        <ExternalLink
          href={
            'https://github.com/decentdao/decent-interface/commit/' +
            import.meta.env.VITE_APP_GIT_HASH
          }
          textStyle="text-sm-mono-bold"
        >
          {import.meta.env.VITE_APP_GIT_HASH.substring(0, 7)}
        </ExternalLink>
      </Flex>
    </Box>
  );
}
