import { Box, ComponentWithAs, Hide, IconProps, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NavigationTooltip } from './NavigationTooltip';

interface INavigationLink {
  href: string;
  labelKey: string;
  tooltipKey?: string;
  testId: string;
  routeKey?: string;
  Icon: ComponentWithAs<'svg', IconProps>;
  target?: string;
  rel?: string;
  closeDrawer?: () => void;
}

export function NavigationExternalLink({
  labelKey,
  testId,
  Icon,
  routeKey,
  tooltipKey,
  closeDrawer,
  ...rest
}: INavigationLink) {
  const tooltipTranslationKey = tooltipKey || labelKey;

  const { t } = useTranslation('navigation');

  return (
    <NavigationTooltip label={t(tooltipTranslationKey)}>
      <a
        data-testid={testId}
        aria-label={t(tooltipTranslationKey)}
        {...rest}
        onClick={closeDrawer}
      >
        <Box
          display={{ base: 'flex', md: undefined }}
          gap={8}
          justifyContent="space-between"
          alignItems="center"
        >
          <Icon boxSize="1.5rem" />
          <Hide above="md">
            <Text textStyle="text-md-mono-medium">{t(labelKey)}</Text>
          </Hide>
        </Box>
      </a>
    </NavigationTooltip>
  );
}
