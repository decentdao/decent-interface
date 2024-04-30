import { Box, Flex } from '@chakra-ui/react';
import { Icon } from '@phosphor-icons/react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Link, useMatch } from 'react-router-dom';

function LinkContent({
  labelKey,
  NavigationIcon,
  t,
  isActive,
}: {
  labelKey: string;
  NavigationIcon: Icon;
  t: TFunction;
  isActive: boolean;
}) {
  return (
    <Flex
      py={3}
      pl="11px"
      borderRadius={{ md: 8 }}
      _hover={{ bgColor: 'neutral-3' }}
      borderWidth={isActive ? '1px' : '0px'}
      borderColor="neutral-4"
      bgColor={isActive ? 'neutral-3' : 'auto'}
    >
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
  const isActive = useMatch(href.substring(0, href.indexOf('?')));

  const linkContent = (
    <LinkContent
      labelKey={labelKey}
      NavigationIcon={NavigationIcon}
      t={t}
      isActive={!!isActive}
    />
  );

  if (scope === 'internal') {
    return (
      <Link
        data-testid={testId}
        aria-label={t(labelKey)}
        to={href}
        onClick={closeDrawer}
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
      >
        {linkContent}
      </a>
    );
  }

  return null;
}
