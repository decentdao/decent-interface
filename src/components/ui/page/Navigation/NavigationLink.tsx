import { Box, Flex } from '@chakra-ui/react';
import { Icon } from '@phosphor-icons/react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function LinkContent({
  labelKey,
  NavigationIcon,
  t,
}: {
  labelKey: string;
  NavigationIcon: Icon;
  t: TFunction<'navigation', undefined>;
}) {
  return (
    <Flex>
      <Box w={6}>{<NavigationIcon size={24} />}</Box>
      <Box
        mx={3}
        whiteSpace="nowrap"
      >
        {t(labelKey)}
      </Box>
    </Flex>
  );
}

export function NavigationLink({
  href,
  labelKey,
  testId,
  NavigationIcon,
  scope,
  closeDrawer,
  ...rest
}: {
  href: string;
  labelKey: string;
  testId: string;
  NavigationIcon: Icon;
  scope: 'internal' | 'external';
  closeDrawer?: () => void;
}) {
  const { t } = useTranslation('navigation');

  const linkContent = (
    <LinkContent
      labelKey={labelKey}
      NavigationIcon={NavigationIcon}
      t={t}
    />
  );

  if (scope === 'internal') {
    return (
      <Link
        data-testid={testId}
        aria-label={t(labelKey)}
        to={href}
        onClick={closeDrawer}
        style={{ display: 'block', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
        {...rest}
      >
        {linkContent}
      </Link>
    );
  }

  if (scope === 'external') {
    return (
      <a
        data-testid={testId}
        aria-label={t(labelKey)}
        href={href}
        onClick={closeDrawer}
        {...rest}
        target="_blank"
        rel="noreferrer noopener"
        style={{ display: 'block', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
      >
        {linkContent}
      </a>
    );
  }

  return null;
}
