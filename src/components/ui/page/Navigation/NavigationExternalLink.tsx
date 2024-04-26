import { Box, Hide, Text, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface INavigationLink {
  tooltipKey: string;
  ariaLabelKey: string;
  href: string;
  testId: string;
  routeKey?: string;
  Icon: JSX.Element;
  closeDrawer?: () => void;
}

export function NavigationExternalLink({
  tooltipKey,
  ariaLabelKey,
  testId,
  Icon,
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
          <Box w={6}>{Icon}</Box>
          <Box
            mx={3}
            whiteSpace={'nowrap'}
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
