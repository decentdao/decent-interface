import { Box, Hide, Text, Flex } from '@chakra-ui/react';
import { Icon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

interface INavigationLink {
  tooltipKey: string;
  ariaLabelKey: string;
  href: string;
  testId: string;
  routeKey?: string;
  NavigationIcon: Icon;
  closeDrawer?: () => void;
}

export function NavigationExternalLink({
  tooltipKey,
  ariaLabelKey,
  testId,
  NavigationIcon,
  routeKey,
  closeDrawer,
  ...rest
}: INavigationLink) {
  const { t } = useTranslation('navigation');

  return (
    <Box py={3}>
      <a
        data-testid={testId}
        aria-label={t(ariaLabelKey)}
        {...rest}
        onClick={closeDrawer}
        target="_blank"
        rel="noreferrer noopener"
      >
        <Flex>
          <Box w={6}>{<NavigationIcon size={24} />}</Box>
          <Box
            mx={3}
            whiteSpace="nowrap"
          >
            {t(tooltipKey)}
          </Box>
          <Hide above="md">
            <Text textStyle="text-md-mono-medium">{t(tooltipKey)}</Text>
          </Hide>
        </Flex>
      </a>
    </Box>
  );
}
