import { Box, Hide, Text, Flex } from '@chakra-ui/react';
import { Icon } from '@phosphor-icons/react';
import { TFunction } from 'i18next';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function LinkContainer({ link }: { link: ReactElement }) {
  return <Box py={3}>{link}</Box>;
}

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
      <Hide above="md">
        <Text textStyle="text-md-mono-medium">{t(labelKey)}</Text>
      </Hide>
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
      <LinkContainer
        link={
          <Link
            data-testid={testId}
            aria-label={t(labelKey)}
            to={href}
            onClick={closeDrawer}
            {...rest}
          >
            {linkContent}
          </Link>
        }
      />
    );
  }

  if (scope === 'external') {
    return (
      <LinkContainer
        link={
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
        }
      />
    );
  }

  return null;
}
