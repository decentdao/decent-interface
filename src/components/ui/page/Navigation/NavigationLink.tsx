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
  scope,
}: {
  labelKey: string;
  NavigationIcon: Icon;
  t: TFunction;
  isActive: boolean;
  scope: 'internal' | 'external';
}) {
  return (
    <Box p="0.25rem">
      <Flex
        py={2}
        pl="7px"
        borderRadius={{ md: 4 }}
        _hover={{ bgColor: 'neutral-3' }}
        borderWidth={scope === 'internal' ? '1px' : '0px'}
        borderColor={scope === 'internal' && isActive ? 'neutral-4' : 'neutral-2'}
        bgColor={scope === 'internal' && isActive ? 'neutral-3' : undefined}
      >
        <Box w={6}>{<NavigationIcon size={24} />}</Box>
        <Box
          mx={3}
          whiteSpace="nowrap"
        >
          {t(labelKey)}
        </Box>
      </Flex>
    </Box>
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
      scope={scope}
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
