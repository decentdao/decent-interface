import { Box, ComponentWithAs, Hide, IconProps, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { NavigationTooltip } from './NavigationTooltip';

interface INavigationLink {
  href: string;
  labelKey: string;
  tooltipKey?: string;
  testId: string;
  Icon: ComponentWithAs<'svg', IconProps>;
  target?: string;
  rel?: string;
  closeDrawer?: () => void;
}

export function NavigationLink({
  labelKey,
  testId,
  Icon,
  tooltipKey,
  closeDrawer,
  href,
  ...rest
}: INavigationLink) {
  const tooltipTranslationKey = tooltipKey || labelKey;

  const { t } = useTranslation('navigation');
  const pathname = usePathname();
  const isActive = pathname === href;

  const activeColors = useCallback(() => {
    return {
      color: isActive ? 'gold.500' : 'inherit',
      _hover: {
        color: isActive ? 'gold.500-hover' : 'inherit',
      },
    };
  }, [isActive]);

  return (
    <NavigationTooltip label={t(tooltipTranslationKey)}>
      <Link
        data-testid={testId}
        aria-label={t(tooltipTranslationKey)}
        href={href}
        {...rest}
        onClick={closeDrawer}
      >
        <Box
          display={{ base: 'flex', md: undefined }}
          gap={8}
          justifyContent="space-between"
          alignItems="center"
        >
          <Icon
            boxSize="1.5rem"
            {...activeColors()}
          />
          <Hide above="md">
            <Text textStyle="text-md-mono-medium">{t(labelKey)}</Text>
          </Hide>
        </Box>
      </Link>
    </NavigationTooltip>
  );
}
