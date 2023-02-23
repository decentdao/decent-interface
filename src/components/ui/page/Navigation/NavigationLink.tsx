import { Box, ComponentWithAs, Hide, IconProps, Text } from '@chakra-ui/react';
import { constants } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useMatch } from 'react-router-dom';
import { DAO_ROUTES } from '../../../../routes/constants';
import { NavigationTooltip } from './NavigationTooltip';

interface INavigationLink {
  to: string;
  labelKey: string;
  tooltipKey?: string;
  testId: string;
  routeKey?: string;
  Icon: ComponentWithAs<'svg', IconProps>;
  target?: string;
  rel?: string;
  closeDrawer?: () => void;
}

export function NavigationLink({
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
  const patternString = !routeKey
    ? constants.AddressZero
    : routeKey === 'dao'
    ? 'daos/:address'
    : `daos/:address/${DAO_ROUTES[routeKey].path}/*`;
  const match = useMatch(patternString);

  const activeColors = useCallback(() => {
    let isActive = !!match;
    return {
      color: isActive ? 'gold.500' : 'inherit',
      _hover: {
        color: isActive ? 'gold.500-hover' : 'inherit',
      },
    };
  }, [match]);

  return (
    <NavigationTooltip label={t(tooltipTranslationKey)}>
      <Link
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
