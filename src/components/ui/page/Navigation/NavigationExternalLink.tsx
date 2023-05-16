import { Box, ComponentWithAs, Hide, IconProps, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NavigationTooltip } from './NavigationTooltip';

interface INavigationLink {
  tooltipKey: string;
  ariaLabelKey: string;
  href: string;
  testId: string;
  routeKey?: string;
  Icon: ComponentWithAs<'svg', IconProps>;
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
    <NavigationTooltip label={t(tooltipKey)}>
      <a
        data-testid={testId}
        aria-label={t(ariaLabelKey)}
        {...rest}
        onClick={closeDrawer}
        target="_blank"
        rel="noreferrer noopener"
      >
        <Box
          display={{ base: 'flex', md: undefined }}
          gap={8}
          justifyContent="space-between"
          alignItems="center"
        >
          <Icon boxSize="1.5rem" />
          <Hide above="md">
            <Text textStyle="text-md-mono-medium">{t(tooltipKey)}</Text>
          </Hide>
        </Box>
      </a>
    </NavigationTooltip>
  );
}
