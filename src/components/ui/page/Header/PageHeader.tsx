import {
  Box,
  Button,
  ComponentWithAs,
  Divider,
  Flex,
  IconButton,
  IconProps,
  Spacer,
} from '@chakra-ui/react';
import { ReactNode, useMemo } from 'react';
import useDAOName from '../../../../hooks/DAO/useDAOName';
import { useFractal } from '../../../../providers/Fractal/hooks/useFractal';
import { DAO_ROUTES } from '../../../../routes/constants';
import Breadcrumbs, { Crumb } from './Breadcrumbs';
interface IPageHeader {
  breadcrumbs: Crumb[];
  hasDAOLink?: boolean;
  buttonVariant?: 'text' | 'secondary';
  ButtonIcon?: ComponentWithAs<'svg', IconProps>;
  buttonText?: string;
  buttonClick?: () => void;
  buttonTestId?: string;
  isButtonDisabled?: boolean;
  children?: ReactNode;
}
/**
 * A component which displays a page title and an optional action button.
 * Intended to be used as the main title for a page.
 */
function PageHeader({
  breadcrumbs,
  hasDAOLink = true,
  buttonVariant,
  ButtonIcon,
  buttonText,
  buttonClick,
  buttonTestId,
  isButtonDisabled,
  children,
}: IPageHeader) {
  const {
    gnosis: {
      safe: { address },
      daoName,
    },
  } = useFractal();
  const { daoRegistryName } = useDAOName({
    address,
  });

  const links = useMemo(
    () => [
      {
        title: daoRegistryName || daoName,
        path: DAO_ROUTES.dao.relative(address),
      },
      ...breadcrumbs,
    ],
    [address, daoRegistryName, daoName, breadcrumbs]
  );

  if (!hasDAOLink) {
    links.shift();
  }

  return (
    <Box
      marginTop="3rem"
      marginBottom="2rem"
    >
      <Flex
        w="full"
        align="center"
      >
        <Breadcrumbs links={links} />
        <Spacer />
        {buttonText && (
          <Button
            onClick={buttonClick}
            data-testid={buttonTestId}
            size="base"
            variant={buttonVariant}
            disabled={isButtonDisabled}
          >
            {buttonText}
          </Button>
        )}
        {ButtonIcon && (
          <IconButton
            aria-label="navigate"
            icon={<ButtonIcon boxSize="1.5rem" />}
            onClick={buttonClick}
            minWidth="0"
            px="1rem"
            data-testid={buttonTestId}
            size="base"
            variant={buttonVariant}
            disabled={isButtonDisabled}
          >
            {buttonText}
          </IconButton>
        )}
        {children}
      </Flex>
      <Divider
        marginTop="1rem"
        borderColor="chocolate.400"
      />
    </Box>
  );
}
export default PageHeader;
